// Mock ticket db
const tickets = {
  "ACM-2024-001": {
    ref: "ACM-2024-001",
    subject: "Cannot login to portal",
    status: "OPEN",
    created: "Jan 15, 2024",
    updated: "Jan 15, 2024",
    email: "u****@acme.com",
  },
  "ACM-2024-002": {
    ref: "ACM-2024-002",
    subject: "Invoice amount incorrect",
    status: "IN_PROGRESS",
    created: "Jan 14, 2024",
    updated: "Jan 15, 2024",
    email: "c****@acme.com",
  },
};

let currentTicket = null;
let otpAttempts = 0;
let countdownTimer = null;
let otpValue = "123456"; // mock OTP

const views = {
  search: document.getElementById("search-box"),
  basic: document.getElementById("view-basic"),
  otp: document.getElementById("view-otp"),
  full: document.getElementById("view-full"),
};

function showView(name) {
  Object.entries(views).forEach(
    ([k, el]) => (el.style.display = k === name ? "block" : "none"),
  );
}

function statusPill(s) {
  const map = {
    OPEN: "background:rgba(91,110,245,.12);color:#5b6ef5;border:1px solid rgba(91,110,245,.3)",
    IN_PROGRESS:
      "background:rgba(245,166,35,.12);color:#f5a623;border:1px solid rgba(245,166,35,.3)",
    RESOLVED:
      "background:rgba(56,229,196,.12);color:#38e5c4;border:1px solid rgba(56,229,196,.3)",
    CLOSED:
      "background:rgba(107,114,128,.12);color:#6b7280;border:1px solid rgba(107,114,128,.3)",
  };
  return `style="${map[s] || map.OPEN}"`;
}

document.getElementById("search-btn").addEventListener("click", async () => {
  const ref = document.getElementById("ref-input").value.trim().toUpperCase();
  const btn = document.getElementById("search-btn");
  btn.disabled = true;
  btn.textContent = "Searching...";
  await new Promise((r) => setTimeout(r, 500));
  const ticket = tickets[ref];
  if (!ticket) {
    document.getElementById("search-error").style.display = "block";
    btn.disabled = false;
    btn.textContent = "Find Ticket →";
    return;
  }
  currentTicket = ticket;
  document.getElementById("search-error").style.display = "none";
  document.getElementById("basic-ref").textContent = ticket.ref;
  document.getElementById("basic-subject").textContent = ticket.subject;
  document.getElementById("basic-created").textContent = ticket.created;
  document.getElementById("basic-updated").textContent = ticket.updated;
  const sp = document.getElementById("basic-status");
  sp.textContent = ticket.status.replace("_", " ");
  sp.setAttribute(
    "style",
    statusPill(ticket.status).replace('style="', "").replace('"', ""),
  );
  Object.assign(sp.style, {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: ".7rem",
    fontFamily: "DM Mono,monospace",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: ".08em",
  });
  showView("basic");
  btn.disabled = false;
  btn.textContent = "Find Ticket →";
});

document
  .getElementById("back-btn")
  .addEventListener("click", () => showView("search"));

document
  .getElementById("request-otp-btn")
  .addEventListener("click", async () => {
    const btn = document.getElementById("request-otp-btn");
    btn.disabled = true;
    btn.textContent = "Sending code...";
    await new Promise((r) => setTimeout(r, 800));
    document.getElementById("otp-email-hint").textContent = currentTicket.email;
    showView("otp");
    startCountdown(5 * 60);
    btn.disabled = false;
    btn.textContent = "Send me a verification code";
  });

// OTP input logic
const otpInputs = document.querySelectorAll(".otp-input");
otpInputs.forEach((inp, i) => {
  inp.addEventListener("input", (e) => {
    const val = e.target.value.replace(/\D/g, "");
    e.target.value = val.slice(-1);
    if (val && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    checkOtpFilled();
  });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !inp.value && i > 0) otpInputs[i - 1].focus();
  });
  inp.addEventListener("paste", (e) => {
    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      otpInputs.forEach((el, j) => (el.value = pasted[j] || ""));
      checkOtpFilled();
    }
    e.preventDefault();
  });
});

function checkOtpFilled() {
  const full = [...otpInputs].every((el) => el.value.length === 1);
  document.getElementById("verify-otp-btn").disabled = !full;
}

document
  .getElementById("verify-otp-btn")
  .addEventListener("click", async () => {
    const entered = [...otpInputs].map((el) => el.value).join("");
    const btn = document.getElementById("verify-otp-btn");
    btn.disabled = true;
    btn.textContent = "Verifying...";
    await new Promise((r) => setTimeout(r, 600));
    if (entered === otpValue) {
      clearInterval(countdownTimer);
      showView("full");
    } else {
      otpAttempts++;
      document.getElementById("otp-error").style.display = "block";
      if (otpAttempts >= 3) {
        document.getElementById("otp-error").textContent =
          "Too many attempts. Request a new code.";
        btn.textContent = "Verify Code";
      } else {
        btn.disabled = false;
        btn.textContent = "Verify Code";
      }
    }
  });

document.getElementById("back-to-basic").addEventListener("click", () => {
  clearInterval(countdownTimer);
  showView("basic");
});
document
  .getElementById("back-to-basic2")
  .addEventListener("click", () => showView("basic"));
document.getElementById("resend-otp").addEventListener("click", async () => {
  otpAttempts = 0;
  document.getElementById("otp-error").style.display = "none";
  otpInputs.forEach((el) => (el.value = ""));
  document.getElementById("verify-otp-btn").disabled = true;
  clearInterval(countdownTimer);
  startCountdown(5 * 60);
});

function startCountdown(secs) {
  let remaining = secs;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    remaining--;
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    document.getElementById("countdown").textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      document.getElementById("verify-otp-btn").disabled = true;
      document.getElementById("otp-timer").textContent =
        "Code expired. Please request a new one.";
    }
  }, 1000);
}

// Enter key on search
document.getElementById("ref-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("search-btn").click();
});

showView("search");
