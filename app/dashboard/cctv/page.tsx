"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, RotateCcw, Users, Eye, Zap, Monitor } from "lucide-react"
import { apiClient } from "@/lib/api"
import { socketClient } from "@/lib/socket"
import { WebRTCViewer } from "@/components/camera/webrtc-viewer"

interface CameraData {
  cameraId: number
  name: string
  location: string
  ipAddress: string
  status: "online" | "offline"
  faceRecognitionEnabled: boolean
  lastPing?: string
}

interface FaceDetection {
  time: string
  person: string
  camera: string
  action: string
  confidence?: number
}

export default function CCTVPage() {
  const [cameras, setCameras] = useState<CameraData[]>([])
  const [recentDetections, setRecentDetections] = useState<FaceDetection[]>([])
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [streamingMode, setStreamingMode] = useState<"webrtc" | "mock">("webrtc")

  useEffect(() => {
    loadCameras()
    setupRealtimeUpdates()

    return () => {
      socketClient.off("face-recognition-result")
      socketClient.off("camera-status-update")
      cameras.forEach((camera) => {
        socketClient.leaveCamera(camera.cameraId)
      })
    }
  }, [])

  const loadCameras = async () => {
    try {
      const data = await apiClient.getCameras()
      setCameras(data)

      // Load mock recent detections
      setRecentDetections([
        { time: "09:15 AM", person: "John Smith", camera: "Main Entrance", action: "Entry", confidence: 0.95 },
        { time: "09:12 AM", person: "Sarah Johnson", camera: "Reception Area", action: "Entry", confidence: 0.88 },
        { time: "09:08 AM", person: "Mike Davis", camera: "Main Entrance", action: "Entry", confidence: 0.92 },
        { time: "09:05 AM", person: "Unknown Person", camera: "Parking Lot", action: "Detection", confidence: 0.65 },
      ])
    } catch (error) {
      console.error("Failed to load cameras:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeUpdates = () => {
    socketClient.connect()

    socketClient.on("face-recognition-result", (result: any) => {
      const newDetection: FaceDetection = {
        time: new Date().toLocaleTimeString(),
        person: result.name || "Unknown Person",
        camera: cameras.find((c) => c.cameraId === result.cameraId)?.name || `Camera ${result.cameraId}`,
        action: result.employeeId ? "Entry" : "Detection",
        confidence: result.confidence,
      }

      setRecentDetections((prev) => [newDetection, ...prev.slice(0, 9)])
    })

    socketClient.on("camera-status-update", (update: any) => {
      setCameras((prev) =>
        prev.map((camera) =>
          camera.cameraId === update.cameraId
            ? { ...camera, status: update.status, lastPing: new Date().toISOString() }
            : camera,
        ),
      )
    })
  }

  const handleFaceDetection = (cameraId: number, detections: any[]) => {
    // Process face detections from WebRTC stream
    detections.forEach((detection) => {
      if (detection.confidence > 0.8) {
        const newDetection: FaceDetection = {
          time: new Date().toLocaleTimeString(),
          person: detection.name || "Unknown Person",
          camera: cameras.find((c) => c.cameraId === cameraId)?.name || `Camera ${cameraId}`,
          action: detection.employeeId ? "Entry" : "Detection",
          confidence: detection.confidence,
        }

        setRecentDetections((prev) => [newDetection, ...prev.slice(0, 9)])

        // Emit to main application for attendance processing
        if (detection.employeeId) {
          socketClient.emitAttendanceRecorded({
            employeeId: detection.employeeId,
            action: "check_in",
            timestamp: new Date().toISOString(),
          })
        }
      }
    })
  }

  const refreshCameras = async () => {
    setIsLoading(true)
    await loadCameras()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const onlineCameras = cameras.filter((c) => c.status === "online").length
  const totalDetections = recentDetections.length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live CCTV Monitoring</h1>
          <p className="text-gray-600">Real-time surveillance with WebRTC streaming and AI face recognition</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={streamingMode === "webrtc" ? "default" : "outline"}
            onClick={() => setStreamingMode("webrtc")}
          >
            <Monitor className="h-4 w-4 mr-2" />
            WebRTC Mode
          </Button>
          <Button variant="outline" onClick={refreshCameras}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Streaming Mode Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                {streamingMode === "webrtc" ? "🔴 Live WebRTC Streaming Active" : "📹 Mock Camera Mode"}
              </p>
              <p className="text-sm text-blue-600">
                {streamingMode === "webrtc"
                  ? "Real-time video streams with face detection overlay"
                  : "Simulated camera feeds for development"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Camera className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {onlineCameras}/{cameras.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {cameras.length > 0 ? Math.round((onlineCameras / cameras.length) * 100) : 0}% operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebRTC Streams</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streamingMode === "webrtc" ? onlineCameras : 0}</div>
            <p className="text-xs text-muted-foreground">Live video feeds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detections Today</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDetections}</div>
            <p className="text-xs text-muted-foreground">Face recognitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Real-time analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Camera Feeds */}
      <Card>
        <CardHeader>
          <CardTitle>Live Camera Feeds</CardTitle>
          <CardDescription>
            {streamingMode === "webrtc"
              ? "Real-time WebRTC video streams with AI-powered face recognition overlay"
              : "Simulated camera feeds for development and testing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map((camera) => (
              <div key={camera.cameraId}>
                {streamingMode === "webrtc" && camera.status === "online" ? (
                  <WebRTCViewer
                    cameraId={camera.cameraId}
                    cameraName={camera.name}
                    onFaceDetection={(detections) => handleFaceDetection(camera.cameraId, detections)}
                  />
                ) : (
                  // Fallback to mock camera display
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">{camera.name}</CardTitle>
                        <Badge variant={camera.status === "online" ? "default" : "destructive"} className="text-xs">
                          {camera.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{camera.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                        {camera.status === "online" ? (
                          <div className="text-white text-center">
                            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Mock Feed</p>
                            <p className="text-xs opacity-75">Enable WebRTC for live stream</p>
                          </div>
                        ) : (
                          <div className="text-red-400 text-center">
                            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Camera Offline</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Face Detections */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Face Detections</CardTitle>
          <CardDescription>AI-powered face recognition results from live streams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDetections.map((detection, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{detection.person}</p>
                    <p className="text-sm text-gray-600">{detection.camera}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{detection.time}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {detection.action}
                    </Badge>
                    {detection.confidence && (
                      <span className="text-xs text-gray-500">{Math.round(detection.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
