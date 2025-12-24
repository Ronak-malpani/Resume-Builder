

```markdown
<div align="center">

  <br />
  <img src="./client/src/assets/logo.svg" alt="Resume AI Logo" width="80" height="80">
  
  <h1 align="center">AI Resume Builder & ATS Auditor</h1>
  
  <p align="center">
    A professional MERN stack application that leverages Google Gemini AI to help users build, parse, and optimize resumes with real-time ATS scoring and AI-driven content enhancement.
    <br>
    <a href="https://github.com/Ronak-malpani/Resume-Builder"><strong>Explore the Repo »</strong></a>
    <br>
  </p>
</div>

<div align="center">

[![Stars](https://img.shields.io/github/stars/Ronak-malpani/Resume-Builder?style=for-the-badge&color=yellow)](https://github.com/Ronak-malpani/Resume-Builder/stargazers)
[![Forks](https://img.shields.io/github/forks/Ronak-malpani/Resume-Builder?style=for-the-badge&color=green)](https://github.com/Ronak-malpani/Resume-Builder/network/members)
[![Issues](https://img.shields.io/github/issues/Ronak-malpani/Resume-Builder?style=for-the-badge&color=orange)](https://github.com/Ronak-malpani/Resume-Builder/issues)

</div>

---

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

-----

## About The Project



The **AI Resume Builder** is a full-stack platform designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). Built on the **MERN** stack, it utilizes the **Google Gemini API** to provide intelligent features like automated PDF parsing, professional content rewriting, and a comprehensive "ATS Audit" report.

Unlike traditional builders, this tool focuses on data-driven optimization, ensuring that every bullet point and summary is crafted to pass modern recruitment filters while maintaining a professional aesthetic.

-----

## Key Features

* **AI Resume Parsing:** Upload an existing PDF resume; the system uses Gemini AI to extract and structure your personal info, experience, and skills into a clean digital format.
* **ATS Score Audit:** Provides a real-time "ATS Score" by analyzing your resume against industry standards or specific job descriptions.
* **AI Content Optimization:** * **Summaries:** Enhances professional summaries to be more impactful.
    * **Job Descriptions:** Converts raw duties into 3 achievement-focused bullet points using strong action verbs.
    * **Projects:** Polishes project details for maximum technical clarity.
* **Real-time Preview:** Interactive builder where changes update instantly on a professional, print-ready template.
* **Persistent Dashboard:** Manage multiple resumes, track their completion progress, and edit titles or visibility settings.
* **PDF Export:** High-fidelity PDF generation that ensures your document remains ATS-parseable after download.

-----

## Tech Stack

| Category | Technology | Purpose |
| :---: | :---: | :--- |
| **Frontend** | React, Tailwind CSS, Vite | Fast, responsive UI with modern utility-first styling. |
| **Backend** | Node.js, Express.js | Scalable API engine and AI integration layer. |
| **Database** | MongoDB, Mongoose | NoSQL storage for structured resume documents. |
| **AI Engine** | Google Gemini | Powering parsing, auditing, and text enhancement. |
| **State Mgmt**| Redux Toolkit | Centralized management for auth and user data. |
| **PDF Logic** | react-pdftotext | Client-side extraction of text from uploaded documents. |

-----

## Project Structure

The application follows a clean monorepo structure separating frontend concerns from backend logic.


```

/client
├── public/               # Static assets & Netlify _redirects
└── src/
├── assets/           # Icons and SVG logos
├── components/       # Reusable UI (Modals, ATS Reports, Navbar)
├── pages/            # Dashboard, Resume Builder, Auth Pages
├── store/            # Redux Slices (auth, UI state)
├── configs/          # API/Axios configurations
└── App.jsx           # Main Router and Layout logic

/server
├── configs/              # Database & Gemini AI configurations
├── controllers/          # Business logic (AI processing, Resume CRUD)
├── models/               # Mongoose schemas (User, Resume)
├── routes/               # Express API endpoints
└── server.js             # Entry point: Server initialization

```

-----

## Getting Started

Follow these steps to set up the AI Resume Builder locally.

### Prerequisites

* Node.js & npm (v18 or higher)
* A MongoDB Atlas database instance
* **Google AI Studio API Key** (for Gemini AI access)

### Installation & Setup

1. **Clone the Repository:**
   ```sh
   git clone [https://github.com/Ronak-malpani/Resume-Builder.git](https://github.com/Ronak-malpani/Resume-Builder.git)
   cd Resume-Builder

```

2. **Setup Environment Variables:**
Create a `.env` file in the **server** directory and a `.env` file in the **client** directory.
`server/.env`:
```env
MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
PORT=5000
JWT_SECRET=<YOUR_JWT_SECRET_KEY>
GEMINI_API_KEY=<YOUR_GOOGLE_GEMINI_API_KEY>

```


`client/.env`:
```env
VITE_API_URL=http://localhost:5000

```


3. **Start the Backend:**
```sh
cd server
npm install
npm start

```


4. **Start the Frontend:**
```sh
cd client
npm install
npm run dev

```



---

### Roadmap

* [x] AI Resume Parsing from PDF
* [x] ATS Audit Scoring System
* [x] Professional Content Enhancement (Gemini)
* [x] Multi-Resume Dashboard
* [ ] Custom Theme/Color Selection
* [ ] Multi-template Library

---

### Contact

Ronak Malpani - [malpanironak11@gmail.com](mailto:malpanironak11@gmail.com) - [LinkedIn Profile](https://linkedin.com/in/ronakmalpani15)

Project Link: [https://github.com/Ronak-malpani/Resume-Builder](https://www.google.com/url?sa=E&source=gmail&q=https://github.com/Ronak-malpani/Resume-Builder)

```

### Next Step for you:
1. Create a file named **`README.md`** in your main `resume-builder` folder.
2. Paste the code above into it.
3. Make sure you have a logo file at `client/src/assets/logo.svg` (or update the path in the README if it's different).
4. **Git Push** this final version to GitHub:
   ```bash
   git add README.md
   git commit -m "Docs: Add professional README"
   git push origin main

```
