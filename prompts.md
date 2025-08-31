Build the landing page and basic frontend scaffolding for a School Management System designed for middle and high schools. This system will eventually manage timetables, attendance, student performance, and include an AI-powered query feature.

📦 Deliverables

A responsive landing page with:

Project title & tagline

Navigation menu

Brief overview of features/modules

Call-to-action buttons (e.g., Login, Get Started)

Clean and modern UI (mobile- and tablet-friendly)

Scaffold pages/components for:

Dashboard (placeholder for timetable, attendance, performance)

Login & Register

AI Query Box section

Placeholder components for "Timetable", "Attendance", "Performance"

💡 General Theme and Design

Clean, academic UI

Responsive layout using CSS Grid or Flexbox

Use HTML5, CSS3, and vanilla JavaScript only.

Icon-friendly (use Font Awesome or Heroicons)

Light mode / modern interface

Use real-looking mock data where helpful

🧱 Pages & Components to Include
1. Landing Page (index.html)

Hero section with title and tagline

Features list (Timetable Management, Attendance, Performance, AI Querying)

CTA buttons: Login, Explore Dashboard (inactive for now)

Footer with placeholder links (About, Contact, etc.)

2. Login Page (login.html)

Username/email and password fields

Simple validation

Link to "Register"

3. Register Page (register.html)

Fields: Name, Email, Password, Role (Admin, Teacher, Student)

Submit button (no backend wiring yet)

4. Dashboard Page (dashboard.html)

Sidebar navigation

Timetable

Attendance

Performance

AI Query Box

Placeholder components/sections with clear comments for where dynamic data will go

5. AI Query Box (component or section)

Input box for natural-language queries

Submit button (later connected to OpenAI endpoint)

Result display area

🗂️ Folder Structure Suggestion
/landing-page
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
│
├── /css
│   └── styles.css
├── /js
│   └── main.js
└── /assets
    ├── /img
    └── /icons

🔗 Integration Readiness

Forms should be structured for easy connection to backend endpoints (e.g., /api/login, /api/register)

Use data-* attributes or ID/class hooks for backend/JS integration later

Comments in code should guide backend team on where to plug in logic

Add a light loading animation or transition

Basic theme toggle or minimal CSS variables for easier design changes
