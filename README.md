# Snake — Minimal Web Game

A lightweight, responsive Snake game you can host anywhere (GitHub Pages, Netlify, Vercel). No frameworks, just **HTML + CSS + JavaScript**.

## Features
- Smooth canvas rendering with `requestAnimationFrame`
- Keyboard (WASD/Arrow), touch swipe, and on‑screen D‑Pad
- Pause/Resume, Restart, adjustable **Speed (1x–5x)** and **Grid size**
- LocalStorage **High Score**
- Mobile‑friendly, responsive UI

## Quick Start
Open `index.html` in your browser.

## Deploy to GitHub Pages
1. Create a new repository, e.g., `snake-game`.
2. Upload these files (or unzip and push via Git).
3. In **Settings → Pages**, set the branch to `main` and the folder to `/ (root)`.
4. Your site will be live at: `https://<your-username>.github.io/<repo-name>/`

### Using Git
```bash
git init
git add .
git commit -m "Add Snake web game"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Controls
- **Move**: Arrow Keys / WASD / D‑Pad / Swipe
- **Pause/Resume**: Space / ⏯
- **Restart**: Enter / ⟲
- **Sliders**: Speed & Grid size

## Customization
- Tweak initial grid size via the `value` of the `#grid` range input in `index.html`.
- Adjust colors in `styles.css` (`:root` variables).
- Change tick rate mapping in `setSpeed()` inside `game.js`.

## License
MIT — do what you like, keep the copyright notice.
