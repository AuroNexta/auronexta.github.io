# AuroNexta — Gold Version Two

> Clean, professional redesign of the AuroNexta website.

## 🎨 Design Inspiration

This version features a modern, enterprise-grade design with:

- **Top bar** with country flags, announcements and contact info
- **Sticky header** with clean navigation and mobile hamburger menu
- **Hero carousel** with large gradient backgrounds and animated decorative elements
- **Service cards** in a clean grid with hover effects
- **Two-column about section** with animated graphics
- **Statistics counter strip** with animated count-up
- **News & Updates** section with date badges
- **Project overview** panel with auto-rotating preview
- **Team marquee** with click-to-profile modals
- **Testimonials wheel** (360° rotating circle)
- **Contact section** with info panel + form
- **Multi-column footer** with organized link groups
- **Back to top button**
- **Right-click radial menu** (FAB)

## 📁 File Structure

```
gold version two/
├── index.html          # Main landing page (all sections)
├── projects.html       # Full projects gallery
├── 404.html            # Page not found
├── error.html          # Generic error page
├── maintenance.html    # Under maintenance page
├── css/
│   └── style.css       # Complete stylesheet (~35KB)
├── js/
│   ├── config.js       # Site configuration + demo data
│   └── main.js         # All JavaScript functionality
├── mail/
│   └── send.php        # SMTP contact form handler
├── images/             # For future assets
└── AuroNexta_new_logo.png
```

## 🚀 Features

### Components
| Component | Description |
|-----------|-------------|
| Top Bar | Language flags, announcements, contact info |
| Sticky Header | Logo, navigation, search, mobile menu |
| Hero Carousel | 3 slides with auto-rotation, dots, arrows |
| Services Grid | 6 service cards with icons and hover effects |
| About Section | Two-column layout with animated rings and floating cards |
| Stats Counter | Animated count-up on scroll |
| Project Overview | Auto-rotating preview panel with click-to-expand |
| News Section | 3-column news cards with date badges |
| Projects Grid | Responsive card grid with whitepaper modals |
| Team Marquee | Infinite scroll team strip with profile modals |
| Testimonials Wheel | 360° rotating testimonial circle |
| Contact | Split layout: info panel + form |
| Footer | 4-column footer with social links |

### Interactions
- Scroll-triggered reveal animations
- Active nav highlighting on scroll
- Stats count-up animation on visibility
- Hero carousel auto-rotation (pause on hover)
- Overview auto-cycling project preview
- Team infinite marquee (pause on hover)
- 360° testimonial wheel (auto-rotate)
- Whitepaper fullscreen modal with markdown rendering
- Team profile modal with LinkedIn link
- Right-click radial menu (FAB)
- Back to top button
- Mobile hamburger menu
- Contact form validation + SMTP delivery

## ⚙️ Configuration

### GitHub Integration (Optional)
Edit `js/config.js` to load real data from a GitHub repo:

```js
"github": {
  "owner": "your-username",
  "repo":  "your-data-repo",
  "branch": "main",
  "projectsPath": "projects",
  "profilePath":  "web/profiles"
}
```

### SMTP Email
Edit `mail/send.php` to configure your email settings:

```php
const SMTP_HOST  = 'smtp.gmail.com';
const SMTP_PORT  = 587;
const SMTP_USER  = 'you@company.com';
const SMTP_PASS  = 'your_app_password';
const MAIL_TO    = 'you@company.com';
```

## 📱 Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| 1024px | Tablets (2-column grids) |
| 768px | Small tablets (mobile nav, single column) |
| 480px | Phones (compact hero, stacked buttons) |

## 🎨 Design Tokens

- **Primary Blue**: `#1a56db`
- **Accent Gold**: `#f59e0b`
- **Background**: `#f8f9fb`
- **Surface**: `#ffffff`
- **Text**: `#1e293b` / `#475569`
- **Border**: `#e2e8f0`

## © 2026 AuroNexta
Designed & Developed by VAMSI
