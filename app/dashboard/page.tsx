"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, DollarSign, Camera, Mail, User } from "lucide-react"
import { apiClient } from "@/lib/api"
import { socketClient } from "@/lib/socket"

interface DashboardStats {
  totalEmployees: number
  presentToday: number
  attendanceRate: string
  activeCameras: string
  monthlyPayroll: number
  recentActivity: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    setupRealtimeUpdates()

    return () => {
      socketClient.off("attendance-update")
      socketClient.off("camera-status-update")
      socketClient.off("system-alert")
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      const data = await apiClient.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeUpdates = () => {
    socketClient.connect()
    socketClient.joinDashboard()

    socketClient.on("attendance-update", (update: any) => {
      setRealtimeUpdates((prev) => [update, ...prev.slice(0, 9)]) // Keep last 10 updates

      // Update stats if it's an attendance record
      if (update.type === "attendance_recorded" && stats) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                presentToday: prev.presentToday + 1,
                attendanceRate: (((prev.presentToday + 1) / prev.totalEmployees) * 100).toFixed(1) + "%",
              }
            : null,
        )
      }
    })

    socketClient.on("camera-status-update", (update: any) => {
      setRealtimeUpdates((prev) => [
        {
          type: "camera_status",
          message: `Camera ${update.cameraId} is now ${update.status}`,
          timestamp: update.timestamp,
        },
        ...prev.slice(0, 9),
      ])
    })

    socketClient.on("system-alert", (alert: any) => {
      setRealtimeUpdates((prev) => [
        {
          type: "system_alert",
          message: alert.message,
          timestamp: alert.timestamp,
        },
        ...prev.slice(0, 9),
      ])
    })
  }

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case "send-report":
          await apiClient.sendDailyReport()
          alert("Daily report sent successfully!")
          break
        case "calculate-salary":
          const currentDate = new Date()
          await apiClient.calculateSalaries(currentDate.getMonth() + 1, currentDate.getFullYear())
          alert("Salaries calculated successfully!")
          break
        default:
          console.log(`Action: ${action}`)
      }
    } catch (error) {
      console.error("Quick action failed:", error)
      alert("Action failed. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your attendance management system</p>
      </div>

      {/* Real-time Updates Banner */}
      {realtimeUpdates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">🔄 Live Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {realtimeUpdates.slice(0, 3).map((update, index) => (
                <div key={index} className="text-sm text-blue-700">
                  <span className="font-medium">{new Date(update.timestamp).toLocaleTimeString()}:</span>{" "}
                  {update.type === "face_detected" && (
                    <>
                      🔍 {update.employeeName} detected at Camera {update.cameraId}
                    </>
                  )}
                  {update.type === "attendance_recorded" && <>✅ {update.employeeId} attendance recorded</>}
                  {update.message && <>{update.message}</>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.attendanceRate || "0%"} attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyPayroll?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCameras || "0/0"}</div>
            <p className="text-xs text-muted-foreground">Systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Latest check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.length ? (
                stats.recentActivity.map((record, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{record.employeeId}</p>
                        <p className="text-sm text-gray-600">{record.checkIn ? "Check In" : "Check Out"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(record.date).toLocaleTimeString()}</p>
                      <Badge
                        variant={
                          record.status === "late"
                            ? "destructive"
                            : record.status === "present"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-20 flex flex-col gap-2" onClick={() => window.open("/dashboard/cctv", "_blank")}>
                <Camera className="h-6 w-6" />
                <span>View Live CCTV</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => alert("Manual check-in feature coming soon!")}
              >
                <UserCheck className="h-6 w-6" />
                <span>Manual Check-in</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleQuickAction("calculate-salary")}
              >
                <DollarSign className="h-6 w-6" />
                <span>Generate Payroll</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => handleQuickAction("send-report")}
              >
                <Mail className="h-6 w-6" />
                <span>Send Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">CCTV System</p>
                <p className="text-sm text-gray-600">All cameras online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Face Recognition</p>
                <p className="text-sm text-gray-600">AI processing active</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Real-time Updates</p>
                <p className="text-sm text-gray-600">WebSocket connected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
