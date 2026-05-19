const express = require('express');
const router = express.Router();
const multer = require('multer');
const studentController = require('../controllers/studentController');
const upload = multer({ storage: multer.memoryStorage() });

// CSV upload route
router.post('/', upload.single('file'), studentController.uploadStudents);

module.exports = router;
