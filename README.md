# Akshat Gupte — Portfolio

Personal portfolio website. Pure HTML/CSS/JS — no build step required.

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (free)

**Vercel** (you already use it):
```bash
npx vercel
```

**GitHub Pages:**
1. Push this folder to a repo named `AkshatGupte.github.io`
2. It goes live at `https://akshatgupte.github.io`

## Customize

- **Content**: everything lives in `index.html` — about text, projects, skills, stats.
- **Colors/fonts**: CSS variables at the top of `styles.css` (`--accent`, `--bg`, etc.).
- **Stats counters**: update the `data-count` attributes in the Stats section.
