// Database setup script for CCTV Attendance System
// This would typically connect to MongoDB and create necessary collections

console.log("Setting up CCTV Attendance System Database...")

// Simulate database setup
const collections = [
  "users",
  "employees",
  "students",
  "attendance_records",
  "salary_records",
  "holidays",
  "camera_feeds",
  "face_recognition_data",
  "email_logs",
  "system_settings",
]

// Create collections with sample data
collections.forEach((collection) => {
  console.log(`Creating collection: ${collection}`)
})

// Sample data insertion
console.log("Inserting sample data...")

// Users collection
const sampleUsers = [
  {
    id: 1,
    email: "admin@company.com",
    password: "hashed_password",
    role: "admin",
    name: "System Administrator",
  },
  {
    id: 2,
    email: "hr@company.com",
    password: "hashed_password",
    role: "hr",
    name: "HR Manager",
  },
]

// Employees collection
const sampleEmployees = [
  {
    id: "EMP001",
    name: "John Smith",
    email: "john.smith@company.com",
    department: "IT",
    position: "Software Developer",
    baseSalary: 5000,
    joinDate: "2023-01-15",
    faceEncodingId: "face_001",
  },
  {
    id: "EMP002",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "HR",
    position: "HR Specialist",
    baseSalary: 4500,
    joinDate: "2023-03-20",
    faceEncodingId: "face_002",
  },
]

// Camera feeds collection
const sampleCameras = [
  {
    id: 1,
    name: "Main Entrance",
    location: "Building A",
    ipAddress: "192.168.1.101",
    status: "online",
    faceRecognitionEnabled: true,
  },
  {
    id: 2,
    name: "Reception Area",
    location: "Ground Floor",
    ipAddress: "192.168.1.102",
    status: "online",
    faceRecognitionEnabled: true,
  },
]

console.log("Database setup completed successfully!")
console.log(`Created ${collections.length} collections`)
console.log(`Inserted ${sampleUsers.length} users`)
console.log(`Inserted ${sampleEmployees.length} employees`)
console.log(`Configured ${sampleCameras.length} cameras`)
