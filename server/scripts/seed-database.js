// Database seeding script for development
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/attendance_system", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

console.log("🌱 Starting database seeding...")

// Define schemas (simplified versions)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
})

const employeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  email: String,
  department: String,
  position: String,
  baseSalary: Number,
  joinDate: Date,
  isActive: { type: Boolean, default: true },
})

const cameraSchema = new mongoose.Schema({
  cameraId: Number,
  name: String,
  location: String,
  ipAddress: String,
  status: { type: String, default: "online" },
  faceRecognitionEnabled: { type: Boolean, default: true },
})

const attendanceSchema = new mongoose.Schema({
  employeeId: String,
  date: Date,
  checkIn: Date,
  checkOut: Date,
  workHours: Number,
  overtimeHours: Number,
  status: String,
  cameraId: Number,
})

// Models
const User = mongoose.model("User", userSchema)
const Employee = mongoose.model("Employee", employeeSchema)
const Camera = mongoose.model("Camera", cameraSchema)
const Attendance = mongoose.model("Attendance", attendanceSchema)

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Employee.deleteMany({})
    await Camera.deleteMany({})
    await Attendance.deleteMany({})

    console.log("🗑️  Cleared existing data")

    // Seed Users
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const users = [
      {
        email: "admin@company.com",
        password: hashedPassword,
        name: "System Administrator",
        role: "admin",
      },
      {
        email: "hr@company.com",
        password: hashedPassword,
        name: "HR Manager",
        role: "hr",
      },
      {
        email: "manager@company.com",
        password: hashedPassword,
        name: "Department Manager",
        role: "manager",
      },
    ]

    await User.insertMany(users)
    console.log(`✅ Seeded ${users.length} users`)

    // Seed Employees
    const employees = [
      {
        employeeId: "EMP001",
        name: "John Smith",
        email: "john.smith@company.com",
        department: "Information Technology",
        position: "Software Developer",
        baseSalary: 5000,
        joinDate: new Date("2023-01-15"),
      },
      {
        employeeId: "EMP002",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        department: "Human Resources",
        position: "HR Specialist",
        baseSalary: 4500,
        joinDate: new Date("2023-03-20"),
      },
      {
        employeeId: "EMP003",
        name: "Mike Davis",
        email: "mike.davis@company.com",
        department: "Finance",
        position: "Financial Analyst",
        baseSalary: 5500,
        joinDate: new Date("2023-02-10"),
      },
      {
        employeeId: "EMP004",
        name: "Emily Brown",
        email: "emily.brown@company.com",
        department: "Marketing",
        position: "Marketing Coordinator",
        baseSalary: 4200,
        joinDate: new Date("2023-04-05"),
      },
      {
        employeeId: "EMP005",
        name: "David Wilson",
        email: "david.wilson@company.com",
        department: "Information Technology",
        position: "DevOps Engineer",
        baseSalary: 5800,
        joinDate: new Date("2023-01-30"),
      },
    ]

    await Employee.insertMany(employees)
    console.log(`✅ Seeded ${employees.length} employees`)

    // Seed Cameras
    const cameras = [
      {
        cameraId: 1,
        name: "Main Entrance",
        location: "Building A - Ground Floor",
        ipAddress: "192.168.1.101",
        status: "online",
      },
      {
        cameraId: 2,
        name: "Reception Area",
        location: "Building A - Ground Floor",
        ipAddress: "192.168.1.102",
        status: "online",
      },
      {
        cameraId: 3,
        name: "Cafeteria",
        location: "Building A - 2nd Floor",
        ipAddress: "192.168.1.103",
        status: "online",
      },
      {
        cameraId: 4,
        name: "Parking Lot",
        location: "Outdoor Area",
        ipAddress: "192.168.1.104",
        status: "offline",
      },
      {
        cameraId: 5,
        name: "Conference Room",
        location: "Building A - 3rd Floor",
        ipAddress: "192.168.1.105",
        status: "online",
      },
      {
        cameraId: 6,
        name: "Server Room",
        location: "Building A - Basement",
        ipAddress: "192.168.1.106",
        status: "online",
      },
    ]

    await Camera.insertMany(cameras)
    console.log(`✅ Seeded ${cameras.length} cameras`)

    // Seed Sample Attendance Data (last 7 days)
    const attendanceRecords = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      for (const employee of employees) {
        // 90% chance of attendance
        if (Math.random() > 0.1) {
          const checkInHour = 8 + Math.random() * 2 // 8-10 AM
          const checkInMinute = Math.random() * 60
          const checkOutHour = 17 + Math.random() * 2 // 5-7 PM
          const checkOutMinute = Math.random() * 60

          const checkIn = new Date(date)
          checkIn.setHours(Math.floor(checkInHour), Math.floor(checkInMinute))

          const checkOut = new Date(date)
          checkOut.setHours(Math.floor(checkOutHour), Math.floor(checkOutMinute))

          const workMilliseconds = checkOut - checkIn
          const workHours = workMilliseconds / (1000 * 60 * 60)

          attendanceRecords.push({
            employeeId: employee.employeeId,
            date: date,
            checkIn: checkIn,
            checkOut: checkOut,
            workHours: Math.round(workHours * 100) / 100,
            overtimeHours: workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0,
            status: checkInHour > 9 ? "late" : "present",
            cameraId: Math.floor(Math.random() * 3) + 1, // Random camera 1-3
          })
        }
      }
    }

    await Attendance.insertMany(attendanceRecords)
    console.log(`✅ Seeded ${attendanceRecords.length} attendance records`)

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📋 Summary:")
    console.log(`   Users: ${users.length}`)
    console.log(`   Employees: ${employees.length}`)
    console.log(`   Cameras: ${cameras.length}`)
    console.log(`   Attendance Records: ${attendanceRecords.length}`)
    console.log("\n🔐 Default Login Credentials:")
    console.log("   Email: admin@company.com")
    console.log("   Password: admin123")
  } catch (error) {
    console.error("❌ Seeding error:", error)
  } finally {
    await mongoose.connection.close()
    console.log("📊 Database connection closed")
    process.exit(0)
  }
}

seedDatabase()
