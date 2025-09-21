let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Render calendar
function renderCalendar(month, year) {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  document.getElementById("monthYear").textContent = monthNames[month] + " " + year;

  let firstDay = new Date(year, month).getDay();
  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  const days = ["S","M","T","W","T","F","S"];
  let tbl = "<tr>" + days.map(d => `<th>${d}</th>`).join("") + "</tr><tr>";

  let i;
  for (i = 0; i < firstDay; i++) tbl += "<td></td>";

  for (let d = 1; d <= daysInMonth; d++) {
    if (i % 7 === 0 && d !== 1) tbl += "</tr><tr>";
    let dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    tbl += `<td data-date="${dateStr}">${d}</td>`;
    i++;
  }
  tbl += "</tr>";
  document.getElementById("calendarTable").innerHTML = tbl;

  document.querySelectorAll("#calendarTable td[data-date]").forEach(cell => {
    cell.addEventListener("click", () => {
      document.getElementById("popupDate").textContent = cell.dataset.date;
      loadMeetingsForDate(cell.dataset.date);
      openPopup();
    });
  });
}

document.getElementById("prevMonth").addEventListener("click", () => {
  if (--currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
});
document.getElementById("nextMonth").addEventListener("click", () => {
  if (++currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
});

function openPopup() {
  document.querySelector(".overlay").style.display = "block";
  document.getElementById("dayPopup").style.display = "block";
}
function closePopup() {
  document.querySelector(".overlay").style.display = "none";
  document.getElementById("dayPopup").style.display = "none";
}
function openAddPopup() {
  document.querySelector(".overlay").style.display = "block";
  document.getElementById("addMeetingPopup").style.display = "block";
}
function closeAddPopup() {
  document.querySelector(".overlay").style.display = "none";
  document.getElementById("addMeetingPopup").style.display = "none";
}

document.getElementById("addMeetingBtn").addEventListener("click", openAddPopup);

// Load meetings for a date
async function loadMeetingsForDate(date) {
  const res = await fetch(`http://localhost:5000/api/meetings?date=${date}`);
  const data = await res.json();
  let html = data.length === 0 ? "<li>No meetings</li>" :
    data.map(m => `<li>${m.time_slot} - ${m.student_name}: ${m.reason}</li>`).join("");
  document.getElementById("dayMeetingsList").innerHTML = html;
}

// Load upcoming meetings
async function loadUpcomingMeetings(query = "") {
  const res = await fetch(`http://localhost:5000/api/upcoming-meetings?search=${query}`);
  const data = await res.json();
  let rows = data.map(m => `
    <tr data-id="${m.meeting_id}">
      <td>${m.meeting_date}</td>
      <td>${m.time_slot}</td>
      <td>${m.student_name}</td>
      <td>${m.reason}</td>
    </tr>
  `).join("");
  document.getElementById("upcomingMeetingsBody").innerHTML = rows;

  document.querySelectorAll("#upcomingMeetingsBody tr").forEach(row => {
    row.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      const id = row.dataset.id;
      if (confirm("Are you sure you want to delete this meeting?")) {
        await fetch(`http://localhost:5000/api/meetings/${id}`, { method: "DELETE" });
        loadUpcomingMeetings();
      }
    });
  });
}

// Add meeting
document.getElementById("addMeetingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    student_reg_num: document.getElementById("studentSelect").value,
    meeting_date: document.getElementById("meetingDate").value,
    time_slot: document.getElementById("meetingTime").value,
    reason: document.getElementById("meetingReason").value,
  };
  await fetch("http://localhost:5000/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  closeAddPopup();
  loadUpcomingMeetings();
  renderCalendar(currentMonth, currentYear);
});

// Search
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  loadUpcomingMeetings(e.target.value);
});

// Load student list
async function loadStudents() {
  const res = await fetch("http://localhost:5000/api/students");
  const data = await res.json();
  let options = data.map(s => `<option value="${s.student_reg_num}">${s.name}</option>`).join("");
  document.getElementById("studentSelect").innerHTML = options;
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar(currentMonth, currentYear);
  loadUpcomingMeetings();
  loadStudents();
});
