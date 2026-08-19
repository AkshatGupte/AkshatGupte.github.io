// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

// ===== Splash text =====
// The title screen picks a random line on each load, same as the game.
const SPLASHES = [
  "0.869 AUROC!",
  "Now with 65k+ patients!",
  "Spearman rho -0.99!",
  "Every claim fact-checked!",
  "Falsifiable!",
  "4 LLM providers, 0 downtime!",
  "6,377 training examples!",
  "Attention is not explanation!",
  "Retries its own SQL!",
  "252 problems and counting!",
  "Also try PyTorch!",
  "Reproducible!",
  "No fabricated metrics!",
  "QLoRA powered!",
  "Measured, not vibed!",
];
const splashEl = document.getElementById("splash");
if (splashEl) {
  splashEl.textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)];
}

// ===== Advancement toast =====
// Slides in once, the first time the contact section comes into view.
const advancement = document.getElementById("advancement");
const contactSection = document.getElementById("contact");
if (advancement && contactSection) {
  const advObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        advObserver.disconnect();
        advancement.classList.add("show");
        setTimeout(() => advancement.classList.remove("show"), 5000);
      });
    },
    { threshold: 0.4 }
  );
  advObserver.observe(contactSection);
}

// ===== Project detail modal =====
const PROJECTS = {
  temporal: {
    title: "Temporal Attention Mechanisms",
    desc: "Evaluated whether the attention weights of different transformer architectures reflect genuine clinical reasoning, using 65k+ patient MIMIC-IV ICU records.",
    features: [
      "Reached 0.869 AUROC on 65k+ patient MIMIC-IV ICU records",
      "Improved a key attention reliability metric (Spearman rho) from a weak -0.31 to -0.99 by correcting the model architecture and refining how attention was attributed to each prediction",
      "Ran erasure, swap, and SHAP-based faithfulness experiments to separate genuine model reasoning from spurious correlation",
      "Extracted and processed the underlying MIMIC-IV dataset via BigQuery to support the analysis",
    ],
    tags: ["Research", "Transformers", "MIMIC-IV", "SHAP", "BigQuery"],
    github: "https://github.com/AkshatGupte/Research_Temporal_Mechanisms",
  },
  worldcup2026: {
    title: "World Cup 2026 Data Explorer",
    desc: "A natural-language analytics tool that lets non-technical users query match and player data conversationally.",
    features: [
      "Designed a multi-stage NL-to-SQL pipeline (validation, generation, verification, retry) across two SQLite databases for reliable results",
      "Maintained uptime under rate limits by integrating 4 LLM providers (OpenAI, Groq, Cerebras, OpenRouter) with automatic failover, a resilience decision driven by observed production failures",
      "Auto-selected Plotly.js visualizations (bar, radar, scatter) by query intent, so the output format matched the analytical question being asked",
      "Instrumented structured logging across routing, SQL generation, and latency, which informed where the pipeline needed retry logic",
    ],
    tags: ["NL-to-SQL", "SQLite", "Plotly.js", "LLM Routing", "Logging"],
    github: "https://github.com/AkshatGupte/WorldCup-DataExplorer",
    live: "https://world-cup-data-explorer.vercel.app/",
  },
  pokemon: {
    title: "Pokemon Team-Critique Fine-Tuned LLM",
    desc: "A 7B Qwen2.5 model fine-tuned with QLoRA to critique competitive Pokemon teams with grounded, fact-checked feedback.",
    features: [
      "Built 6,377 training examples from Smogon stats, 1,800 game replays, and 1,002 tournament teams, including auto-generated bad teams with known flaws for accurate, label-free training data",
      "Fine-tuning lifted flaw-detection recall from 70.8% to 81.2% and groundedness from 88.3% to 93.8% while halving verbosity (10.3 to 5.9 points per critique) over a prompted baseline",
      "Measured on 443 held-out tournament teams via a machine-gradeable eval with injected known flaws",
      "Engineered a deterministic fact-checker (type chart plus usage stats) that verifies every generated claim, cutting unsupported criticism of top-cut teams from 12.6% to 5.1%",
    ],
    tags: ["Qwen2.5", "QLoRA", "LLM Fine-tuning", "Evaluation", "Fact Checking"],
    github: "https://huggingface.co/Rendred/vgc-critique-qlora",
  },
  mltester: {
    title: "ML Experiment Hypothesis Tester",
    desc: "An agentic ML experimentation framework that analyzes training runs and turns observed failures into falsifiable hypotheses.",
    features: [
      "Analyzes training runs and identifies likely failure modes",
      "Generates falsifiable hypotheses from those failure modes",
      "Selects the highest-confidence hypothesis for experimental validation",
    ],
    tags: ["Agentic ML", "Hypothesis Testing", "Debugging"],
    github: "https://github.com/AkshatGupte/ML-Experiment-Tester",
  },
};

const overlay = document.getElementById("project-modal");
if (overlay) {
  const modal = overlay.querySelector(".modal");
  let lastFocused = null;

  function openProject(key) {
    const p = PROJECTS[key];
    if (!p) return;
    overlay.querySelector(".modal-title").textContent = p.title;
    overlay.querySelector(".modal-desc").textContent = p.desc;
    overlay.querySelector(".modal-features").innerHTML = p.features
      .map((f) => `<li>${f}</li>`)
      .join("");
    overlay.querySelector(".modal-tags").innerHTML = p.tags
      .map((t) => `<li>${t}</li>`)
      .join("");
    let actions = `<a class="btn" href="${p.github}" target="_blank" rel="noopener">View Source</a>`;
    if (p.live) actions = `<a class="btn" href="${p.live}" target="_blank" rel="noopener">Live Demo</a>` + actions;
    overlay.querySelector(".modal-actions").innerHTML = actions;

    // swing the lid of the chest that was opened
    document.querySelectorAll(".project-card.open").forEach(function (c) {
      c.classList.remove("open");
      c.setAttribute("aria-expanded", "false");
    });
    var card = document.querySelector('.project-card[data-project="' + key + '"]');
    if (card) {
      card.classList.add("open");
      card.setAttribute("aria-expanded", "true");
    }

    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("modal-open");
    overlay.querySelector(".modal-close").focus();
  }

  function closeProject() {
    overlay.hidden = true;
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".project-card.open").forEach(function (c) {
      c.classList.remove("open");          // lid drops shut again
      c.setAttribute("aria-expanded", "false");
    });
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".project-card[data-project]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // let GitHub/Live links work normally
      openProject(card.dataset.project);
    });
    card.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a")) {
        e.preventDefault();
        openProject(card.dataset.project);
      }
    });
  });

  const closeButton = overlay.querySelector(".modal-close");
  if (closeButton) closeButton.addEventListener("click", closeProject);
  overlay.addEventListener("click", (e) => {
    if (!modal.contains(e.target)) closeProject();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeProject();
  });
}
