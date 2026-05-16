# content-renderer — Promotional Website

A modern, single-page promotional website for the `@laddhaanshul/content-renderer` npm package ecosystem.

## Quick Start

### Prerequisites

- **PHP 7.4+** installed on your machine (the built-in server is sufficient)

### Run Locally

```bash
# Navigate to the website directory
cd website

# Start the PHP built-in server
php -S localhost:8000

# Open in your browser
open http://localhost:8000
```

### Alternative Ports

```bash
php -S localhost:3000
php -S 127.0.0.1:8080
```

## File Structure

```
website/
├── index.php            # Main page (single-page application)
├── assets/
│   ├── style.css        # Complete stylesheet (~700 lines)
│   └── script.js        # JavaScript (animations, tabs, theme, etc.)
└── README.md            # This file
```

## Features

- **Responsive Design** — Mobile-first layout that works on all screen sizes
- **Dark Mode** — Toggle between light and dark themes (persisted in localStorage)
- **Smooth Scrolling** — Anchor navigation with offset for fixed header
- **Scroll Animations** — Fade-in/slide-up effects triggered by IntersectionObserver
- **Tabbed Code Examples** — Switch between 7 interactive code demos
- **Copy to Clipboard** — One-click copy for all code blocks and install commands
- **Animated Counters** — Stats section with eased count-up animation
- **Active Nav Highlighting** — Current section detected on scroll
- **Back to Top Button** — Appears after scrolling past the hero
- **Accessible** — ARIA labels, focus-visible outlines, reduced-motion support

## Customisation

### Version Number

Edit the `$version` variable at the top of `index.php`:

```php
$version = '2.0.0';
```

### Colours

Edit the CSS custom properties in `assets/style.css` under `:root`:

```css
:root {
  --primary: #6C63FF;       /* Brand purple */
  --accent: #00d4ff;         /* Cyan accent */
  --bg-hero-gradient-start: #1a1a2e;  /* Hero dark */
}
```

### Adding Examples

Add a new tab in the Quick Start section by:

1. Adding a `<button>` to `.quickstart__tabs` with a matching `data-panel` attribute
2. Adding a `<div class="quickstart__panel">` with the same `data-panel` value

## License

MIT
