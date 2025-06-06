// API utility functions for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        window.location.href = "/"
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: { name: string; email: string; password: string; role?: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  // Employees
  async getEmployees() {
    return this.request("/employees")
  }

  async createEmployee(employeeData: any) {
    return this.request("/employees", {
      method: "POST",
      body: JSON.stringify(employeeData),
    })
  }

  // Attendance
  async getAttendance(params?: { date?: string; employeeId?: string }) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/attendance${queryString}`)
  }

  async checkIn(employeeId: string, cameraId?: number, confidence?: number) {
    return this.request("/attendance/checkin", {
      method: "POST",
      body: JSON.stringify({ employeeId, cameraId, confidence }),
    })
  }

  async checkOut(employeeId: string) {
    return this.request("/attendance/checkout", {
      method: "POST",
      body: JSON.stringify({ employeeId }),
    })
  }

  // Face Recognition
  async detectFace(imageFile: File, cameraId?: number) {
    const formData = new FormData()
    formData.append("image", imageFile)
    if (cameraId) formData.append("cameraId", cameraId.toString())

    return fetch(`${API_BASE_URL}/face-recognition/detect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    }).then((res) => res.json())
  }

  async trainFace(employeeId: string, encoding: number[]) {
    return this.request("/face-recognition/train", {
      method: "POST",
      body: JSON.stringify({ employeeId, encoding }),
    })
  }

  // Salary
  async getSalaries(params?: { month?: number; year?: number }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ""
    return this.request(`/salary${queryString}`)
  }

  async calculateSalaries(month: number, year: number) {
    return this.request("/salary/calculate", {
      method: "POST",
      body: JSON.stringify({ month, year }),
    })
  }

  // Cameras
  async getCameras() {
    return this.request("/cameras")
  }

  async createCamera(cameraData: any) {
    return this.request("/cameras", {
      method: "POST",
      body: JSON.stringify(cameraData),
    })
  }

  // Email
  async sendDailyReport() {
    return this.request("/email/send-daily-report", {
      method: "POST",
    })
  }
}

export const apiClient = new ApiClient()
