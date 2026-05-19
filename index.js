const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors')

const app = express();
connectDB().catch((error) => {
  console.error("Initial MongoDB connection failed:", error.message);
});
const PORT = process.env.PORT || 5173;

app.use(cors({
  origin: 'https://proj-frontend-neon.vercel.app',
  credentials: true
}));

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://proj-frontend-neon.vercel.app"
  ];
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Routes
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const authRoutes = require('./routes/authRoutes');
const requestroute = require("./routes/RequestRouter");
const uploadstudents = require("./routes/uploadSudents");
const groupRoutes = require('./routes/groupRoutes'); // Import the group routes
const FacultyLoadRoutes = require("./routes/FacultyLoadRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

// Mounting routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/login', authRoutes);
app.use('/api/request', requestroute);
app.use('/api/uploadStudents', uploadstudents);
app.use('/api/groups', groupRoutes); // Mount groupRoutes here
app.use('/api/facultyLoad', FacultyLoadRoutes);
app.use('/api/eveSettings', evaluationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
