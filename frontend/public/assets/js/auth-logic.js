/**
 * SupCrud Authentication Logic
 * Final Version: Fixed dynamic messaging, English UX, and professional state handling.
 */

document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const statusEl =
    document.getElementById("auth-status") ||
    document.getElementById("login-error");

  const API_URL = "http://localhost:3000/api/auth";

  // --- UI Helpers ---
  const showStatus = (message, type = "error") => {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.display = "block";

    // Reset classes and apply based on type
    statusEl.classList.remove("text-red-400", "text-accent");

    if (type === "error") {
      statusEl.classList.add("text-red-400");
    } else {
      statusEl.classList.add("text-accent"); // Success color from your tailwind config
    }

    statusEl.classList.add("fade-up");
    setTimeout(() => {
      statusEl.style.display = "none";
    }, 6000);
  };

  const setLoading = (btn, isLoading, originalText) => {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Processing..." : originalText;
    btn.style.opacity = isLoading ? "0.6" : "1";
    btn.style.cursor = isLoading ? "not-allowed" : "pointer";
  };

  // --- 1. Tab Switching ---
  const switchTab = (showLogin) => {
    if (showLogin) {
      tabLogin.classList.add("bg-card", "text-fg", "border", "border-border");
      tabLogin.classList.remove("text-muted");
      tabRegister.classList.remove(
        "bg-card",
        "text-fg",
        "border",
        "border-border",
      );
      tabRegister.classList.add("text-muted");
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      tabRegister.classList.add(
        "bg-card",
        "text-fg",
        "border",
        "border-border",
      );
      tabRegister.classList.remove("text-muted");
      tabLogin.classList.remove(
        "bg-card",
        "text-fg",
        "border",
        "border-border",
      );
      tabLogin.classList.add("text-muted");
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
    }
  };

  tabLogin?.addEventListener("click", () => switchTab(true));
  tabRegister?.addEventListener("click", () => switchTab(false));

  // --- 2. Login Logic ---
  document.getElementById("login-btn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showStatus("Please fill in all fields.", "error");
      return;
    }

    setLoading(btn, true, "Sign In");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.href = "./selector.html";
      } else {
        showStatus(result.message || "Invalid credentials.", "error");
      }
    } catch (error) {
      console.error("[Login Debug]:", error);
      showStatus("Connection failed. Is the server running?", "error");
    } finally {
      setLoading(btn, false, "Sign In");
    }
  });

  // --- 3. Register Logic ---
  document
    .getElementById("register-btn")
    ?.addEventListener("click", async (e) => {
      e.preventDefault();
      const btn = e.currentTarget;
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-pass").value;

      if (!name || !email || !password) {
        showStatus("All fields are required.", "error");
        return;
      }

      setLoading(btn, true, "Create Account");

      try {
        const response = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          switchTab(true);
          showStatus("Account created! Please sign in.", "success");
        } else {
          showStatus(result.message || "Registration failed.", "error");
        }
      } catch (error) {
        console.error("[Register Debug]:", error);
        showStatus("Server unreachable. Check CORS status.", "error");
      } finally {
        setLoading(btn, false, "Create Account");
      }
    });
});
