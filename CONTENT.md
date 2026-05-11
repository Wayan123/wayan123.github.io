# Content Update Guide

All dynamic content on the portfolio lives in **JSON blocks at the bottom of `index.html`**. You never need to touch the layout, styling, or JavaScript to add, remove, or reorder entries.

> Open `index.html`, scroll to the marker `DATA BLOCKS`. Each section has its own `<script type="application/json" id="data-*">` block with a template shown in the surrounding comment.

## Quick rules

1. **Valid JSON only.** Commas between items, double-quoted strings, no trailing comma.
2. **Order matters.** The top-most item renders first.
3. **Missing fields are fine** if the template marks them optional — the renderer hides empty bits.
4. **Keep external links using `https://`** and they automatically open in a new tab.
5. **After editing, commit and push.** GitHub Pages redeploys on every push to `main`.

## Validate before you push

Run this inside the project folder — it fails loudly if any JSON block breaks.

```bash
node -e "
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');
for (const id of ['data-experience','data-projects','data-competitions','data-publications','data-talks','data-courses','data-certifications','data-awards']) {
  const m=h.match(new RegExp('id=\"'+id+'\">([\\\\s\\\\S]*?)</script>'));
  try { JSON.parse(m[1]); console.log('OK', id); } catch(e){ console.log('FAIL', id, e.message); process.exit(1); }
}
"
```

## Section-by-section

### Experience (`#data-experience`)

Drop a new object at the **top** (most recent first).

```json
{
  "period": "Jun 2024 — Now",
  "role": "Senior AI Engineer",
  "org": "Company Name",
  "orgUrl": "https://company.example",
  "bullets": [
    "First responsibility.",
    "Second responsibility."
  ]
}
```

- `bullets` can be replaced by `"summary": "A single paragraph instead of bullets."`
- `orgUrl` is optional.

### Projects (`#data-projects`)

```json
{
  "title": "Project Name",
  "kicker": "Domain / Category",
  "description": "One or two sentences — avoid filler.",
  "tags": ["Computer Vision", "Python"],
  "image": "images/your-thumb.jpg",
  "links": [
    { "label": "Repository", "url": "https://github.com/..." },
    { "label": "Live demo", "url": "https://..." }
  ]
}
```

- `tags` are auto-collected into the filter pills at the top of the Projects section. Reuse existing tag names so the list stays tidy.
- `image` is optional.

### Competitions (`#data-competitions`)

```json
{
  "year": "2024",
  "title": "Contest Name",
  "venue": "Location / Host",
  "result": "1st Place",
  "description": "One sentence that says what made it memorable.",
  "image": "images/comp.jpg"
}
```

### Publications (`#data-publications`)

```json
{
  "title": "Paper Title",
  "authors": "Author A, Author B, Author C",
  "venue": "Conference / Journal Name",
  "year": "2025",
  "type": "Conference paper",
  "abstract": "One paragraph summary.",
  "links": [
    { "label": "DOI", "url": "https://doi.org/..." },
    { "label": "PDF", "url": "https://..." }
  ]
}
```

### Talks (`#data-talks`)

```json
{
  "date": "Apr 2025",
  "title": "Talk Title",
  "venue": "Event / Host Organization",
  "role": "Speaker",
  "scope": "National"
}
```

- `scope` accepts `"National"` or `"International"` — controls the coloured badge.

### Courses / Teaching (`#data-courses`)

```json
{
  "title": "Course Title",
  "domain": "AI / Hardware / …",
  "level": "Foundation",
  "description": "What students walk out with.",
  "outcomes": ["Skill 1", "Skill 2"]
}
```

- `level` is a free-form string — suggested values: `Foundation`, `Intermediate`, `Advanced`.

### Certifications (`#data-certifications`)

Starts empty (`[]`) and shows a graceful placeholder until you add entries.

```json
{
  "title": "Deep Learning Specialization",
  "issuer": "DeepLearning.AI / Coursera",
  "year": "2024",
  "summary": "Five-course program on CNNs, RNNs, and sequence models.",
  "tags": ["Deep Learning", "Coursera"],
  "verifyUrl": "https://coursera.org/verify/XYZ123"
}
```

### Awards (`#data-awards`)

```json
{
  "year": "2025",
  "scope": "National",
  "title": "Award Name",
  "description": "One sentence of context."
}
```

## Where to put new images

Save them under `images/` using a short lowercase filename (`project-name.jpg`, `talk-unsri-2025.jpg`). Reference them with the relative path `images/filename.jpg`.

Keep images under ~500 KB. The existing `compress-images.py` helper in the repo can squeeze JPEGs:

```bash
python compress-images.py
```

## Previewing locally

GitHub Pages builds automatically. To preview locally before pushing:

```bash
# From the project folder
python -m http.server 8000
# Then open http://localhost:8000
```

Any static file server works — the site has no build step.

## Changing the hero stats

The hero numbers (`3+ years in AI`, `14+ talks`, etc.) are hard-coded in `index.html` inside `<section class="hero">`. Search for `hero__stats` and edit the four `.stat` blocks directly.

## Restoring the old design

The previous template (HTML5 UP Dimension) is preserved as `index.legacy.html`. It is not linked from anywhere but you can reference it or revert with:

```bash
cp index.legacy.html index.html
```
