// Express.js Server for CCTV Attendance System
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const multer = require("multer")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// MongoDB Atlas connection
const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  console.error("❌ MONGODB_URI is not set in .env")
  process.exit(1)
}

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "attendance", // Optional: ensures the DB name is set
  })
  .then(() => {
    console.log("📊 MongoDB connected successfully")

    // Start server only after DB connection
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Exiting...`)
        process.exit(1)
      } else {
        throw err
      }
    })
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

console.log("🚀 Express server starting...")

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "hr", "manager"], default: "hr" },
  createdAt: { type: Date, default: Date.now },
})

// Employee Schema
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  baseSalary: { type: Number, required: true },
  joinDate: { type: Date, required: true },
  faceEncodingId: { type: String },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String },
})

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  workHours: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  status: { type: String, enum: ["present", "absent", "late", "half-day"], default: "absent" },
  cameraId: { type: Number },
  confidence: { type: Number },
})

// Salary Schema
const salarySchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  workingDays: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  overtimeHours: { type: Number, default: 0 },
  overtimeRate: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ["pending", "processed", "paid"], default: "pending" },
  processedAt: { type: Date },
})

// Camera Schema
const cameraSchema = new mongoose.Schema({
  cameraId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  faceRecognitionEnabled: { type: Boolean, default: true },
  lastPing: { type: Date, default: Date.now },
})

// Face Recognition Data Schema
const faceDataSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  encoding: { type: [Number], required: true },
  trainingImages: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  accuracy: { type: Number, default: 0 },
})

// Email Log Schema
const emailLogSchema = new mongoose.Schema({
  type: { type: String, required: true },
  recipients: { type: [String], required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
  sentAt: { type: Date },
  errorMessage: { type: String },
})

// Models
const User = mongoose.model("User", userSchema)
const Employee = mongoose.model("Employee", employeeSchema)
const Attendance = mongoose.model("Attendance", attendanceSchema)
const Salary = mongoose.model("Salary", salarySchema)
const Camera = mongoose.model("Camera", cameraSchema)
const FaceData = mongoose.model("FaceData", faceDataSchema)
const EmailLog = mongoose.model("EmailLog", emailLogSchema)

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})
const upload = multer({ storage })

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, "your-secret-key", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" })
    req.user = user
    next()
  })
}

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "attendance@company.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
})

// Authentication Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, "your-secret-key", {
      expiresIn: "24h",
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    console.log(`✅ User logged in: ${email}`)
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "hr",
    })

    await user.save()

    res.status(201).json({ message: "User created successfully" })
    console.log(`✅ New user registered: ${email}`)
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Employee Routes
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
    res.json(employees)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/employees", authenticateToken, async (req, res) => {
  try {
    const employee = new Employee(req.body)
    await employee.save()
    res.status(201).json(employee)
    console.log(`✅ New employee added: ${employee.name}`)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Attendance Routes
app.get("/api/attendance", authenticateToken, async (req, res) => {
  try {
    const { date, employeeId } = req.query
    const query = {}

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.date = { $gte: startDate, $lt: endDate }
    }

    if (employeeId) {
      query.employeeId = employeeId
    }

    const attendance = await Attendance.find(query).sort({ date: -1 })
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/attendance/checkin", async (req, res) => {
  try {
    const { employeeId, cameraId, confidence } = req.body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today },
    })

    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: new Date(),
        cameraId,
        confidence,
      })
    }

    attendance.checkIn = new Date()
    attendance.status = "present"

    // Check if late (assuming 9 AM is standard time)
    const checkInTime = new Date()
    const standardTime = new Date()
    standardTime.setHours(9, 0, 0, 0)

    if (checkInTime > standardTime) {
      attendance.status = "late"
    }

    await attendance.save()

    res.json({ message: "Check-in recorded", attendance })
    console.log(`✅ Check-in recorded for employee: ${employeeId}`)
  } catch (error) {
    console.error("Check-in error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/attendance/checkout", async (req, res) => {
  try {
    const { employeeId } = req.body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today },
    })

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ error: "No check-in found for today" })
    }

    attendance.checkOut = new Date()

    // Calculate work hours
    const workMilliseconds = attendance.checkOut - attendance.checkIn
    const workHours = workMilliseconds / (1000 * 60 * 60)
    attendance.workHours = Math.round(workHours * 100) / 100

    // Calculate overtime (assuming 8 hours is standard)
    if (workHours > 8) {
      attendance.overtimeHours = Math.round((workHours - 8) * 100) / 100
    }

    await attendance.save()

    res.json({ message: "Check-out recorded", attendance })
    console.log(`✅ Check-out recorded for employee: ${employeeId}`)
  } catch (error) {
    console.error("Check-out error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Face Recognition Routes
app.post("/api/face-recognition/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" })
    }

    // Simulate face recognition processing
    // In a real implementation, you would use face-api.js or Python face_recognition
    const mockRecognition = {
      detected: true,
      employeeId: "EMP001",
      confidence: 0.95,
      name: "John Smith",
    }

    // If face is recognized, automatically record attendance
    if (mockRecognition.detected && mockRecognition.confidence > 0.8) {
      const checkInResult = await fetch("http://localhost:5000/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: mockRecognition.employeeId,
          cameraId: req.body.cameraId || 1,
          confidence: mockRecognition.confidence,
        }),
      })
    }

    res.json(mockRecognition)
    console.log(`🔍 Face recognition result: ${mockRecognition.name} (${mockRecognition.confidence})`)
  } catch (error) {
    console.error("Face recognition error:", error)
    res.status(500).json({ error: "Face recognition failed" })
  }
})

app.post("/api/face-recognition/train", authenticateToken, async (req, res) => {
  try {
    const { employeeId, encoding } = req.body

    let faceData = await FaceData.findOne({ employeeId })

    if (!faceData) {
      faceData = new FaceData({ employeeId, encoding })
    } else {
      faceData.encoding = encoding
      faceData.lastUpdated = new Date()
    }

    faceData.trainingImages += 1
    await faceData.save()

    res.json({ message: "Face data updated successfully" })
    console.log(`✅ Face data trained for employee: ${employeeId}`)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Salary Routes
app.get("/api/salary", authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query
    let query = {}

    if (month && year) {
      query = { month: Number.parseInt(month), year: Number.parseInt(year) }
    }

    const salaries = await Salary.find(query)
    res.json(salaries)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/salary/calculate", authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.body

    const employees = await Employee.find({ isActive: true })
    const calculatedSalaries = []

    for (const employee of employees) {
      // Get attendance data for the month
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const attendanceRecords = await Attendance.find({
        employeeId: employee.employeeId,
        date: { $gte: startDate, $lte: endDate },
      })

      const workingDays = endDate.getDate()
      const presentDays = attendanceRecords.filter((r) => r.status === "present" || r.status === "late").length
      const totalOvertimeHours = attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)

      // Calculate salary
      const dailySalary = employee.baseSalary / workingDays
      const earnedSalary = dailySalary * presentDays
      const overtimePay = totalOvertimeHours * ((employee.baseSalary / (workingDays * 8)) * 1.5)
      const deductions = earnedSalary * 0.1 // 10% deductions (tax, etc.)
      const netSalary = earnedSalary + overtimePay - deductions

      const salaryRecord = new Salary({
        employeeId: employee.employeeId,
        month,
        year,
        baseSalary: employee.baseSalary,
        workingDays,
        presentDays,
        overtimeHours: totalOvertimeHours,
        overtimeRate: (employee.baseSalary / (workingDays * 8)) * 1.5,
        deductions,
        netSalary: Math.round(netSalary * 100) / 100,
        status: "processed",
        processedAt: new Date(),
      })

      await salaryRecord.save()
      calculatedSalaries.push(salaryRecord)
    }

    res.json({
      message: "Salaries calculated successfully",
      count: calculatedSalaries.length,
      salaries: calculatedSalaries,
    })

    console.log(`✅ Calculated salaries for ${calculatedSalaries.length} employees`)
  } catch (error) {
    console.error("Salary calculation error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Camera Routes
app.get("/api/cameras", authenticateToken, async (req, res) => {
  try {
    const cameras = await Camera.find()
    res.json(cameras)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/cameras", authenticateToken, async (req, res) => {
  try {
    const camera = new Camera(req.body)
    await camera.save()
    res.status(201).json(camera)
    console.log(`✅ New camera added: ${camera.name}`)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Email Routes
app.post("/api/email/send-daily-report", authenticateToken, async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    // Get today's attendance data
    const attendanceData = await Attendance.find({
      date: { $gte: startOfDay },
    })

    const totalEmployees = await Employee.countDocuments({ isActive: true })
    const presentToday = attendanceData.filter((a) => a.status === "present" || a.status === "late").length
    const lateArrivals = attendanceData.filter((a) => a.status === "late").length

    const reportData = {
      date: today.toLocaleDateString(),
      totalEmployees,
      presentToday,
      absentToday: totalEmployees - presentToday,
      lateArrivals,
      attendanceRate: ((presentToday / totalEmployees) * 100).toFixed(1) + "%",
    }

    const emailContent = `
      <h2>Daily Attendance Report - ${reportData.date}</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><td><strong>Total Employees</strong></td><td>${reportData.totalEmployees}</td></tr>
        <tr><td><strong>Present Today</strong></td><td>${reportData.presentToday}</td></tr>
        <tr><td><strong>Absent Today</strong></td><td>${reportData.absentToday}</td></tr>
        <tr><td><strong>Late Arrivals</strong></td><td>${reportData.lateArrivals}</td></tr>
        <tr><td><strong>Attendance Rate</strong></td><td>${reportData.attendanceRate}</td></tr>
      </table>
    `

    const mailOptions = {
      from: "attendance@company.com",
      to: ["hr@company.com", "manager@company.com"],
      subject: `Daily Attendance Report - ${reportData.date}`,
      html: emailContent,
    }

    await emailTransporter.sendMail(mailOptions)

    // Log email
    const emailLog = new EmailLog({
      type: "daily_report",
      recipients: mailOptions.to,
      subject: mailOptions.subject,
      status: "sent",
      sentAt: new Date(),
    })
    await emailLog.save()

    res.json({ message: "Daily report sent successfully", reportData })
    console.log("📧 Daily report email sent successfully")
  } catch (error) {
    console.error("Email sending error:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
})

// Dashboard Stats Route
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const totalEmployees = await Employee.countDocuments({ isActive: true })
    const todayAttendance = await Attendance.find({ date: { $gte: startOfDay } })
    const presentToday = todayAttendance.filter((a) => a.status === "present" || a.status === "late").length
    const activeCameras = await Camera.countDocuments({ status: "online" })
    const totalCameras = await Camera.countDocuments()

    // Calculate monthly payroll
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const monthlyPayroll = await Salary.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: "$netSalary" } } },
    ])

    const stats = {
      totalEmployees,
      presentToday,
      attendanceRate: ((presentToday / totalEmployees) * 100).toFixed(1),
      activeCameras: `${activeCameras}/${totalCameras}`,
      monthlyPayroll: monthlyPayroll[0]?.total || 0,
      recentActivity: todayAttendance.slice(0, 5),
    }

    res.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Example route (remove if not needed)
app.get("/", (req, res) => {
  res.send("Attendance backend is running!")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...")
  await mongoose.connection.close()
  console.log("📊 MongoDB connection closed")
  process.exit(0)
})
