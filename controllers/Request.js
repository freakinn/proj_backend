const Request = require('../models/Request');
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');


exports.createrequest = async (req, res) => {
    try {
        const request = new Request(req.body);
        await request.save();
        res.status(201).json({ message: 'Request created successfully', request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get requests by faculty name
exports.getreqbyfaculty = async (req, res) => {
    try {
        const { name } = req.body;
        const requests = await Request.find({ Faculty: name }); // Assuming `Faculty` is the field name
        if (!requests.length) {
            return res.status(404).json({ message: 'No requests found for the given faculty' });
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Approve a request
exports.getapproved = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await Request.updateOne(
            { _id: id },
            { $set: { Approved: true } }
        );
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'No pending requests found to approve' });
        }
        res.json({ message: 'Request approved successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get approved requests for a faculty
exports.getapprovedreq = async (req, res) => {
    try {
        let { facultyId, semester, year } = req.body;

        if (!facultyId || semester == undefined || year == undefined) {
            return res.status(400).json({ message: "Faculty ID, semester, and year are required" });
        }

        // Convert semester & year to numbers since they are stored as numbers in MongoDB
        semester = Number(semester);
        year = Number(year);

        // Ensure facultyId is an ObjectId if stored as such
        const requests = await Request.find({
            Approved: true, 
            Faculty: new mongoose.Types.ObjectId(facultyId),
            semester: semester,  
            year: year  
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching approved requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



  exports.getPendingRequests = async (req, res) => {
    try {
        const { facultyId } = req.body; // Extract faculty ID from request body

        if (!facultyId) {
            return res.status(400).json({ message: "Faculty ID is required" });
        }

        // Fetch requests where status is 'pending' and faculty matches the given ID
        const requests = await Request.find({ Status: "pending", Faculty: facultyId });
        

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.findReq = async (req, res) => {
    try {
        const { id, semester } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid team member ID format" });
        }
        const objectId = new mongoose.Types.ObjectId(id);

        // Convert semester to integer
        const semesterNumber = parseInt(semester);
        if (isNaN(semesterNumber)) {
            return res.status(400).json({ message: "Invalid semester number" });
        }

        // Find request where any teamMember._id matches the given id and semester matches
        const request = await Request.findOne({
            "teamMembers.id": objectId,  
            semester: semesterNumber
        });

        if (!request) {
            return res.status(404).json({ message: "No request found for this team member ID and semester." });
        }

        res.status(200).json(request);
    } catch (error) {
        console.error("Error fetching request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getProjectsByEvaluators = async (req, res) => {
    try {
        const { facultyIds, semester, year } = req.body;

        if (!facultyIds || facultyIds.length === 0) {
            return res.status(400).json({ message: "No evaluators found" });
        }

        // Fetch projects where faculty matches any evaluator's faculty ID
        const projects = await Request.find({
            Faculty: { $in: facultyIds },
            semester: semester,
            year: year,
            Approved : true
        });

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getfilteredStudents = async (req, res) => {
    try {
      const { semester, batch } = req.params;
      
      // Find all requests in the same semester/batch with pending/accepted status
      const activeRequests = await Request.find({
        semester,
        batch, // Optional: if batch is tied to branch
        Status: { $in: ["pending", "accepted"] }
      });
  
      // Extract all student IDs already in requests
      const activeStudentIds = activeRequests.flatMap(request => 
        request.teamMembers.map(member => member.id)
      );
  
      res.status(200).json({ activeStudentIds });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  };

  // Add this new method
  exports.getAcceptedCount = async (req, res) => {
    try {
        const { semester, batch } = req.body;
        // Convert to numbers safely
        const semesterNum = parseInt(semester);
        const batchNum = parseInt(batch);
        
        // Validate the numbers
        if (isNaN(semesterNum) || isNaN(batchNum)) {
            return res.status(400).json({ 
                error: "Invalid format",
                message: "Semester and batch must be valid numbers"
            });
        }

        const count = await Request.countDocuments({ 
            semester: semesterNum,
            batch: batchNum,
            Status: "accepted"
        });
        
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error in getAcceptedCount:", error);
        res.status(500).json({ 
            error: "Server error",
            details: error.message 
        });
    }
};

// Update the existing updateRequestStatus method
exports.updateRequestStatus = async (req, res) => {
    try {
        const { requestId, status, temp, groupNo } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({ message: "Request ID and status are required" });
        }

        const updateData = { 
            Status: status, 
            Approved: temp 
        };

        // Only add GroupNo if it's provided (for accepted requests)
        if (groupNo !== undefined) {
            updateData.GroupNo = groupNo;
        }

        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(201).json({ 
            message: `Request updated to ${status}`,
            updatedRequest 
        });
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




exports.downloadReport = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Project_Report_${request.Title.replace(/\s+/g, '_')}.pdf`
        );

        doc.pipe(res);

        // === HEADER ===
        doc.fillColor('#0056b3')
            .fontSize(22)
            .font('Helvetica-Bold')
            .text('PROJECT EVALUATION REPORT', { align: 'center' });

        doc.moveDown(2);

        // === PROJECT INFO SECTION ===
        doc.fontSize(12).fillColor('#000').font('Helvetica-Bold').text('Project Title:', { continued: true }).font('Helvetica').text(` ${request.Title}`);
        doc.font('Helvetica-Bold').text('Faculty Incharge:', { continued: true }).font('Helvetica').text(` ${request.facultyName}`);
        doc.font('Helvetica-Bold').text('Academic Year:', { continued: true }).font('Helvetica').text(` ${request.year}`);
        doc.font('Helvetica-Bold').text('Semester:', { continued: true }).font('Helvetica').text(` ${request.semester}`);
        doc.font('Helvetica-Bold').text('Batch:', { continued: true }).font('Helvetica').text(` ${request.batch}`);

        doc.moveDown(1);
        doc.font('Helvetica-Bold').fillColor('#2e7d32').text(`Evaluation Status: ${request.Status.toUpperCase()}`);
        doc.moveDown(2);

        // === TABLE HEADER ===
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#000').text('Team Member Evaluation Details');
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const margin = 50;
        const rowHeight = 25;
        const colWidth = (doc.page.width - margin * 2) / 7;

        const headers = ['No.', 'Name', 'Roll No', 'Branch', 'Mid Term', 'End Term', 'Grade'];

        // Header Background
        doc.rect(margin, tableTop, doc.page.width - margin * 2, rowHeight).fill('#e0e0e0').stroke();
        doc.fillColor('#000').font('Helvetica-Bold').fontSize(10);

        headers.forEach((header, i) => {
            doc.text(header, margin + i * colWidth + 5, tableTop + 7, { width: colWidth - 10, align: 'center' });
        });

        // Reset fill
        doc.font('Helvetica').fillColor('#000');

        // Table Rows
        let y = tableTop + rowHeight;
        request.teamMembers.forEach((member, index) => {
            doc.rect(margin, y, doc.page.width - margin * 2, rowHeight).fill(index % 2 === 0 ? '#f9f9f9' : '#ffffff').stroke();

            const data = [
                index + 1,
                member.name,
                member.roll.toString(),
                member.branch,
                member.midTermMarks !== null ? member.midTermMarks : '-',
                member.endTermMarks !== null ? member.endTermMarks : '-',
                member.grade || '-'
            ];

            data.forEach((text, i) => {
                doc.fillColor('#000')
                    .text(text.toString(), margin + i * colWidth + 5, y + 7, {
                        width: colWidth - 10,
                        align: 'center',
                    });
            });

            y += rowHeight;
        });

        // === AVERAGE MARKS ===
        const hasMarks = request.teamMembers.some(m => m.totalMarks !== null);
        if (hasMarks) {
            doc.moveDown(2);
            const avgMarks = request.teamMembers.reduce((sum, m) => sum + (m.totalMarks || 0), 0) / request.teamMembers.length;
            doc.font('Helvetica-Bold').fontSize(12).text(`Average Marks: ${avgMarks.toFixed(2)}`, { align: 'right' });
        }

        // === FOOTER ===
        doc.moveDown(2);
        doc.fontSize(10).fillColor('gray').text('This report is system generated and does not require a signature.', {
            align: 'center',
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: "Error generating PDF report" });
    }
};
