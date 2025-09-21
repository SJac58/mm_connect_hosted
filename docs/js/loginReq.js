// loginReq.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const API_URL = "https://mmconnecthosted-production.up.railway.app";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("input[type=email]").value.trim();
    const password = document.querySelector("input[type=password]").value.trim();
    const role = document.querySelector("select").value;

    if (!email || !password || !role) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ " + data.message);

        if (role === "mentor") {
          // Redirect to dashboard with mentorId in URL
          window.location.href = `dashboardPage.html?mentorId=${data.user.id}`;
        } else {
          alert("⚠️ Only mentors can log in here.");
        }
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("⚠️ Server error. Please try again later.");
    }
  });
});
