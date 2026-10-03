# WebShark.ai

WebShark.ai is a static landing page for the broader WebShark suite. It highlights the collection, lets visitors browse by category, and includes a lightweight in-browser SharkBoard for sharing short posts locally.

![Swimming Shark](./shark.svg)

## What is in this repo

- `index.html` - page structure and suite catalog
- `styles.css` - visual design, animations, and responsive styling
- `script.js` - interaction logic for search, filters, audio, shortcuts, and SharkBoard

There is no build step, framework, or package manager.

## Local preview

Open `index.html` directly in a browser, or serve the directory with any static server.

Example:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Current behavior

- suite cards can be filtered by category or searched by text
- keyboard shortcuts are available via `?`
- ambient audio is optional and visitor-controlled
- SharkBoard stores posts in `localStorage`, so its content is browser-local rather than shared across devices

## Maintenance notes

- when adding a new suite card, keep its `data-tags` aligned with an available filter chip
- if a new interaction is exposed in the UI, ensure the page actually loads the script that powers it


