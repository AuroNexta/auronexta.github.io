/* ================================================================
   AURONEXTA — SITE_JSON : positions, functionalities, animations.
   Edit THIS file to reposition sections, change speeds, colors,
   point to your GitHub data repo, and edit demo/fallback content.
================================================================ */
const SITE_JSON = {
  "_doc": "Central declarative map of the whole site. Every dynamic behaviour reads from here.",
  "github": {
    "_doc": "Your DATA repo. Subfolders of projects/ = classes. Each project folder needs whitepaper.md (optional cover.png). profile/ needs First_Last_Role.png + same-name .md",
    "owner": "YOUR_GITHUB_USERNAME",
    "repo": "YOUR_REPO_NAME",
    "branch": "main",
    "projectsPath": "projects",
    "profilePath": "profile"
  },
  "sections": [
    { "id": "#top",           "position": 0, "name": "Header",        "anchor": true },
    { "id": "#services",      "position": 1, "name": "Services Orbit","animation": "orbit",
      "_anim": "3 hubs + satellite icons on tilted elliptical orbits. Slow angular speed. Collision-avoidance: icons within 46px push each other onto different radii." },
    { "id": "#overview",      "position": 2, "name": "Overview",      "animation": "vertical-carousel",
      "_anim": "Right column auto-steps every 3.5s (seamless clone loop). Left preview crossfades project image+title+description. Pauses on hover/focus/offscreen." },
    { "id": "#about",         "position": 3, "name": "What We Do",    "animation": "fade-up on scroll" },
    { "id": "#projects",      "position": 4, "name": "Projects",      "animation": "card fade-up",
      "_func": "Auto-populated from GitHub projects/. Badge color from class. Click = whitepaper.md blog popup. >6 projects shows View More → projects.html" },
    { "id": "#team",          "position": 5, "name": "Meet the Team", "animation": "horizontal marquee carousel",
      "_func": "Auto-populated from GitHub profile/. Name parsed from filename. Click = mini overlay with full LinkedIn profile inline." },
    { "id": "#testimonials",  "position": 6, "name": "Testimonials",  "animation": "wheel carousel",
      "_anim": "Cards fanned on a circle. Auto-rotates every 5s, 1s eased step. Bottom gradient fade keeps message readable. Pauses on hover." },
    { "id": "#contact",       "position": 7, "name": "Contact Us",    "func": "POST → mail/send.php (SMTP)" },
    { "id": "#footer",        "position": 8, "name": "Footer" }
  ],
  "fab": {
    "_doc": "Right-click on EMPTY space opens radial FAB: X in center, buttons at 360°.",
    "radius": 92,
    "links": [
      { "label": "TOP",    "href": "index.html" },
      { "label": "SERVICES","href": "index.html#services" },
      { "label": "OVERVIEW","href": "index.html#overview" },
      { "label": "ABOUT",  "href": "index.html#about" },
      { "label": "PROJECTS","href": "projects.html" },
      { "label": "TEAM",   "href": "index.html#team" },
      { "label": "REVIEWS","href": "index.html#testimonials" },
      { "label": "CONTACT","href": "index.html#contact" }
    ]
  },
  "orbit": {
    "_doc": "hub = which hub the icon orbits. a/b = ellipse radii (px @1000px stage, auto-scaled). tilt deg. speed rad/s. phase start angle.",
    "hubs": {
      "web": { "label": "WEB & NETWORKS",  "color": "#c4009c" },
      "dev": { "label": "DEV & SERVICES",  "color": "#c96a00" },
      "ai":  { "label": "AI & ML",         "color": "#7a00d6" }
    },
    "icons": [
      { "hub": "web", "icon": "🌐", "bg": "#00c395", "a": 165, "b": 95, "tilt": -18, "speed": .20, "phase": 0.5 },
      { "hub": "web", "icon": "🛡️", "bg": "#0063d1", "a": 150, "b": 82, "tilt": -18, "speed": .16, "phase": 2.6 },
      { "hub": "web", "icon": "📡", "bg": "#c4009c", "a": 178, "b": 104,"tilt": -18, "speed": .13, "phase": 4.4 },
      { "hub": "dev", "icon": "🤝", "bg": "#e6b800", "a": 150, "b": 88, "tilt": 8,   "speed": .18, "phase": 1.2 },
      { "hub": "dev", "icon": "📊", "bg": "#009a2d", "a": 168, "b": 98, "tilt": 8,   "speed": .14, "phase": 3.4 },
      { "hub": "dev", "icon": "🚁", "bg": "#c40000", "a": 186, "b": 110,"tilt": 8,   "speed": .11, "phase": 5.2 },
      { "hub": "ai",  "icon": "🤖", "bg": "#0063d1", "a": 150, "b": 86, "tilt": 16,  "speed": .17, "phase": 0.9 },
      { "hub": "ai",  "icon": "⚙️", "bg": "#7a00d6", "a": 170, "b": 98, "tilt": 16,  "speed": .13, "phase": 3.9 },
      { "hub": "ai",  "icon": "🧠", "bg": "#c4009c", "a": 188, "b": 110,"tilt": 16,  "speed": .10, "phase": 5.6 }
    ]
  },
  "classColors": {
    "AGENTIC": "#c4009c", "AI": "#7a00d6", "AI_ML": "#7a00d6", "ROBOTICS": "#009a2d",
    "DRONE": "#c40000", "SOFTWARE": "#0063d1", "WEBSITE": "#00c395",
    "WEB": "#c4009c", "DEV": "#c96a00"
  },
  /* ---------- FALLBACK / DEMO DATA (used only if GitHub not linked or fetch fails) ---------- */
  "demoProjects": [
    { "title": "Booking Bot",  "cls": "AGENTIC",  "desc": "Conversational agent that handles bookings end-to-end.", "md": "# Booking Bot\n\nAn **agentic chatbot** that autonomously handles bookings.\n\n## Architecture\n- LLM planner with tool-calling\n- Calendar + payment integrations\n- Human handoff escalation\n\n## Outcome\n- 24/7 autonomous bookings\n- 38% conversion uplift\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Vision Forecast", "cls": "AI_ML", "desc": "Demand forecasting with temporal ML models.", "md": "# Vision Forecast\n\nTemporal ML pipeline for demand forecasting.\n\n## Stack\n- PyTorch temporal transformers\n- Automated retraining (CI)\n\n## Results\n- 21% MAPE reduction" },
    { "title": "Agro Bot",     "cls": "ROBOTICS", "desc": "Autonomous field scouting rover.", "md": "# Agro Bot\n\nAutonomous rover for crop scouting.\n\n## Highlights\n- RTK-GPS navigation\n- NDVI crop health mapping" },
    { "title": "Sky Survey",   "cls": "DRONE",    "desc": "BVLOS drone corridor mapping.", "md": "# Sky Survey\n\nDrone-based corridor mapping.\n\n## Highlights\n- 4cm GSD orthomosaics\n- Automated flight planning" },
    { "title": "Ledger Lite",  "cls": "SOFTWARE", "desc": "Zero-install bookkeeping PWA.", "md": "# Ledger Lite\n\nOffline-first bookkeeping PWA.\n\n## Highlights\n- CRDT sync\n- Encrypted local vault" },
    { "title": "Nexta Store",  "cls": "WEBSITE",  "desc": "Headless commerce storefront.", "md": "# Nexta Store\n\nHeadless commerce build.\n\n## Highlights\n- 98 Lighthouse performance\n- Edge-rendered pages" },
    { "title": "Support Agent","cls": "AGENTIC",  "desc": "Tier-1 support automation agent.", "md": "# Support Agent\n\nTier-1 support automation.\n\n## Highlights\n- RAG over helpdesk\n- 71% auto-resolution" },
    { "title": "Edge Vision",  "cls": "AI_ML",    "desc": "On-device defect detection.", "md": "# Edge Vision\n\nOn-device visual QC.\n\n## Highlights\n- INT8 quantized CNN\n- 40 FPS on edge TPU" }
  ],
  "demoTeam": [
    { "base": "Hari_Krishnan_Co_Founder",  "bg": "#c96a00", "md": "# Hari Krishnan\n**Co-Founder**\n\n## LinkedIn\n[linkedin.com/in/hari-krishnan-cofounder](https://www.linkedin.com/in/hari-krishnan-cofounder-auronexta)\n\n## Education\n- **MSc Computer Science**, University of Manchester, UK (2018–2020)\n- **BSc IT**, Anna University, Chennai (2014–2018)\n\n## Summary\nNetwork architect & technology leader. 8+ years in cloud infrastructure, enterprise security, agentic automation.\n\n## Work Experience\n- **Co-Founder & CTO**, AuroNexta (2024–Present)\n- **Sr. Network Engineer**, BT Global Services, UK (2021–2024)\n- **Network Lead**, Tata Communications (2019–2021)\n\n## Competencies\n- Network Architecture & SD-WAN\n- Cloud (AWS, Azure, GCP)\n- Cybersecurity & Zero-Trust\n\n## Certifications\n- AWS Solutions Architect Professional\n- Cisco CCNP Enterprise" },
    { "base": "Vamsi_Madhav_Co_Founder",   "bg": "#c4009c", "md": "# Vamsi Madhav\n**Co-Founder & Chief Developer**\n\n## LinkedIn\n[linkedin.com/in/vamsi-madhav-cofounder](https://www.linkedin.com/in/vamsi-madhav-cofounder-auronexta)\n\n## Education\n- **MSc Software Engineering**, University of Bristol, UK (2020–2022)\n- **B.Tech CSE**, SRM Institute (2016–2020)\n\n## Summary\nFull-stack engineer & systems architect. Built AuroNexta's core technology stack from zero to production.\n\n## Work Experience\n- **Co-Founder & CDO**, AuroNexta (2024–Present)\n- **Sr. Full-Stack Developer**, ThoughtWorks, UK (2022–2024)\n- **Software Engineer**, Cognizant, India (2020–2022)\n\n## Competencies\n- JavaScript/TypeScript, Node.js, Python\n- React, Vue.js, NW.js\n- System Architecture & API Design\n- UI/UX Engineering\n\n## Certifications\n- Google Cloud Professional Developer\n- MongoDB Certified Developer" },
    { "base": "Vishnavi_D_Graphic_Designer","bg": "#7a00d6","md": "# Vishnavi D\n**Senior Graphic Designer**\n\n## LinkedIn\n[linkedin.com/in/vishnavi-d-designer](https://www.linkedin.com/in/vishnavi-d-graphic-designer-auronexta)\n\n## Education\n- **MA Visual Communication**, University of the Arts London (UAL), UK (2021–2023)\n- **BA Design**, NIFT Bengaluru (2017–2021)\n\n## Summary\nAward-winning visual designer specialising in brand identity, motion graphics, and UI design.\n\n## Work Experience\n- **Sr. Graphic Designer**, AuroNexta (2024–Present)\n- **Motion Graphics Designer**, Dentsu Creative, London (2023–2024)\n- **Visual Designer**, Landor & Fitch, Bengaluru (2021–2023)\n\n## Competencies\n- Brand Identity & Visual Systems\n- Motion Graphics & After Effects\n- UI/UX Design (Figma)\n- 3D Visualization (Blender)\n\n## Awards\n- Red Dot Design Nominee 2023" },
    { "base": "Aakash_C_Developer",        "bg": "#0063d1", "md": "# Aakash C\n**Senior Software Developer**\n\n## LinkedIn\n[linkedin.com/in/aakash-c-developer](https://www.linkedin.com/in/aakash-c-developer-auronexta)\n\n## Education\n- **MSc Artificial Intelligence**, University of Edinburgh, UK (2022–2024)\n- **B.Tech CS**, VIT Vellore (2018–2022)\n\n## Summary\nSoftware engineer specialising in AI-powered applications, API development, and automated testing.\n\n## Work Experience\n- **Senior Developer**, AuroNexta (2024–Present)\n- **Software Engineer**, BBC Technology, UK (2024)\n- **AI Research Intern**, DeepMind (2023)\n\n## Competencies\n- Python, Java, TypeScript\n- ML Pipelines (PyTorch, TensorFlow)\n- RESTful API Design\n- Automated Testing\n\n## Certifications\n- TensorFlow Developer Certificate\n- Oracle Certified Professional Java" },
    { "base": "Divya_B_Project_Manager",   "bg": "#0084c9", "md": "# Divya B\n**Project Manager**\n\n## LinkedIn\n[linkedin.com/in/divya-b-pm](https://www.linkedin.com/in/divya-b-project-manager-auronexta)\n\n## Education\n- **MBA Operations**, Manchester Business School, UK (2021–2023)\n- **B.Com Honours**, Christ University, Bengaluru (2017–2020)\n\n## Summary\nResults-driven project manager with expertise in Agile delivery, team leadership, and stakeholder management.\n\n## Work Experience\n- **Project Manager**, AuroNexta (2024–Present)\n- **Delivery Manager**, Accenture Technology, UK (2023–2024)\n- **Business Analyst**, KPMG India (2020–2022)\n\n## Competencies\n- Agile (Scrum, Kanban)\n- Stakeholder Management\n- Budget & Resource Planning\n- QA & UAT Coordination\n\n## Certifications\n- PRINCE2 Practitioner\n- Certified Scrum Master (CSM)" },
    { "base": "Vinod_Robotics",            "bg": "#009a2d", "md": "# Vinod\n**Robotics Engineer**\n\n## LinkedIn\n[linkedin.com/in/vinod-robotics](https://www.linkedin.com/in/vinod-robotics-engineer-auronexta)\n\n## Education\n- **M.Tech Robotics & Automation**, SRM Institute of Science & Technology, Chennai (2020–2022)\n- **B.Tech Mechanical**, Anna University (2016–2020)\n\n## Summary\nRobotics specialist with hands-on expertise in ROS2, embedded systems, and autonomous navigation.\n\n## Work Experience\n- **Robotics Engineer**, AuroNexta (2024–Present)\n- **Embedded Systems Engineer**, HAL (2022–2024) — UAV flight control systems\n- **Robotics Intern**, TATA Motors R&D (2021)\n\n## Competencies\n- ROS2 & Robot Operating Systems\n- Embedded C/C++, Python\n- Computer Vision (OpenCV)\n- SLAM & Autonomous Navigation\n\n## Certifications\n- ROS2 Developer Certificate (Open Robotics)" },
    { "base": "Yogi_AR_Drone",             "bg": "#00c395", "md": "# Yogi\n**AR & Drone Specialist**\n\n## LinkedIn\n[linkedin.com/in/yogi-ar-drone](https://www.linkedin.com/in/yogi-ar-drone-specialist-auronexta)\n\n## Education\n- **B.Tech ECE**, MIT Manipal (2018–2022)\n- **Professional Drone Pilot Licence**, DGCA India (2022)\n\n## Summary\nAR developer & drone specialist. Combines aerial photogrammetry with immersive visualisation for inspection & mapping.\n\n## Work Experience\n- **AR & Drone Specialist**, AuroNexta (2024–Present)\n- **Drone Survey Engineer**, Pix4D India (2023–2024) — 200+ aerial missions\n- **AR Developer Intern**, Niantic Remote (2022)\n\n## Competencies\n- UAV Piloting & Flight Operations\n- Photogrammetry (Pix4D, Agisoft)\n- AR Development (ARKit, ARCore, Unity)\n- 3D Mapping & Point Cloud Processing\n\n## Certifications\n- DGCA Drone Pilot Licence\n- Unity Certified Associate" }
  ],
  "demoTestimonials": [
    { "name": "Oliver T", "msg": "The booking agent paid for itself in six weeks. Flawless delivery.", "bg": "#0063d1" },
    { "name": "Priya S",  "msg": "Their drone surveys cut our inspection costs by half.", "bg": "#c4009c" },
    { "name": "James W",  "msg": "Professional, fast, and the whitepapers made everything transparent.", "bg": "#009a2d" },
    { "name": "Ananya R", "msg": "Our storefront went from 61 to 98 Lighthouse. Incredible team.", "bg": "#c96a00" },
    { "name": "Marco B",  "msg": "The robotics rover works rain or shine. Superb engineering.", "bg": "#7a00d6" }
  ]
};
