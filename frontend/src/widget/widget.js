(function () {
  "use strict";

  // 1. Configuration and Attribute Extraction
  const scriptTag =
    document.getElementById("supcrud-script") || document.currentScript;
  const workspaceKey = scriptTag?.dataset?.workspace || "";
  const apiBase = scriptTag?.dataset?.api || "http://localhost:3000/api";
  const primaryColor = scriptTag?.dataset?.color || "#4f46e5";

  // 2. Styles Injection (Production-ready CSS)
  const style = document.createElement("style");
  style.textContent = `
    #sc-widget-container { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; position: fixed; bottom: 25px; right: 25px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; }
    .sc-launcher { width: 60px; height: 60px; border-radius: 20px; background: ${primaryColor}; box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: none; outline: none; }
    .sc-launcher:hover { transform: scale(1.1) rotate(5deg); }
    .sc-panel { width: 380px; height: 600px; background: #ffffff; border-radius: 28px; box-shadow: 0 12px 48px rgba(0,0,0,0.15); margin-bottom: 20px; display: none; flex-direction: column; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); animation: scFadeIn 0.3s ease-out; }
    @keyframes scFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .sc-header { background: ${primaryColor}; padding: 30px 25px; color: white; }
    .sc-body { flex: 1; overflow-y: auto; padding: 25px; background: #ffffff; }
    .sc-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
    .sc-input { width: 100%; padding: 14px; margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 14px; font-size: 14px; box-sizing: border-box; transition: border 0.2s; outline: none; }
    .sc-input:focus { border-color: ${primaryColor}; }
    .sc-btn { width: 100%; padding: 16px; background: ${primaryColor}; color: white; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 15px; }
    .sc-btn:hover { filter: brightness(1.1); }
    .sc-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .sc-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .sc-type-opt { padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 12px; text-align: center; font-size: 13px; cursor: pointer; font-weight: 700; background: #f8fafc; transition: all 0.2s; color: #64748b; }
    .sc-type-opt:hover { border-color: ${primaryColor}; }
    .sc-type-opt.active { background: ${primaryColor}; color: white; border-color: ${primaryColor}; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
    .sc-success { text-align: center; padding: 50px 20px; display: none; animation: scFadeIn 0.5s ease; }
    .sc-ref-box { background: #f1f5f9; padding: 18px; border-radius: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 20px; margin: 20px 0; color: ${primaryColor}; border: 2px dashed ${primaryColor}44; }
  `;
  document.head.appendChild(style);

  // 3. Dynamic HTML Structure
  const container = document.createElement("div");
  container.id = "sc-widget-container";
  container.innerHTML = `
    <div class="sc-panel" id="sc-panel">
      <div class="sc-header">
        <h3 style="margin:0; font-size:20px; font-weight:700;">Support Assistant</h3>
        <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">Tell us how we can help you today</p>
      </div>
      <div class="sc-body">
        <div id="sc-form-view">
          <span class="sc-label">Request Type</span>
          <div class="sc-type-grid">
            <div class="sc-type-opt active" data-type="P" title="Petition">P</div>
            <div class="sc-type-opt" data-type="Q" title="Complaint">Q</div>
            <div class="sc-type-opt" data-type="R" title="Claim">R</div>
            <div class="sc-type-opt" data-type="S" title="Suggestion">S</div>
          </div>
          
          <span class="sc-label">Your Email</span>
          <input type="email" id="sc-email" class="sc-input" placeholder="e.g. alex@example.com">
          
          <span class="sc-label">Subject</span>
          <input type="text" id="sc-subject" class="sc-input" placeholder="Brief summary of the issue">
          
          <span class="sc-label">Message Details</span>
          <textarea id="sc-desc" class="sc-input" style="height:120px; resize:none;" placeholder="Describe your case in detail..."></textarea>
          
          <button id="sc-submit" class="sc-btn">Submit Ticket</button>
        </div>

        <div id="sc-success-view" class="sc-success">
          <div style="font-size:52px; margin-bottom:20px;">✨</div>
          <h4 style="margin:0; color:#0f172a; font-size:22px; font-weight:700;">Submission Received!</h4>
          <p style="font-size:14px; color:#64748b; margin-top:10px;">Please save your tracking code:</p>
          <div class="sc-ref-box" id="sc-ref-display">REF-0000</div>
          <p style="font-size:12px; color:#94a3b8; margin-bottom:25px;">Use this code to check your status later.</p>
          <button class="sc-btn" onclick="window.location.reload()">Send Another Message</button>
        </div>
      </div>
    </div>

    <button class="sc-launcher" id="sc-launcher" title="Open Support Chat">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  `;
  document.body.appendChild(container);

  // 4. Interaction Logic
  const launcher = document.getElementById("sc-launcher");
  const panel = document.getElementById("sc-panel");
  const typeOpts = document.querySelectorAll(".sc-type-opt");
  let selectedType = "P";

  launcher.onclick = () => {
    const isVisible = panel.style.display === "flex";
    panel.style.display = isVisible ? "none" : "flex";
  };

  typeOpts.forEach((opt) => {
    opt.onclick = () => {
      typeOpts.forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      selectedType = opt.dataset.type;
    };
  });

  document.getElementById("sc-submit").onclick = async () => {
    const email = document.getElementById("sc-email").value.trim();
    const subject = document.getElementById("sc-subject").value.trim();
    const description = document.getElementById("sc-desc").value.trim();

    if (!email || !subject || !description) {
      return alert("Please fill in all fields before submitting.");
    }

    const btn = document.getElementById("sc-submit");
    btn.disabled = true;
    btn.textContent = "Processing Request...";

    try {
      const res = await fetch(`${apiBase}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceKey,
          email,
          subject,
          description,
          type: selectedType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        document.getElementById("sc-form-view").style.display = "none";
        document.getElementById("sc-success-view").style.display = "block";
        document.getElementById("sc-ref-display").textContent =
          data.referenceCode;
      } else {
        alert("System Error: " + (data.error || "Unable to process ticket."));
      }
    } catch (e) {
      console.error("SupCrud Connection Error:", e);
      alert("Unable to connect to the server. Please try again later.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit Ticket";
    }
  };
})();
