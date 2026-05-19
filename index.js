const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors')

const app = express();
connectDB();
const PORT = process.env.PORT || 5173;
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === "http://localhost:3000" || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
