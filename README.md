# 📷 CCTV Attendance Management System

A full-stack, AI-powered attendance management platform featuring face recognition, CCTV integration, automated salary processing, and real-time email reporting.

---

## 🚀 Features

- 🔐 **Secure User Authentication** (Admin/HR roles)
- 🧠 **AI-Based Face Recognition** (demo included, ready for real-time upgrade)
- 📹 **CCTV Integration** via RTSP and WebRTC
- 🕒 **Attendance Tracking** with timestamps and status
- 💰 **Automated Salary Calculation**
- 📧 **Daily Email Reports**
- 🖥️ **Modern Frontend with Next.js**
- 🔧 **RESTful API with Express & MongoDB**
- 🐳 **Fully Dockerized** for seamless local and production deployment

---


## Project Structure

```
.
├── app/                # Next.js frontend
├── components/         # UI components
├── lib/                # Shared utilities
├── server/             # Express backend API
├── webrtc-server/      # WebRTC signaling server
├── rtsp-config/        # MediaMTX config for RTSP bridge
├── styles/             # Global styles
├── Dockerfile.frontend # Frontend Dockerfile
├── docker-compose.yml  # Multi-service orchestration
├── .env                # Environment variables (not committed)
└── ...
```

---

## Getting Started (Development)

1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd atandence
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Copy and edit environment variables:**
   ```sh
   cp .env.example .env
   # Edit .env with your secrets and DB connection
   ```

4. **Start all services (with Docker):**
   ```sh
   docker-compose up --build
   ```

5. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## Production Deployment

- Use a cloud VM (AWS, DigitalOcean, Azure, etc.)
- Install Docker & Docker Compose
- Copy project files to server
- Set up DNS and HTTPS (Nginx/Caddy recommended)
- Run: `docker-compose up -d`

---

## Environment Variables

See `.env.example` for all required variables.

---

## Useful Commands

- `npm run dev` - Start Next.js frontend in dev mode
- `npm run build` - Build frontend for production
- `docker-compose up` - Start all services
- `docker-compose logs -f` - View logs

---

## License

MIT

---

## Credits

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [MediaMTX](https://github.com/bluenviron/mediamtx)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
