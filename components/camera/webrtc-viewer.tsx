"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"
import { io, type Socket } from "socket.io-client"

interface WebRTCViewerProps {
  cameraId: number
  cameraName: string
  onFaceDetection?: (detections: any[]) => void
}

export function WebRTCViewer({ cameraId, cameraName, onFaceDetection }: WebRTCViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [quality, setQuality] = useState("720p")
  const [faceDetections, setFaceDetections] = useState<any[]>([])

  useEffect(() => {
    initializeWebRTC()
    return () => {
      cleanup()
    }
  }, [cameraId])

  const initializeWebRTC = async () => {
    try {
      // Connect to WebRTC signaling server
      socketRef.current = io(process.env.NEXT_PUBLIC_WEBRTC_URL || "http://localhost:8080")

      socketRef.current.on("connect", () => {
        console.log("🔄 Connected to WebRTC signaling server")
        setIsConnected(true)
        joinStream()
      })

      socketRef.current.on("disconnect", () => {
        console.log("🔄 Disconnected from WebRTC signaling server")
        setIsConnected(false)
      })

      socketRef.current.on("stream-ready", async (data) => {
        console.log("📹 Stream ready for camera", data.cameraId)
        await setupPeerConnection()
      })

      socketRef.current.on("webrtc-offer", async (data) => {
        console.log("🤝 Received WebRTC offer")
        await handleOffer(data.offer, data.senderId)
      })

      socketRef.current.on("webrtc-answer", async (data) => {
        console.log("✅ Received WebRTC answer")
        await handleAnswer(data.answer)
      })

      socketRef.current.on("webrtc-ice-candidate", async (data) => {
        await handleIceCandidate(data.candidate)
      })

      socketRef.current.on("viewer-count-update", (data) => {
        if (data.cameraId === cameraId) {
          setViewerCount(data.count)
        }
      })

      socketRef.current.on("quality-changed", (data) => {
        if (data.cameraId === cameraId) {
          setQuality(data.quality)
        }
      })

      socketRef.current.on("face-detection-overlay", (data) => {
        if (data.cameraId === cameraId) {
          setFaceDetections(data.detections)
          onFaceDetection?.(data.detections)
          drawFaceDetections(data.detections)
        }
      })
    } catch (error) {
      console.error("WebRTC initialization error:", error)
    }
  }

  const joinStream = () => {
    if (socketRef.current) {
      socketRef.current.emit("join-stream", { cameraId })
    }
  }

  const setupPeerConnection = async () => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    }

    peerConnectionRef.current = new RTCPeerConnection(configuration)

    peerConnectionRef.current.ontrack = (event) => {
      console.log("📺 Received remote stream")
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0]
        setIsPlaying(true)
      }
    }

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc-ice-candidate", {
          cameraId,
          candidate: event.candidate,
        })
      }
    }

    peerConnectionRef.current.onconnectionstatechange = () => {
      const state = peerConnectionRef.current?.connectionState
      console.log("🔗 Connection state:", state)

      if (state === "connected") {
        setIsPlaying(true)
      } else if (state === "disconnected" || state === "failed") {
        setIsPlaying(false)
      }
    }

    // Create offer for viewing
    const offer = await peerConnectionRef.current.createOffer()
    await peerConnectionRef.current.setLocalDescription(offer)

    if (socketRef.current) {
      socketRef.current.emit("webrtc-offer", {
        cameraId,
        offer,
      })
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit, senderId: string) => {
    if (!peerConnectionRef.current) return

    await peerConnectionRef.current.setRemoteDescription(offer)
    const answer = await peerConnectionRef.current.createAnswer()
    await peerConnectionRef.current.setLocalDescription(answer)

    if (socketRef.current) {
      socketRef.current.emit("webrtc-answer", {
        cameraId,
        answer,
        targetId: senderId,
      })
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return
    await peerConnectionRef.current.setRemoteDescription(answer)
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return
    await peerConnectionRef.current.addIceCandidate(candidate)
  }

  const drawFaceDetections = (detections: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw face detection boxes
    detections.forEach((detection) => {
      const { x, y, width, height, confidence, name } = detection

      // Draw bounding box
      ctx.strokeStyle = confidence > 0.8 ? "#00ff00" : "#ffff00"
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)

      // Draw label background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(x, y - 25, width, 25)

      // Draw label text
      ctx.fillStyle = "#ffffff"
      ctx.font = "14px Arial"
      ctx.fillText(`${name} (${Math.round(confidence * 100)}%)`, x + 5, y - 8)
    })
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnected(false)
    setIsPlaying(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{cameraName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? "Live" : "Offline"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {quality}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Camera className="h-3 w-3" />
          <span>{viewerCount} viewers</span>
          {faceDetections.length > 0 && (
            <>
              <span>•</span>
              <span>{faceDetections.length} faces detected</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative aspect-video bg-gray-900">
          {/* Video element */}
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted={isMuted} />

          {/* Face detection overlay canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: "multiply" }}
          />

          {/* Loading overlay */}
          {!isPlaying && isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Connecting to stream...</p>
              </div>
            </div>
          )}

          {/* Offline overlay */}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-gray-400 text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Camera Offline</p>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Face detection indicators */}
          {faceDetections.length > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white">
                🔍 {faceDetections.length} face{faceDetections.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
