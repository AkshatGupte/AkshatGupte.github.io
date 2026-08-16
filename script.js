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

// Scroll reveal
const revealTargets = document.querySelectorAll(
  ".project-card, .skill-group, .stat-card, .about-text, .section-title"
);
if (revealTargets.length) {
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// ===== Project detail modal =====
const PROJECTS = {
  retinopathy: {
    icon: "🩺",
    title: "Diabetic Retinopathy Detection",
    desc: "An end-to-end deep learning project that classifies retinal fundus images into diabetic retinopathy severity levels, built with CNNs and MobileNetV2 transfer learning. The pipeline covers everything from raw image preprocessing to explainable predictions.",
    features: [
      "Image preprocessing pipeline for retinal fundus photographs",
      "Class balancing to handle the skewed distribution of DR severity levels",
      "Transfer learning with MobileNetV2 for efficient, accurate training",
      "Grad-CAM visualizations that highlight which regions of the retina drove each prediction",
    ],
    tags: ["TensorFlow", "CNN", "MobileNetV2", "Transfer Learning", "Grad-CAM"],
    github: "https://github.com/AkshatGupte/DiabeticRetinopathyProject",
  },
  multiagent: {
    icon: "🤖",
    title: "Multi-Agent Outage Simulator",
    desc: "A multi-agent environment where cooperating AI agents work together to diagnose and fix an outage in a simulated production system — modeling how autonomous agents can coordinate on real incident-response workflows.",
    features: [
      "Simulated production system that can enter realistic outage states",
      "Multiple specialized agents collaborating toward a shared goal",
      "Agent coordination and task hand-off during incident resolution",
    ],
    tags: ["Python", "Multi-Agent Systems", "LLMs", "Orchestration"],
    github: "https://github.com/AkshatGupte/MultiAgent-Simulator",
  },
  worldcup: {
    icon: "⚽",
    title: "World Cup Data Explorer",
    desc: "A deployed application for exploring World Cup data — from fixtures and results down to player-level statistics. Live on Vercel.",
    features: [
      "Browse World Cup fixtures and match data",
      "Drill down into player-level statistics",
      "Deployed and publicly accessible on Vercel",
    ],
    tags: ["Python", "Data Analysis", "Vercel"],
    github: "https://github.com/AkshatGupte/WorldCup-DataExplorer",
    live: "https://world-cup-data-explorer.vercel.app",
  },
  codebase: {
    icon: "💬",
    title: "CodeBase Agent",
    desc: "An agentic application that answers natural-language questions over an entire codebase — point it at a repository and ask it how things work.",
    features: [
      "Natural-language Q&A grounded in real source code",
      "Agentic workflow that navigates and reasons over the repository",
      "Useful for onboarding onto unfamiliar codebases quickly",
    ],
    tags: ["Python", "LLM Agents", "Code Understanding"],
    github: "https://github.com/AkshatGupte/CodeBase-Agent",
  },
  ttyd: {
    icon: "📊",
    title: "Talk To Your Data (LangGraph)",
    desc: "A LangGraph workflow that lets users upload a CSV file and perform data analysis through a conversational chatbot — ask questions in plain English, get analysis back.",
    features: [
      "CSV upload with automatic data understanding",
      "Conversational interface for exploratory data analysis",
      "LangGraph-orchestrated workflow behind the chatbot",
    ],
    tags: ["LangGraph", "Chatbot", "Data Analysis", "Python"],
    github: "https://github.com/AkshatGupte/TTYD-LangGraph",
  },
  medical: {
    icon: "🏥",
    title: "AI Medical Assistant (RAG)",
    desc: "A generative-AI medical assistant that uses retrieval-augmented generation to ground its answers in medical knowledge instead of relying on the model's memory alone.",
    features: [
      "Retrieval-augmented generation over medical reference material",
      "Grounded answers that cite retrieved context",
      "Conversational chatbot interface",
    ],
    tags: ["RAG", "GenAI", "LLMs", "Vector Search"],
    github: "https://github.com/AkshatGupte/MedicalChatbotGenAI",
  },
  research: {
    icon: "🔬",
    title: "Temporal Attention Research",
    desc: "Independent research investigating the faithfulness and plausibility of temporal attention mechanisms — do attention weights actually explain what temporal models are doing? All notebooks and model implementations are open.",
    features: [
      "Model implementations for temporal attention experiments",
      "Analysis of attention faithfulness (does attention reflect true model reasoning?)",
      "Analysis of plausibility (do attention patterns match human intuition?)",
    ],
    tags: ["Research", "Attention Mechanisms", "Interpretability", "Jupyter"],
    github: "https://github.com/AkshatGupte/Research_Temporal_Mechanisms",
  },
  coursecompass: {
    icon: "🎓",
    title: "Course Compass",
    desc: "A course recommendation website that helps students discover the right courses for their goals. Built with TypeScript and live on Vercel.",
    features: [
      "Personalized course recommendations",
      "Full-stack TypeScript web application",
      "Deployed and publicly accessible on Vercel",
    ],
    tags: ["TypeScript", "React", "Vercel"],
    github: "https://github.com/AkshatGupte/Course-Compass",
    live: "https://coursecompass-gamma.vercel.app",
  },
  temporal: {
    icon: "🔬",
    title: "Temporal Attention Mechanisms",
    desc: "Evaluated whether transformer attention weights reflect genuine clinical reasoning on 65k+ patient MIMIC-IV ICU records.",
    features: [
      "Analyzed whether attention weights matched genuine clinical reasoning",
      "Worked with 65k+ patient MIMIC-IV ICU records and achieved 0.869 AUROC",
      "Improved Spearman rho from -0.31 to -0.99 by correcting architecture and attribution",
      "Ran erasure, swap, and SHAP-based faithfulness experiments",
      "Extracted and processed the underlying dataset via BigQuery",
    ],
    tags: ["Research", "Transformers", "MIMIC-IV", "SHAP", "BigQuery"],
    github: "https://github.com/AkshatGupte/Research_Temporal_Mechanisms",
  },
  worldcup2026: {
    icon: "⚽",
    title: "World Cup 2026 Data Explorer",
    desc: "A natural-language analytics tool that lets non-technical users query match and player data conversationally.",
    features: [
      "Built a multi-stage NL-to-SQL pipeline with validation, generation, verification, and retry",
      "Used two SQLite databases for reliable query execution",
      "Integrated 4 LLM providers with automatic failover for uptime under rate limits",
      "Auto-selected Plotly.js charts based on query intent",
      "Instrumented structured logging across routing, SQL generation, and latency",
    ],
    tags: ["NL-to-SQL", "SQLite", "Plotly.js", "LLM Routing", "Logging"],
    github: "https://github.com/AkshatGupte/WorldCup-DataExplorer",
    live: "https://world-cup-data-explorer.vercel.app/",
  },
  pokemon: {
    icon: "🎮",
    title: "Competitive Pokémon Team-Critique Fine-Tuned LLM",
    desc: "A 7B Qwen2.5 model fine-tuned with QLoRA to critique Pokémon teams using fact-checked, grounded feedback.",
    features: [
      "Built 6,377 training examples from Smogon stats, 1,800 game replays, and 1,002 tournament teams",
      "Fine-tuning lifted flaw-detection recall from 70.8% to 81.2% and groundedness from 88.3% to 93.8%",
      "Cut verbosity nearly in half from 10.3 to 5.9 points per critique",
      "Engineered a deterministic fact-checker using type chart and usage stats",
      "Reduced unsupported criticism of top-cut teams from 12.6% to 5.1%",
    ],
    tags: ["Qwen2.5", "QLoRA", "LLM Fine-tuning", "Evaluation", "Fact Checking"],
    github: "https://huggingface.co/Rendred/vgc-critique-qlora",
  },
  mltester: {
    icon: "🧪",
    title: "ML Experiment Hypothesis Tester",
    desc: "An agentic ML experimentation framework that analyzes training runs and turns observed failures into falsifiable hypotheses.",
    features: [
      "Analyzes training runs and identifies likely failure modes",
      "Generates falsifiable hypotheses and selects the highest-confidence one for validation",
      "Evaluates class imbalance, train-validation gaps, distribution drift, preprocessing differences, and leakage",
      "Implements a hypothesis → experiment → result → verdict feedback loop for iterative debugging",
    ],
    tags: ["Agentic ML", "Hypothesis Testing", "Debugging", "Drift", "Leakage"],
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
    overlay.querySelector(".modal-icon").textContent = p.icon;
    overlay.querySelector(".modal-title").textContent = p.title;
    overlay.querySelector(".modal-desc").textContent = p.desc;
    overlay.querySelector(".modal-features").innerHTML = p.features
      .map((f) => `<li>${f}</li>`)
      .join("");
    overlay.querySelector(".modal-tags").innerHTML = p.tags
      .map((t) => `<li>${t}</li>`)
      .join("");
    let actions = `<a class="btn btn-outline" href="${p.github}" target="_blank" rel="noopener">View on GitHub ↗</a>`;
    if (p.live) actions = `<a class="btn" href="${p.live}" target="_blank" rel="noopener">Live Demo ↗</a>` + actions;
    overlay.querySelector(".modal-actions").innerHTML = actions;

    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("modal-open");
    overlay.querySelector(".modal-close").focus();
  }

  function closeProject() {
    overlay.classList.add("closing");
    setTimeout(() => {
      overlay.classList.remove("closing");
      overlay.hidden = true;
      document.body.classList.remove("modal-open");
      if (lastFocused) lastFocused.focus();
    }, 190);
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

// Animated counters for stats
const statNumbers = document.querySelectorAll(".stat-num");
if (statNumbers.length) {
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNumbers.forEach((el) => statObserver.observe(el));
}
