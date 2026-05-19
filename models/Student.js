// const mongoose = require('mongoose');

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   password: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
//   attendance: { type: Number, default: 0 },
//   semester: {type:Number,default : null},
//   branch : {type:String, default:null},
//   RollNumber: {type:String,default:null}
// });

// const Student = mongoose.model('Student', studentSchema);

// module.exports = Student;

// const mongoose = require('mongoose'); 

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   password: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
//   attendance: { type: Number, default: 0 },
//   semester: { type: Number, default: null },
//   branch: { type: String, default: null },
//   RollNumber: { type: String, default: null },
//   batch: { type: Number, required: true },  // Added batch field
//   academicYear: { type: String, required: true },  // Added academicYear field
// });

// const Student = mongoose.model('Student', studentSchema);

// module.exports = Student;



const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  attendance: { type: Number, default: 0 },
  semester: { type: Number, default: null },
  branch: { type: String, default: null },
  RollNumber: { type: Number, default: null },
  batch: { type: Number, required: true },  // Batch field
  academicYear: { type: String, required: true },  // Academic year field
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

