// dashboard.js
const API_URL = "https://mmconnecthosted-production.up.railway.app";

// Get mentorId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const mentorId = urlParams.get("mentorId");

if (!mentorId) {
 alert("⚠️ Mentor not specified. Please log in.");
 window.location.href = "loginPage.html";
}

let deptChart, yearChart;

// Greeting
const res = await fetch(`${API_URL}/api/mentor/${mentorId}`);
const mentor = await res.json();
document.getElementById("greeting-message").textContent = `Welcome, ${mentor.name}`;

async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/api/dashboard/${mentorId}`);
    const data = await res.json();

    // --- Quick Stats ---
    document.getElementById("totalMentees").textContent = data.totalMentees;

    // Overall Progress
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = data.avgProgress + "%";
    progressBar.textContent = data.avgProgress + "%";

    // Overall Attendance
    const attendanceBar = document.getElementById("attendanceBar");
    attendanceBar.style.width = data.avgAttendance + "%";
    attendanceBar.textContent = data.avgAttendance + "%";

    // --- Charts ---
    renderDeptChart(data.perDept);
    renderYearChart(data.perYear);

    // --- Mentees Table ---
    document.getElementById("menteesTable").innerHTML = data.mentees
      .map(
        (m) => `
        <tr>
          <td>${m.name}</td>
          <td>${m.dept}</td>
          <td>${m.semester}</td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
  }
}

// -----------------------------
// Chart functions
// -----------------------------
function renderDeptChart(perDept) {
  const ctx = document.getElementById("deptChart").getContext("2d");
  if (deptChart) deptChart.destroy();
  deptChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(perDept),
      datasets: [
        { label: "Students", data: Object.values(perDept), backgroundColor: "#8d4c45" },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

function renderYearChart(perYear) {
  const ctx = document.getElementById("yearChart").getContext("2d");
  if (yearChart) yearChart.destroy();
  yearChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(perYear).map((y) => "Year " + y),
      datasets: [
        { label: "Students", data: Object.values(perYear), backgroundColor: "#a85c54" },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

// -----------------------------
// Load Today's Meetings
// -----------------------------
async function loadTodaysMeetings() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(`${API_URL}/api/meetings?date=${today}`);
    const meetings = await res.json();

    const ul = document.getElementById("todaysMeetings");
    const myMeetings = meetings.filter((m) => m.mentor_id == mentorId);

    ul.innerHTML = myMeetings.length
      ? myMeetings.map((m) => `<li>${m.time_slot} - ${m.student_name} (${m.reason || "No reason"})</li>`).join("")
      : "<li>No meetings today</li>";
  } catch (err) {
    console.error("❌ Error loading today’s meetings:", err);
  }
}

// -----------------------------
// Init
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadTodaysMeetings();
});
