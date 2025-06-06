// Deployment script for CCTV Attendance System
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Starting deployment process...")

// Configuration
const config = {
  frontend: {
    platform: "vercel",
    buildCommand: "npm run build",
    outputDir: ".next",
  },
  backend: {
    platform: "railway",
    buildCommand: "npm install",
    dockerfile: "Dockerfile",
  },
  database: {
    platform: "mongodb-atlas",
    cluster: "attendance-cluster",
  },
  webrtc: {
    platform: "railway",
    service: "webrtc-signaling",
  },
}

// Deployment functions
async function deployFrontend() {
  console.log("📦 Deploying frontend to Vercel...")

  try {
    // Check if Vercel CLI is installed
    execSync("vercel --version", { stdio: "ignore" })
  } catch (error) {
    console.log("Installing Vercel CLI...")
    execSync("npm install -g vercel", { stdio: "inherit" })
  }

  // Build the frontend
  console.log("🔨 Building frontend...")
  execSync("npm run build", { stdio: "inherit" })

  // Deploy to Vercel
  console.log("🚀 Deploying to Vercel...")
  const deployResult = execSync("vercel --prod --yes", { encoding: "utf8" })

  const deployUrl = deployResult.trim().split("\n").pop()
  console.log(`✅ Frontend deployed successfully!`)
  console.log(`🌐 URL: ${deployUrl}`)

  return deployUrl
}

async function deployBackend() {
  console.log("🔧 Deploying backend to Railway...")

  try {
    // Check if Railway CLI is installed
    execSync("railway --version", { stdio: "ignore" })
  } catch (error) {
    console.log("Installing Railway CLI...")
    execSync("npm install -g @railway/cli", { stdio: "inherit" })
  }

  // Login to Railway (if not already logged in)
  try {
    execSync("railway whoami", { stdio: "ignore" })
  } catch (error) {
    console.log("Please login to Railway:")
    execSync("railway login", { stdio: "inherit" })
  }

  // Deploy backend
  console.log("🚀 Deploying backend to Railway...")
  process.chdir("server")

  // Create Railway project if it doesn't exist
  try {
    execSync("railway status", { stdio: "ignore" })
  } catch (error) {
    console.log("Creating new Railway project...")
    execSync("railway init", { stdio: "inherit" })
  }

  // Deploy
  const deployResult = execSync("railway up", { encoding: "utf8" })
  console.log("✅ Backend deployed successfully!")

  // Get the deployment URL
  const domainResult = execSync("railway domain", { encoding: "utf8" })
  const backendUrl = domainResult.trim()
  console.log(`🌐 Backend URL: ${backendUrl}`)

  process.chdir("..")
  return backendUrl
}

async function deployWebRTC() {
  console.log("📡 Deploying WebRTC signaling server...")

  process.chdir("webrtc-server")

  // Create separate Railway service for WebRTC
  try {
    execSync("railway init", { stdio: "inherit" })
  } catch (error) {
    // Project might already exist
  }

  const deployResult = execSync("railway up", { encoding: "utf8" })
  console.log("✅ WebRTC server deployed successfully!")

  const domainResult = execSync("railway domain", { encoding: "utf8" })
  const webrtcUrl = domainResult.trim()
  console.log(`🌐 WebRTC URL: ${webrtcUrl}`)

  process.chdir("..")
  return webrtcUrl
}

async function setupDatabase() {
  console.log("🗄️  Setting up MongoDB Atlas...")

  // Instructions for manual setup
  console.log(`
📋 MongoDB Atlas Setup Instructions:

1. Go to https://cloud.mongodb.com/
2. Create a new cluster named 'attendance-cluster'
3. Create a database user with read/write permissions
4. Whitelist your application IP addresses
5. Get the connection string

Example connection string:
mongodb+srv://username:password@attendance-cluster.mongodb.net/attendance_system

Add this to your Railway environment variables as MONGODB_URI
`)

  return "mongodb+srv://username:password@attendance-cluster.mongodb.net/attendance_system"
}

