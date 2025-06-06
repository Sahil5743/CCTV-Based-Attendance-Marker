// Email Scheduler Service for automated reports
const cron = require("node-cron")
const nodemailer = require("nodemailer")

class EmailSchedulerService {
  constructor() {
    this.transporter = this.setupEmailTransporter()
    this.scheduleJobs()

    console.log("📧 Email Scheduler Service initialized")
  }

  setupEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "attendance@company.com",
        pass: process.env.EMAIL_PASS || "your-app-password",
      },
    })
  }

  scheduleJobs() {
    // Daily report at 6:00 AM
    cron.schedule("0 6 * * *", () => {
      this.sendDailyReport()
    })

    // Weekly report every Monday at 8:00 AM
    cron.schedule("0 8 * * 1", () => {
      this.sendWeeklyReport()
    })

    // Monthly report on 1st of each month at 9:00 AM
    cron.schedule("0 9 1 * *", () => {
      this.sendMonthlyReport()
    })

    console.log("⏰ Email schedules configured:")
    console.log("   📅 Daily reports: 6:00 AM")
    console.log("   📅 Weekly reports: Monday 8:00 AM")
    console.log("   📅 Monthly reports: 1st of month 9:00 AM")
  }

  async sendDailyReport() {
    try {
      console.log("📧 Generating daily attendance report...")

      const reportData = await this.generateDailyReportData()
      const htmlContent = this.generateDailyReportHTML(reportData)

      const mailOptions = {
        from: "attendance@company.com",
        to: ["hr@company.com", "manager@company.com"],
        subject: `Daily Attendance Report - ${reportData.date}`,
        html: htmlContent,
      }

      await this.transporter.sendMail(mailOptions)
      console.log("✅ Daily report sent successfully")

      return { success: true, type: "daily", recipients: mailOptions.to.length }
    } catch (error) {
      console.error("❌ Failed to send daily report:", error)
      return { success: false, error: error.message }
    }
  }

  async sendWeeklyReport() {
    try {
      console.log("📧 Generating weekly attendance summary...")

      const reportData = await this.generateWeeklyReportData()
      const htmlContent = this.generateWeeklyReportHTML(reportData)

      const mailOptions = {
        from: "attendance@company.com",
        to: ["management@company.com", "hr@company.com"],
        subject: `Weekly Attendance Summary - Week ${reportData.week}`,
        html: htmlContent,
      }

      await this.transporter.sendMail(mailOptions)
      console.log("✅ Weekly report sent successfully")

      return { success: true, type: "weekly", recipients: mailOptions.to.length }
    } catch (error) {
      console.error("❌ Failed to send weekly report:", error)
      return { success: false, error: error.message }
    }
  }

  async sendMonthlyReport() {
    try {
      console.log("📧 Generating monthly payroll report...")

      const reportData = await this.generateMonthlyReportData()
      const htmlContent = this.generateMonthlyReportHTML(reportData)

      const mailOptions = {
        from: "attendance@company.com",
        to: ["finance@company.com", "hr@company.com", "ceo@company.com"],
        subject: `Monthly Payroll Report - ${reportData.month} ${reportData.year}`,
        html: htmlContent,
      }

      await this.transporter.sendMail(mailOptions)
      console.log("✅ Monthly report sent successfully")

      return { success: true, type: "monthly", recipients: mailOptions.to.length }
    } catch (error) {
      console.error("❌ Failed to send monthly report:", error)
      return { success: false, error: error.message }
    }
  }

  async generateDailyReportData() {
    const today = new Date()

    // Mock data - in real implementation, fetch from database
    return {
      date: today.toLocaleDateString(),
      totalEmployees: 245,
      presentToday: 198,
      absentToday: 47,
      lateArrivals: 23,
      attendanceRate: "80.8%",
      topPerformers: [
        { name: "John Smith", checkIn: "08:45 AM", department: "IT" },
        { name: "Sarah Johnson", checkIn: "08:50 AM", department: "HR" },
        { name: "Mike Davis", checkIn: "08:55 AM", department: "Finance" },
      ],
      lateEmployees: [
        { name: "Emily Brown", checkIn: "09:15 AM", department: "Marketing" },
        { name: "David Wilson", checkIn: "09:30 AM", department: "IT" },
      ],
    }
  }

  async generateWeeklyReportData() {
    const today = new Date()
    const weekNumber = Math.ceil(today.getDate() / 7)

    return {
      week: weekNumber,
      year: today.getFullYear(),
      averageAttendance: "82.5%",
      totalOvertimeHours: 47.5,
      departmentStats: [
        { department: "IT", attendance: "85%", overtime: "15.2h" },
        { department: "HR", attendance: "90%", overtime: "8.5h" },
        { department: "Finance", attendance: "88%", overtime: "12.8h" },
        { department: "Marketing", attendance: "75%", overtime: "11.0h" },
      ],
      topPerformers: ["John Smith", "Sarah Johnson", "Mike Davis"],
    }
  }

  async generateMonthlyReportData() {
    const today = new Date()

    return {
      month: today.toLocaleDateString("en-US", { month: "long" }),
      year: today.getFullYear(),
      totalPayroll: 245000,
      totalEmployees: 245,
      averageAttendance: "83.2%",
      totalOvertimePay: 15420,
      departmentPayroll: [
        { department: "IT", employees: 45, payroll: 67500 },
        { department: "HR", employees: 12, payroll: 18000 },
        { department: "Finance", employees: 25, payroll: 37500 },
        { department: "Marketing", employees: 18, payroll: 27000 },
        { department: "Operations", employees: 145, payroll: 95000 },
      ],
    }
  }

  generateDailyReportHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-card { background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f1f5f9; }
          .footer { margin-top: 30px; padding: 20px; background-color: #f8fafc; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Attendance Report</h1>
          <p>${data.date}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${data.totalEmployees}</div>
            <div>Total Employees</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.presentToday}</div>
            <div>Present Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.absentToday}</div>
            <div>Absent Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.attendanceRate}</div>
            <div>Attendance Rate</div>
          </div>
        </div>

        <h3>Early Arrivals (Top Performers)</h3>
        <table>
          <tr><th>Name</th><th>Check-in Time</th><th>Department</th></tr>
          ${data.topPerformers
            .map((emp) => `<tr><td>${emp.name}</td><td>${emp.checkIn}</td><td>${emp.department}</td></tr>`)
            .join("")}
        </table>

        <h3>Late Arrivals</h3>
        <table>
          <tr><th>Name</th><th>Check-in Time</th><th>Department</th></tr>
          ${data.lateEmployees
            .map((emp) => `<tr><td>${emp.name}</td><td>${emp.checkIn}</td><td>${emp.department}</td></tr>`)
            .join("")}
        </table>

        <div class="footer">
          <p>Generated by AttendanceVision System</p>
          <p>For questions, contact: hr@company.com</p>
        </div>
      </body>
      </html>
    `
  }

  generateWeeklyReportHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .summary { background-color: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Weekly Attendance Summary</h1>
          <p>Week ${data.week}, ${data.year}</p>
        </div>
        
        <div class="summary">
          <h3>Week Overview</h3>
          <p><strong>Average Attendance:</strong> ${data.averageAttendance}</p>
          <p><strong>Total Overtime Hours:</strong> ${data.totalOvertimeHours}h</p>
          <p><strong>Top Performers:</strong> ${data.topPerformers.join(", ")}</p>
        </div>

        <h3>Department Performance</h3>
        <table>
          <tr><th>Department</th><th>Attendance Rate</th><th>Overtime Hours</th></tr>
          ${data.departmentStats
            .map((dept) => `<tr><td>${dept.department}</td><td>${dept.attendance}</td><td>${dept.overtime}</td></tr>`)
            .join("")}
        </table>

        <div class="footer">
          <p>Generated by AttendanceVision System</p>
        </div>
      </body>
      </html>
    `
  }

  generateMonthlyReportHTML(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
          .payroll-summary { background-color: #faf5ff; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f1f5f9; }
          .total-row { background-color: #e0e7ff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Monthly Payroll Report</h1>
          <p>${data.month} ${data.year}</p>
        </div>
        
        <div class="payroll-summary">
          <h3>Payroll Summary</h3>
          <p><strong>Total Payroll:</strong> $${data.totalPayroll.toLocaleString()}</p>
          <p><strong>Total Employees:</strong> ${data.totalEmployees}</p>
          <p><strong>Average Attendance:</strong> ${data.averageAttendance}</p>
          <p><strong>Overtime Pay:</strong> $${data.totalOvertimePay.toLocaleString()}</p>
        </div>

        <h3>Department Payroll Breakdown</h3>
        <table>
          <tr><th>Department</th><th>Employees</th><th>Payroll Amount</th></tr>
          ${data.departmentPayroll
            .map(
              (dept) =>
                `<tr><td>${dept.department}</td><td>${dept.employees}</td><td>$${dept.payroll.toLocaleString()}</td></tr>`,
            )
            .join("")}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${data.totalEmployees}</td>
            <td>$${data.totalPayroll.toLocaleString()}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Generated by AttendanceVision System</p>
          <p>Confidential - For authorized personnel only</p>
        </div>
      </body>
      </html>
    `
  }

  // Send custom alert email
  async sendAlert(subject, message, recipients = ["admin@company.com"]) {
    try {
      const mailOptions = {
        from: "attendance@company.com",
        to: recipients,
        subject: `ALERT: ${subject}`,
        html: `
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc2626;">System Alert</h2>
            <p><strong>Alert:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`🚨 Alert email sent: ${subject}`)

      return { success: true }
    } catch (error) {
      console.error("❌ Failed to send alert email:", error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = EmailSchedulerService
