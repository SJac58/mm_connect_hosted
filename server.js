// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const db = require("./config/db"); // DB connection

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -----------------------------
// Serve frontend (optional)
// -----------------------------
app.use(express.static(path.join(__dirname, "docs")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "docs/loginPage.html"));
});

// -----------------------------
// Login
// -----------------------------
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: "All fields are required" });

  const table = role === "mentor" ? "mentors" : "students";

  try {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid email" });

    const user = rows[0];
    if (password !== user.password) return res.status(401).json({ message: "Invalid password" });

    res.json({
      message: "Login successful ✅",
      user: {
        id: role === "mentor" ? user.mentor_id : user.student_reg_num,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// Dashboard stats
// -----------------------------
app.get("/api/dashboard/:mentorId", async (req, res) => {
  const { mentorId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT st.student_reg_num, st.name, st.dept, st.semester, st.year,
              COALESCE(AVG((sp.CIA1 + sp.CIA2 + sp.CIA3 + sp.ESE)/4),0) AS avg_progress,
              COALESCE(AVG(sp.attendance),0) AS avg_attendance
       FROM mentor_mentee mm
       JOIN students st ON mm.student_reg_num = st.student_reg_num
       LEFT JOIN student_performance sp ON st.student_reg_num = sp.student_reg_num
       WHERE mm.mentor_id = ?
       GROUP BY st.student_reg_num, st.name, st.dept, st.semester, st.year
       ORDER BY st.name ASC`,
      [mentorId]
    );

    const totalMentees = rows.length;
    const perDept = {};
    const perYear = {};
    let totalProgress = 0;
    let totalAttendance = 0;

    rows.forEach(m => {
      perDept[m.dept] = (perDept[m.dept] || 0) + 1;
      perYear[m.year] = (perYear[m.year] || 0) + 1;
      totalProgress += Number(m.avg_progress) || 0;
      totalAttendance += Number(m.avg_attendance) || 0;
    });

    const avgProgress = totalMentees ? (totalProgress / totalMentees).toFixed(2) : 0;
    const avgAttendance = totalMentees ? (totalAttendance / totalMentees).toFixed(2) : 0;

    res.json({ totalMentees, perDept, perYear, avgProgress, avgAttendance, mentees: rows });
  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// -----------------------------
// Mentor info
// -----------------------------
app.get("/api/mentor/:mentorId", async (req, res) => {
    const { mentorId } = req.params;
    const [rows] = await db.query("SELECT mentor_id, name FROM mentors WHERE mentor_id = ?", [mentorId]);
    res.json(rows[0] || null);
});

// -----------------------------
// Mentees list
// -----------------------------
app.get("/api/mentees", async (req, res) => {
  try {
    const sql = `SELECT st.student_reg_num, st.name, st.dept, st.semester,
                 COALESCE(AVG((sp.CIA1+sp.CIA2+sp.CIA3+sp.ESE)/4),0) AS avg_progress
                 FROM students st
                 LEFT JOIN student_performance sp ON st.student_reg_num = sp.student_reg_num
                 GROUP BY st.student_reg_num, st.name, st.dept, st.semester
                 ORDER BY st.name ASC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ Mentees fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// Student profile
// -----------------------------
function tryParseJSON(value) {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    if (Array.isArray(v)) return v;
    if (v.activities && Array.isArray(v.activities)) return v.activities;
    return [String(value)];
  } catch (e) {
    return String(value).split(",").map(s => s.trim()).filter(Boolean);
  }
}

app.get("/api/student/:regNum", async (req, res) => {
  const { regNum } = req.params;
  try {
    const [students] = await db.query(
      `SELECT student_reg_num, name, class, dept, semester, year FROM students WHERE student_reg_num = ?`,
      [regNum]
    );
    if (students.length === 0) return res.status(404).json({ message: "Student not found" });
    const student = students[0];

    const [performances] = await db.query(
      `SELECT performance_id, semester, CIA1, CIA2, CIA3, ESE, attendance, extra_curricular
       FROM student_performance
       WHERE student_reg_num = ?
       ORDER BY semester ASC`,
      [regNum]
    );

    let extracurricular = [];
    for (let i = performances.length - 1; i >= 0; i--) {
      if (performances[i].extra_curricular) {
        extracurricular = tryParseJSON(performances[i].extra_curricular);
        break;
      }
    }

    const [meetings] = await db.query(
      `SELECT m.meeting_id, m.mentor_id, m.student_reg_num, m.meeting_date, m.time_slot, 
              m.reason, m.feedback, m.created_at,
              s.name as student_name
       FROM meetings m
       JOIN students s ON m.student_reg_num = s.student_reg_num
       WHERE m.student_reg_num = ?
       ORDER BY m.meeting_date ASC, m.time_slot ASC`,
      [regNum]
    );

    const nowDate = new Date().toISOString().slice(0, 10);
    const meetingsPast = meetings.filter(m => new Date(m.meeting_date).toISOString().slice(0, 10) < nowDate);
    const meetingsUpcoming = meetings.filter(m => new Date(m.meeting_date).toISOString().slice(0, 10) >= nowDate);

    const [notes] = await db.query(
      `SELECT id, mentor_id, student_reg_num, note, created_at, updated_at 
       FROM mentor_notes 
       WHERE student_reg_num = ? ORDER BY created_at DESC`,
      [regNum]
    );

    res.json({ student, performances, extracurricular, meetingsPast, meetingsUpcoming, notes });
  } catch (err) {
    console.error("❌ Student profile fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// Mentor Notes
// -----------------------------
app.post("/api/notes", async (req, res) => {
  const { mentor_id, student_reg_num, note } = req.body;
  if (!mentor_id || !student_reg_num || !note) return res.status(400).json({ message: "mentor_id, student_reg_num and note are required" });
  try {
    const [result] = await db.query(
      `INSERT INTO mentor_notes (mentor_id, student_reg_num, note, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [mentor_id, student_reg_num, note]
    );
    res.json({ message: "Note saved ✅", note_id: result.insertId });
  } catch (err) {
    console.error("❌ Save note error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/api/notes/:student_reg_num", async (req, res) => {
  const { student_reg_num } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, mentor_id, student_reg_num, note, created_at, updated_at 
       FROM mentor_notes 
       WHERE student_reg_num = ? ORDER BY created_at DESC`,
      [student_reg_num]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch notes error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// Meetings (CRUD)
// -----------------------------
app.get("/api/meetings", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date is required" });
  try {
    const [rows] = await db.query(
      `SELECT m.meeting_id, m.mentor_id, m.student_reg_num, m.meeting_date, m.time_slot,
              m.reason, m.feedback, m.created_at, m.updated_at,
              s.name AS student_name, s.dept, s.semester
       FROM meetings m
       JOIN students s ON m.student_reg_num = s.student_reg_num
       WHERE DATE(m.meeting_date) = ?
       ORDER BY m.time_slot ASC`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Meetings fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/api/upcoming-meetings", async (req, res) => {
  const { search } = req.query;
  try {
    let sql = `
      SELECT m.meeting_id, m.mentor_id, m.student_reg_num, m.meeting_date, m.time_slot,
             m.reason, m.feedback, m.created_at, m.updated_at,
             s.name AS student_name, s.dept, s.semester
      FROM meetings m
      JOIN students s ON m.student_reg_num = s.student_reg_num
      WHERE m.meeting_date >= CURDATE()
    `;
    let params = [];
    if (search) {
      sql += ` AND (s.name LIKE ? OR m.reason LIKE ? OR m.feedback LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY m.meeting_date ASC, m.time_slot ASC`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("❌ Upcoming meetings fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT student_reg_num, name, dept, semester, year
       FROM students
       ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Students fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/meetings", async (req, res) => {
  const { student_reg_num, meeting_date, time_slot, reason } = req.body;
  if (!student_reg_num || !meeting_date || !time_slot) return res.status(400).json({ message: "All fields are required" });
  try {
    const mentorId = 1; // TODO: replace with logged-in mentor ID
    const [result] = await db.query(
      `INSERT INTO meetings (mentor_id, student_reg_num, meeting_date, time_slot, reason, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [mentorId, student_reg_num, meeting_date, time_slot, reason]
    );
    res.json({ message: "Meeting added successfully ✅", meeting_id: result.insertId });
  } catch (err) {
    console.error("❌ Add meeting error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.delete("/api/meetings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(`DELETE FROM meetings WHERE meeting_id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Meeting not found" });
    res.json({ message: "Meeting deleted successfully ✅" });
  } catch (err) {
    console.error("❌ Delete meeting error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
