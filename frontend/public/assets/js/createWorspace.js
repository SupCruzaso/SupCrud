/**
 * Create Workspace Logic
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("create-ws-form");
  const statusMsg = document.getElementById("status-msg");
  const API_URL = "http://localhost:3000/api/workspaces";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");
    const name = document.getElementById("ws-name").value.trim();
    const token = localStorage.getItem("token");

    if (!name) return;

    // UI Feedback
    btn.disabled = true;
    btn.textContent = "Creating...";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (response.ok) {
        statusMsg.textContent = "Workspace created successfully!";
        statusMsg.className = "text-accent block text-center"; // Verde/Accent

        // Redirigir al selector después de 1.5s para que vean sus nuevos espacios
        setTimeout(() => {
          window.location.href = "selector.html";
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to create workspace");
      }
    } catch (error) {
      statusMsg.textContent = error.message;
      statusMsg.className = "text-red-400 block text-center";
      btn.disabled = false;
      btn.textContent = "Create Environment";
    }
  });
});
