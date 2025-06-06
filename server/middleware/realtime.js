// Real-time WebSocket implementation for live updates
const { Server } = require("socket.io")

function setupRealtime(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  console.log("🔄 Setting up real-time WebSocket connections...")

  io.on("connection", (socket) => {
    console.log(`👤 User connected: ${socket.id}`)

    // Join camera room for live feeds
    socket.on("join-camera", (cameraId) => {
      socket.join(`camera-${cameraId}`)
      console.log(`📹 User ${socket.id} joined camera ${cameraId}`)
    })

    // Leave camera room
    socket.on("leave-camera", (cameraId) => {
      socket.leave(`camera-${cameraId}`)
      console.log(`📹 User ${socket.id} left camera ${cameraId}`)
    })

    // Join dashboard for live updates
    socket.on("join-dashboard", () => {
      socket.join("dashboard")
      console.log(`📊 User ${socket.id} joined dashboard updates`)
    })

    // Handle face recognition events
    socket.on("face-detected", (data) => {
      console.log(`🔍 Face detected: ${data.employeeId} at camera ${data.cameraId}`)

      // Broadcast to dashboard users
      io.to("dashboard").emit("attendance-update", {
        type: "face_detected",
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        cameraId: data.cameraId,
        timestamp: new Date(),
        confidence: data.confidence,
      })

      // Broadcast to camera viewers
      io.to(`camera-${data.cameraId}`).emit("face-recognition-result", data)
    })

    // Handle attendance updates
    socket.on("attendance-recorded", (data) => {
      console.log(`✅ Attendance recorded: ${data.employeeId}`)

      io.to("dashboard").emit("attendance-update", {
        type: "attendance_recorded",
        ...data,
        timestamp: new Date(),
      })
    })

    // Handle camera status updates
    socket.on("camera-status-change", (data) => {
      console.log(`📹 Camera ${data.cameraId} status: ${data.status}`)

      io.to("dashboard").emit("camera-status-update", {
        cameraId: data.cameraId,
        status: data.status,
        timestamp: new Date(),
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`👤 User disconnected: ${socket.id}`)
    })
  })

  // Broadcast functions for server-side events
  const broadcast = {
    faceDetected: (data) => {
      io.to("dashboard").emit("attendance-update", {
        type: "face_detected",
        ...data,
        timestamp: new Date(),
      })
    },

    attendanceRecorded: (data) => {
      io.to("dashboard").emit("attendance-update", {
        type: "attendance_recorded",
        ...data,
        timestamp: new Date(),
      })
    },

    cameraStatusChanged: (cameraId, status) => {
      io.to("dashboard").emit("camera-status-update", {
        cameraId,
        status,
        timestamp: new Date(),
      })
    },

    systemAlert: (message, type = "info") => {
      io.to("dashboard").emit("system-alert", {
        message,
        type,
        timestamp: new Date(),
      })
    },
  }

  return { io, broadcast }
}

module.exports = setupRealtime
