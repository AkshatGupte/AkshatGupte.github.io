// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => links.classList.toggle("open"));
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("open"))
);

// Scroll reveal
const revealTargets = document.querySelectorAll(
  ".project-card, .skill-group, .stat-card, .about-text, .section-title"
);
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
};

const overlay = document.getElementById("project-modal");
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

overlay.querySelector(".modal-close").addEventListener("click", closeProject);
overlay.addEventListener("click", (e) => {
  if (!modal.contains(e.target)) closeProject();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeProject();
});

// Animated counters for stats
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
document.querySelectorAll(".stat-num").forEach((el) => statObserver.observe(el));
