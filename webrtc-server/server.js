// WebRTC Signaling Server for Live Camera Streams
const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8080

// Store active camera streams and viewers
const activeStreams = new Map()
const cameraViewers = new Map()

console.log("🎥 WebRTC Signaling Server starting...")

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    activeStreams: activeStreams.size,
    totalViewers: Array.from(cameraViewers.values()).reduce((sum, viewers) => sum + viewers.size, 0),
    timestamp: new Date().toISOString(),
  })
})

// Get active streams
app.get("/api/streams", (req, res) => {
  const streams = Array.from(activeStreams.entries()).map(([cameraId, streamData]) => ({
    cameraId,
    ...streamData,
    viewers: cameraViewers.get(cameraId)?.size || 0,
  }))

  res.json({ streams })
})

io.on("connection", (socket) => {
  console.log(`📱 Client connected: ${socket.id}`)

  // Handle camera stream publishing
  socket.on("publish-stream", (data) => {
    const { cameraId, streamInfo } = data
    console.log(`📹 Publishing stream for camera ${cameraId}`)

    // Store stream information
    activeStreams.set(cameraId, {
      publisherId: socket.id,
      streamInfo,
      startTime: new Date(),
      quality: streamInfo.quality || "720p",
      fps: streamInfo.fps || 30,
    })

    // Initialize viewers set for this camera
    if (!cameraViewers.has(cameraId)) {
      cameraViewers.set(cameraId, new Set())
    }

    socket.join(`camera-${cameraId}`)
    socket.cameraId = cameraId
    socket.role = "publisher"

    // Notify all clients about new stream
    io.emit("stream-available", {
      cameraId,
      quality: streamInfo.quality,
      fps: streamInfo.fps,
    })

    socket.emit("publish-success", { cameraId })
  })

  // Handle viewer joining a camera stream
  socket.on("join-stream", (data) => {
    const { cameraId } = data
    console.log(`👁️  Viewer ${socket.id} joining camera ${cameraId}`)

    if (!activeStreams.has(cameraId)) {
      socket.emit("stream-error", { error: "Stream not available" })
      return
    }

    socket.join(`camera-${cameraId}`)
    socket.cameraId = cameraId
    socket.role = "viewer"

    // Add to viewers set
    if (!cameraViewers.has(cameraId)) {
      cameraViewers.set(cameraId, new Set())
    }
    cameraViewers.get(cameraId).add(socket.id)

    // Get publisher socket
    const streamData = activeStreams.get(cameraId)
    const publisherSocket = io.sockets.sockets.get(streamData.publisherId)

    if (publisherSocket) {
      // Notify publisher about new viewer
      publisherSocket.emit("viewer-joined", {
        viewerId: socket.id,
        cameraId,
      })

      // Send stream info to viewer
      socket.emit("stream-ready", {
        cameraId,
        streamInfo: streamData.streamInfo,
      })
    }

    // Update viewer count
    io.to(`camera-${cameraId}`).emit("viewer-count-update", {
      cameraId,
      count: cameraViewers.get(cameraId).size,
    })
  })

  // Handle WebRTC signaling
  socket.on("webrtc-offer", (data) => {
    const { cameraId, offer, targetId } = data
    console.log(`🤝 WebRTC offer for camera ${cameraId}`)

    if (targetId) {
      // Send offer to specific target
      socket.to(targetId).emit("webrtc-offer", {
        cameraId,
        offer,
        senderId: socket.id,
      })
    } else {
      // Broadcast to camera room
      socket.to(`camera-${cameraId}`).emit("webrtc-offer", {
        cameraId,
        offer,
        senderId: socket.id,
      })
    }
  })

  socket.on("webrtc-answer", (data) => {
    const { cameraId, answer, targetId } = data
    console.log(`✅ WebRTC answer for camera ${cameraId}`)

    socket.to(targetId).emit("webrtc-answer", {
      cameraId,
      answer,
      senderId: socket.id,
    })
  })

  socket.on("webrtc-ice-candidate", (data) => {
    const { cameraId, candidate, targetId } = data

    if (targetId) {
      socket.to(targetId).emit("webrtc-ice-candidate", {
        cameraId,
        candidate,
        senderId: socket.id,
      })
    } else {
      socket.to(`camera-${cameraId}`).emit("webrtc-ice-candidate", {
        cameraId,
        candidate,
        senderId: socket.id,
      })
    }
  })

  // Handle stream quality change
  socket.on("change-quality", (data) => {
    const { cameraId, quality } = data

    if (activeStreams.has(cameraId) && socket.role === "publisher") {
      const streamData = activeStreams.get(cameraId)
      streamData.streamInfo.quality = quality

      // Notify all viewers
      io.to(`camera-${cameraId}`).emit("quality-changed", {
        cameraId,
        quality,
      })
    }
  })

  // Handle face detection results
  socket.on("face-detection-result", (data) => {
    const { cameraId, detections } = data
    console.log(`🔍 Face detection result for camera ${cameraId}: ${detections.length} faces`)

    // Broadcast to all viewers of this camera
    io.to(`camera-${cameraId}`).emit("face-detection-overlay", {
      cameraId,
      detections,
      timestamp: new Date(),
    })

    // Send to main application for attendance processing
    io.emit("face-detection-data", {
      cameraId,
      detections,
      timestamp: new Date(),
    })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`📱 Client disconnected: ${socket.id}`)

    if (socket.cameraId) {
      const cameraId = socket.cameraId

      if (socket.role === "publisher") {
        // Remove stream
        activeStreams.delete(cameraId)
        cameraViewers.delete(cameraId)

        // Notify all clients
        io.emit("stream-ended", { cameraId })
        console.log(`📹 Stream ended for camera ${cameraId}`)
      } else if (socket.role === "viewer") {
        // Remove from viewers
        const viewers = cameraViewers.get(cameraId)
        if (viewers) {
          viewers.delete(socket.id)

          // Update viewer count
          io.to(`camera-${cameraId}`).emit("viewer-count-update", {
            cameraId,
            count: viewers.size,
          })

          // Notify publisher
          const streamData = activeStreams.get(cameraId)
          if (streamData) {
            const publisherSocket = io.sockets.sockets.get(streamData.publisherId)
            if (publisherSocket) {
              publisherSocket.emit("viewer-left", {
                viewerId: socket.id,
                cameraId,
              })
            }
          }
        }
      }
    }
  })
})

// Periodic cleanup of inactive streams
setInterval(() => {
  const now = new Date()
  for (const [cameraId, streamData] of activeStreams.entries()) {
    const publisherSocket = io.sockets.sockets.get(streamData.publisherId)
    if (!publisherSocket) {
      console.log(`🧹 Cleaning up inactive stream for camera ${cameraId}`)
      activeStreams.delete(cameraId)
      cameraViewers.delete(cameraId)
      io.emit("stream-ended", { cameraId })
    }
  }
}, 30000) // Check every 30 seconds

server.listen(PORT, () => {
  console.log(`🎥 WebRTC Signaling Server running on port ${PORT}`)
  console.log(`📡 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`)
  console.log("🔄 Ready for camera streams and viewers")
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebRTC server...")
  server.close(() => {
    console.log("📡 WebRTC server closed")
    process.exit(0)
  })
})
