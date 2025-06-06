// Socket.io client for real-time updates
import { io, type Socket } from "socket.io-client"

class SocketClient {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    if (this.socket?.connected) return

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      auth: {
        token: localStorage.getItem("auth_token"),
      },
    })

    this.socket.on("connect", () => {
      console.log("🔄 Connected to real-time server")
    })

    this.socket.on("disconnect", () => {
      console.log("🔄 Disconnected from real-time server")
    })

    // Re-register all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Join specific rooms
  joinDashboard() {
    this.socket?.emit("join-dashboard")
  }

  joinCamera(cameraId: number) {
    this.socket?.emit("join-camera", cameraId)
  }

  leaveCamera(cameraId: number) {
    this.socket?.emit("leave-camera", cameraId)
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)

    if (this.socket?.connected) {
      this.socket.on(event, callback as any)
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
      this.socket?.off(event, callback as any)
    } else {
      this.listeners.delete(event)
      this.socket?.off(event)
    }
  }

  // Emit events
  emit(event: string, data?: any) {
    this.socket?.emit(event, data)
  }

  // Face detection events
  emitFaceDetected(data: {
    employeeId: string
    employeeName: string
    cameraId: number
    confidence: number
  }) {
    this.emit("face-detected", data)
  }

  emitAttendanceRecorded(data: {
    employeeId: string
    action: "check_in" | "check_out"
    timestamp: string
  }) {
    this.emit("attendance-recorded", data)
  }

  emitCameraStatusChange(cameraId: number, status: "online" | "offline") {
    this.emit("camera-status-change", { cameraId, status })
  }
}

export const socketClient = new SocketClient()
