# AuroNexta — Modern Dark Theme Website

Built with chatbotapp.ai-inspired design language. Deep navy backgrounds, glassmorphic cards, gradient accents, and glow effects.

## Quick Start
```bash
cd AuroNexta-Modern
python -m http.server 8000
# Visit: http://localhost:8000
```

## Design System
| Token | Value |
|-------|-------|
| Background | `#020a0f` deep navy |
| Surface | `rgba(255,255,255,.04)` glass |
| Text primary | `#fff` white |
| Text secondary | `#a4a8af` silver |
| Gradient primary | `#5e43d9 → #1b65be` purple→blue |
| Gradient accent | `#1b65be → #00c395` blue→teal |
| Gradient warm | `#d67b00 → #ba383a` orange→red |

## Configuration
1. Edit `js/config.js` → set GitHub owner/repo for live data
2. Edit `mail/send.php` → set SMTP credentials
3. Uncomment 3 lines in `.htaccess` for maintenance mode

## Features (identical to original)
- ✅ 3-hub orbit engine with collision avoidance
- ✅ Overview vertical carousel (3.5s auto)
- ✅ Projects grid with whitepaper modals
- ✅ Team marquee with mini modals
- ✅ Testimonials wheel carousel (5s auto)
- ✅ Contact form with SMTP backend
- ✅ Right-click FAB radial menu
- ✅ Resume page (?m=slug)
- ✅ Custom error pages (404, 500, 503)
- ✅ Responsive (900px / 600px breakpoints)
- ✅ Reduced motion support