async function updateEnvironmentVariables(frontendUrl, backendUrl, webrtcUrl, mongoUri) {
  console.log("🔧 Updating environment variables...")

  // Update Vercel environment variables
  const vercelEnvVars = {
    NEXT_PUBLIC_API_URL: `${backendUrl}/api`,
    NEXT_PUBLIC_SOCKET_URL: backendUrl,
    NEXT_PUBLIC_WEBRTC_URL: webrtcUrl,
  }

  console.log("Setting Vercel environment variables...")
  for (const [key, value] of Object.entries(vercelEnvVars)) {
    try {
      execSync(`vercel env add ${key} production`, {
        input: value,
        stdio: ["pipe", "inherit", "inherit"],
      })
    } catch (error) {
      console.log(`Environment variable ${key} might already exist`)
    }
  }

  // Update Railway environment variables for backend
  console.log("Setting Railway environment variables for backend...")
  process.chdir("server")

  const railwayEnvVars = {
    NODE_ENV: "production",
    MONGODB_URI: mongoUri,
    JWT_SECRET: "your-super-secret-jwt-key-change-in-production",
    EMAIL_USER: "your-email@gmail.com",
    EMAIL_PASS: "your-app-password",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
  }

  for (const [key, value] of Object.entries(railwayEnvVars)) {
    try {
      execSync(`railway variables set ${key}="${value}"`, { stdio: "inherit" })
    } catch (error) {
      console.log(`Failed to set ${key}, you may need to set it manually`)
    }
  }

  process.chdir("..")

  // Update Railway environment variables for WebRTC
  console.log("Setting Railway environment variables for WebRTC...")
  process.chdir("webrtc-server")

  const webrtcEnvVars = {
    PORT: "8080",
    CORS_ORIGIN: frontendUrl,
  }

  for (const [key, value] of Object.entries(webrtcEnvVars)) {
    try {
      execSync(`railway variables set ${key}="${value}"`, { stdio: "inherit" })
    } catch (error) {
      console.log(`Failed to set ${key}, you may need to set it manually`)
    }
  }

  process.chdir("..")
}

async function generateDeploymentReport(frontendUrl, backendUrl, webrtcUrl, mongoUri) {
  const report = `
# 🎉 CCTV Attendance System Deployment Report

## 📊 Deployment Summary
- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway  
- **WebRTC**: Deployed to Railway
- **Database**: MongoDB Atlas
- **Status**: ✅ Successfully Deployed

## 🌐 Application URLs
- **Frontend Application**: ${frontendUrl}
- **Backend API**: ${backendUrl}
- **WebRTC Signaling**: ${webrtcUrl}
- **API Documentation**: ${backendUrl}/api/docs

## 🔐 Default Login Credentials
- **Email**: admin@company.com
- **Password**: admin123

## 🛠️ Environment Variables Set
### Frontend (Vercel)
- NEXT_PUBLIC_API_URL: ${backendUrl}/api
- NEXT_PUBLIC_SOCKET_URL: ${backendUrl}
- NEXT_PUBLIC_WEBRTC_URL: ${webrtcUrl}

### Backend (Railway)
- NODE_ENV: production
- MONGODB_URI: ${mongoUri}
- JWT_SECRET: [CONFIGURED]
- EMAIL_* variables: [CONFIGURED]

## 📋 Post-Deployment Checklist
- [ ] Test user authentication
- [ ] Verify database connection
- [ ] Test real-time features
- [ ] Check email functionality
- [ ] Test WebRTC streaming
- [ ] Verify face recognition
- [ ] Test mobile responsiveness

## 🔧 Manual Configuration Required
1. **MongoDB Atlas**: Complete database setup
2. **Email Service**: Configure SMTP credentials
3. **Domain Setup**: Configure custom domains (optional)
4. **SSL Certificates**: Verify HTTPS is working
5. **Camera Integration**: Configure RTSP streams

## 📞 Support
For issues or questions:
- Check logs in Railway dashboard
- Review Vercel deployment logs
- Monitor MongoDB Atlas metrics

Generated on: ${new Date().toISOString()}
`

  fs.writeFileSync("DEPLOYMENT_REPORT.md", report)
  console.log("📄 Deployment report saved to DEPLOYMENT_REPORT.md")
}

// Main deployment function
async function main() {
  try {
    console.log("🎯 Starting full deployment process...")

    // Deploy components
    const frontendUrl = await deployFrontend()
    const backendUrl = await deployBackend()
    const webrtcUrl = await deployWebRTC()
    const mongoUri = await setupDatabase()

    // Configure environment variables
    await updateEnvironmentVariables(frontendUrl, backendUrl, webrtcUrl, mongoUri)

    // Generate deployment report
    await generateDeploymentReport(frontendUrl, backendUrl, webrtcUrl, mongoUri)

    console.log(`
🎉 Deployment completed successfully!

🌐 Your CCTV Attendance System is now live:
   Frontend: ${frontendUrl}
   Backend:  ${backendUrl}
   WebRTC:   ${webrtcUrl}

📋 Next steps:
1. Complete MongoDB Atlas setup
2. Configure email SMTP settings
3. Test all functionality
4. Set up camera RTSP streams

🔐 Login with:
   Email: admin@company.com
   Password: admin123
`)
  } catch (error) {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  main()
}

module.exports = { deployFrontend, deployBackend, deployWebRTC, setupDatabase }
