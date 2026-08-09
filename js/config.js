const SITE_JSON = {
  /* ═══════════════════════════════════════════════════════════════
     SECTION A — GITHUB DATA LOADER (COMMENTED OUT)
     Uncomment + fill credentials. Comment out SECTION B.
     ═══════════════════════════════════════════════════════════════
  "github": {
    "owner":  "YOUR_USERNAME",
    "repo":   "YOUR_DATA_REPO",
    "branch": "main",
    "projectsPath":  "projects",
    "profilePath":   "web/profiles"
  },
  */
  "github": {
    "owner": "YOUR_GITHUB_USERNAME",
    "repo":  "YOUR_REPO_NAME",
    "branch": "main",
    "projectsPath": "projects",
    "profilePath":  "web/profiles"
  },

  /* ═══════════════════════════════════════════════════════════════
     SECTION B — DUMMY / DEMO DATA (ACTIVE)
     Comment everything below when switching to SECTION A.
     ═══════════════════════════════════════════════════════════════ */

  "fab": {
    "radius": 80,
    "links": [
      { "label": "TOP",     "href": "index.html" },
      { "label": "SERVICES","href": "index.html#services" },
      { "label": "OVERVIEW","href": "index.html#overview" },
      { "label": "ABOUT",   "href": "index.html#about" },
      { "label": "PROJECTS","href": "projects.html" },
      { "label": "TEAM",    "href": "index.html#team" },
      { "label": "REVIEWS", "href": "index.html#testimonials" },
      { "label": "CONTACT", "href": "index.html#contact" }
    ]
  },

  "orbit": {
    "hubs": {
      "web": { "label": "WEB & NETWORKS",  "color": "#c4009c" },
      "dev": { "label": "DEV & SERVICES",  "color": "#c96a00" },
      "ai":  { "label": "AI & ML",         "color": "#7a00d6" }
    },
    "icons": [
      { "hub": "web", "icon": "🌐", "bg": "#00c395", "a": 165, "b": 95, "speed": .20, "phase": 0.5 },
      { "hub": "web", "icon": "🛡️", "bg": "#0063d1", "a": 150, "b": 82, "speed": .16, "phase": 2.6 },
      { "hub": "web", "icon": "📡", "bg": "#c4009c", "a": 178, "b": 104,"speed": .13, "phase": 4.4 },
      { "hub": "dev", "icon": "🤝", "bg": "#e6b800", "a": 150, "b": 88, "speed": .18, "phase": 1.2 },
      { "hub": "dev", "icon": "📊", "bg": "#009a2d", "a": 168, "b": 98, "speed": .14, "phase": 3.4 },
      { "hub": "dev", "icon": "🚁", "bg": "#c40000", "a": 186, "b": 110,"speed": .11, "phase": 5.2 },
      { "hub": "ai",  "icon": "🤖", "bg": "#0063d1", "a": 150, "b": 86, "speed": .17, "phase": 0.9 },
      { "hub": "ai",  "icon": "⚙️", "bg": "#7a00d6", "a": 170, "b": 98, "speed": .13, "phase": 3.9 },
      { "hub": "ai",  "icon": "🧠", "bg": "#c4009c", "a": 188, "b": 110,"speed": .10, "phase": 5.6 }
    ]
  },

  "classColors": {
    "AGENTIC": "#c4009c", "AI": "#7a00d6", "AI_ML": "#7a00d6",
    "ROBOTICS": "#009a2d", "DRONE": "#c40000",
    "SOFTWARE": "#0063d1", "WEBSITE": "#00c395",
    "WEB": "#c4009c", "DEV": "#c96a00"
  },

  "demoProjects": [
    { "title": "Booking Bot",  "cls": "AGENTIC",  "desc": "Conversational agent handling end-to-end bookings.", "md": "# Booking Bot\n\nAn **agentic chatbot** that autonomously handles bookings, scheduling, and confirmations.\n\n## Architecture\n- LLM planner with tool-calling pipeline\n- Calendar + payment gateway integrations\n- Human handoff with full context transfer\n\n## Data Flow\n1. User initiates via WhatsApp or web widget\n2. Agent parses intent, checks availability\n3. Books slot, sends confirmation with deep-link\n4. Follows up 24h before appointment\n\n## Outcome\n- 24/7 autonomous bookings across timezones\n- 38% conversion uplift from abandoned flows\n- Zero queue wait times\n\n## Tech Stack\n- Python · FastAPI · Redis\n- PostgreSQL (bookings table)\n- Stripe + Twilio webhooks\n\n---\n*© 2026 AuroNexta — All rights reserved.*" },
    { "title": "Vision Forecast", "cls": "AI_ML", "desc": "Demand forecasting with temporal ML models.", "md": "# Vision Forecast\n\nA temporal machine learning pipeline for multi-horizon demand forecasting across retail and manufacturing.\n\n## Stack\n- PyTorch temporal transformers\n- Automated retraining pipeline (CI/CD)\n- Feature store with 200+ signals\n\n## Models\n- Multi-variate time series (TFT)\n- Graph neural nets for store clustering\n- Ensemble with classical ARIMA baseline\n\n## Results\n- 21% MAPE reduction over legacy system\n- 15% inventory cost savings\n- Real-time reforecast on demand shock\n\n## Deployment\n- SageMaker endpoints (3 replicas)\n- Airflow DAGs for nightly retraining\n- Model registry with rollback support\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Agro Bot",     "cls": "ROBOTICS", "desc": "Autonomous field scouting rover.", "md": "# Agro Bot\n\nAn autonomous rover for precision agriculture crop scouting and soil analysis.\n\n## Highlights\n- RTK-GPS centimetre navigation\n- NDVI crop health mapping\n- Multi-spectral camera array\n\n## Navigation\n- SLAM with LiDAR + RTK\n- Obstacle avoidance (ultrasonic + stereo)\n- Auto-return on low battery\n\n## Payload\n- RGB + NIR camera (12MP)\n- Soil moisture probe (3 depth levels)\n- Ambient temp/humidity sensor\n\n## Data Pipeline\n- Edge inference (Jetson Nano)\n- Cellular uplink for daily reports\n- Cloud dashboard with zone mapping\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Sky Survey",   "cls": "DRONE", "desc": "BVLOS drone corridor mapping.", "md": "# Sky Survey\n\nBVLOS drone corridor mapping for infrastructure inspection.\n\n## Highlights\n- 4cm GSD orthomosaics\n- Automated flight planning (Pix4Dcapture)\n- Real-time telemetry dashboard\n\n## Fleet\n- DJI Matrice 300 RTK\n- Zenmuse P1 (45MP Phase One)\n- Redundant power system\n\n## Processing\n- Agisoft Metashape cloud\n- LiDAR point cloud registration\n- Automated crack/damage detection\n\n## Clients\n- Railway corridor surveys\n- Solar farm inspections\n- Pipeline integrity monitoring\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Ledger Lite",  "cls": "SOFTWARE", "desc": "Zero-install bookkeeping PWA.", "md": "# Ledger Lite\n\nAn offline-first, zero-install bookkeeping Progressive Web App for SMEs.\n\n## Highlights\n- CRDT sync across devices\n- Encrypted local vault (Web Crypto API)\n- GST/Tax auto-calculation\n\n## Architecture\n- Vanilla JS + IndexedDB\n- Service Worker for offline caching\n- WebRTC mesh sync (peer-to-peer)\n\n## Features\n- Multi-currency ledgers\n- Invoice generation (PDF)\n- Bank statement import (CSV)\n- Profit & loss reports\n\n## Security\n- AES-256 encryption at rest\n- Zero-knowledge sync\n- Export as double-entry format\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Nexta Store",  "cls": "WEBSITE", "desc": "Headless commerce storefront.", "md": "# Nexta Store\n\nA headless commerce storefront built for speed and conversion.\n\n## Highlights\n- 98 Lighthouse performance score\n- Edge-rendered pages (Vercel Edge)\n- ISR with 60s stale-while-revalidate\n\n## Stack\n- Next.js 14 (App Router)\n- Shopify Storefront API\n- TailwindCSS + Framer Motion\n\n## Features\n- Predictive search (Algolia)\n- Cart persistence across sessions\n- One-click checkout (Shop Pay)\n- Dynamic OG images\n\n## Performance\n- 0.8s TTFB (edge cache)\n- 1.2s LCP\n- 0 CLS, 2ms TBT\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Support Agent","cls": "AGENTIC", "desc": "Tier-1 support automation agent.", "md": "# Support Agent\n\nTier-1 customer support automation with RAG over knowledge base.\n\n## Highlights\n- RAG over 10,000+ helpdesk articles\n- 71% auto-resolution rate\n- Escalation with full conversation history\n\n## Architecture\n- OpenAI GPT-4 with function calling\n- Pinecone vector store (384d embeddings)\n- LangChain orchestration\n\n## Integrations\n- Zendesk API (ticket creation)\n- Salesforce CRM lookup\n- Custom Slack notification\n\n## Metrics\n- 2.1s median response time\n- 94% customer satisfaction (CSAT)\n- $12K/month saved in support costs\n\n---\n*© 2026 AuroNexta*" },
    { "title": "Edge Vision",  "cls": "AI_ML",    "desc": "On-device visual defect detection.", "md": "# Edge Vision\n\nOn-device visual quality control for manufacturing lines.\n\n## Highlights\n- INT8 quantized CNN (MobileNetV3)\n- 40 FPS on edge TPU\n- <2% false positive rate\n\n## Pipeline\n1. Camera captures at 60fps\n2. TFLite model runs on Coral TPU\n3. Pass/fail signal to PLC\n4. Reject bin actuated automatically\n\n## Training\n- 50K annotated defect images\n- Synthetic augmentation (Copy-Paste)\n- Semi-supervised pseudo-labeling\n\n## Deployment\n- NVIDIA Jetson Xavier NX\n- Custom metal enclosure\n- GigE camera + strobe lighting\n\n---\n*© 2026 AuroNexta*" }
  ],

  "demoTeam": [
    { "base": "01_Hari_Krishnan_Co_Founder",  "bg": "#c96a00", "md": "# Hari Krishnan\n**Co-Founder & CTO**\n\n## Education\n- **MSc Computer Science**, University of Manchester, UK (2018–2020)\n- **BSc IT**, Anna University, Chennai (2014–2018)\n\n## Summary\nNetwork architect & technology leader. 8+ years in cloud infrastructure, enterprise security, and agentic automation systems.\n\n## Work Experience\n- **Co-Founder & CTO**, AuroNexta (2024–Present)\n- **Sr. Network Engineer**, BT Global Services, UK (2021–2024)\n- **Network Lead**, Tata Communications (2019–2021)\n\n## Competencies\n- Network Architecture & SD-WAN\n- Cloud Platforms (AWS, Azure, GCP)\n- Cybersecurity & Zero-Trust\n\n## Certifications\n- AWS Solutions Architect Professional\n- Cisco CCNP Enterprise" },
    { "base": "02_Vamsi_Madhav_Co_Founder",  "bg": "#c4009c", "md": "# Vamsi Madhav\n**Co-Founder & Chief Developer**\n\n## Education\n- **MSc Software Engineering**, University of Bristol, UK (2020–2022)\n- **B.Tech CSE**, SRM Institute (2016–2020)\n\n## Summary\nFull-stack engineer & systems architect. Built AuroNexta's core technology stack from zero to production.\n\n## Work Experience\n- **Co-Founder & CDO**, AuroNexta (2024–Present)\n- **Sr. Full-Stack Developer**, ThoughtWorks, UK (2022–2024)\n- **Software Engineer**, Cognizant, India (2020–2022)\n\n## Competencies\n- JavaScript/TypeScript, Node.js, Python\n- React, Vue.js, NW.js desktop apps\n- System Architecture & API Design\n\n## Certifications\n- Google Cloud Professional Developer\n- MongoDB Certified Developer" },
    { "base": "03_Vishnavi_D_Graphic_Designer", "bg": "#7a00d6", "md": "# Vishnavi D\n**Senior Graphic Designer**\n\n## Education\n- **MA Visual Communication**, University of the Arts London (UAL), UK (2021–2023)\n- **BA Design**, NIFT Bengaluru (2017–2021)\n\n## Summary\nAward-winning visual designer specialising in brand identity, motion graphics, and UI/UX design.\n\n## Work Experience\n- **Sr. Graphic Designer**, AuroNexta (2024–Present)\n- **Motion Graphics Designer**, Dentsu Creative, London (2023–2024)\n- **Visual Designer**, Landor & Fitch, Bengaluru (2021–2023)\n\n## Competencies\n- Brand Identity & Visual Systems\n- Motion Graphics & After Effects\n- UI/UX Design (Figma)\n- 3D Visualization (Blender)\n\n## Awards\n- Red Dot Design Nominee 2023" },
    { "base": "04_Aakash_C_Developer", "bg": "#0063d1", "md": "# Aakash C\n**Senior Software Developer**\n\n## Education\n- **MSc Artificial Intelligence**, University of Edinburgh, UK (2022–2024)\n- **B.Tech CS**, VIT Vellore (2018–2022)\n\n## Summary\nSoftware engineer specialising in AI-powered applications, API development, and automated testing frameworks.\n\n## Work Experience\n- **Senior Developer**, AuroNexta (2024–Present)\n- **Software Engineer**, BBC Technology, UK (2024)\n- **AI Research Intern**, DeepMind (2023)\n\n## Competencies\n- Python, Java, TypeScript\n- ML Pipelines (PyTorch, TensorFlow)\n- RESTful API Design & GraphQL\n\n## Certifications\n- TensorFlow Developer Certificate\n- Oracle Certified Professional Java" },
    { "base": "05_Divya_B_Project_Manager", "bg": "#0084c9", "md": "# Divya B\n**Project Manager**\n\n## Education\n- **MBA Operations**, Manchester Business School, UK (2021–2023)\n- **B.Com Honours**, Christ University, Bengaluru (2017–2020)\n\n## Summary\nResults-driven project manager with expertise in Agile delivery, cross-functional team leadership, and stakeholder management.\n\n## Work Experience\n- **Project Manager**, AuroNexta (2024–Present)\n- **Delivery Manager**, Accenture Technology, UK (2023–2024)\n- **Business Analyst**, KPMG India (2020–2022)\n\n## Competencies\n- Agile (Scrum, Kanban, SAFe)\n- Stakeholder & Client Management\n- Budget & Resource Planning\n\n## Certifications\n- PRINCE2 Practitioner\n- Certified Scrum Master (CSM)" },
    { "base": "06_Vinod_Robotics", "bg": "#009a2d", "md": "# Vinod\n**Robotics Engineer**\n\n## Education\n- **M.Tech Robotics & Automation**, SRM Institute of Science & Technology, Chennai (2020–2022)\n- **B.Tech Mechanical**, Anna University (2016–2020)\n\n## Summary\nRobotics specialist with hands-on expertise in ROS2, embedded systems, and autonomous navigation algorithms.\n\n## Work Experience\n- **Robotics Engineer**, AuroNexta (2024–Present)\n- **Embedded Systems Engineer**, HAL (2022–2024) — UAV flight control\n- **Robotics Intern**, TATA Motors R&D (2021)\n\n## Competencies\n- ROS2 & Robot Operating Systems\n- Embedded C/C++, Python\n- Computer Vision (OpenCV)\n- SLAM & Autonomous Navigation\n\n## Certifications\n- ROS2 Developer Certificate (Open Robotics)" },
    { "base": "07_Yogi_AR_Drone", "bg": "#00c395", "md": "# Yogi\n**AR & Drone Specialist**\n\n## Education\n- **B.Tech ECE**, MIT Manipal (2018–2022)\n- **Professional Drone Pilot Licence**, DGCA India (2022)\n\n## Summary\nAR developer & drone specialist combining aerial photogrammetry with immersive 3D visualisation.\n\n## Work Experience\n- **AR & Drone Specialist**, AuroNexta (2024–Present)\n- **Drone Survey Engineer**, Pix4D India (2023–2024) — 200+ aerial missions\n- **AR Developer Intern**, Niantic Remote (2022)\n\n## Competencies\n- UAV Piloting & BVLOS Operations\n- Photogrammetry (Pix4D, Agisoft)\n- AR Development (ARKit, ARCore, Unity)\n- 3D Mapping & Point Cloud Processing\n\n## Certifications\n- DGCA Drone Pilot Licence\n- Unity Certified Associate" }
  ],

  "demoTestimonials": [
    { "name": "Oliver Thompson", "msg": "The booking agent paid for itself in six weeks. Flawless delivery from the AuroNexta team.", "bg": "#0063d1" },
    { "name": "Priya Sharma",  "msg": "Their drone surveys cut our infrastructure inspection costs by half. Incredible precision.", "bg": "#c4009c" },
    { "name": "James Williams", "msg": "Professional, fast, and the detailed whitepapers made every technical decision transparent.", "bg": "#009a2d" },
    { "name": "Ananya Reddy", "msg": "Our storefront went from 61 to 98 on Lighthouse. Best web engineering team we've worked with.", "bg": "#c96a00" },
    { "name": "Marco Bianchi", "msg": "The robotics rover works rain or shine in the field. Superb engineering and robust design.", "bg": "#7a00d6" },
    { "name": "Sarah Chen", "msg": "AuroNexta's AI models reduced our forecast errors by 21%. Truly state-of-the-art work.", "bg": "#00c395" },
    { "name": "David Okafor", "msg": "Clean code, great documentation, and they actually delivered on time. Rare to find all three.", "bg": "#c40000" }
  ]
  /* ← END OF SECTION B */
};
