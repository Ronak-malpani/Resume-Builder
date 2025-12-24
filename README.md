```markdown
<div align="center">

  <br />
  <img src="./client/public/logo.svg" alt="ResumeAI Logo" width="80" height="80">
  
  <h1 align="center">AI Resume Builder & ATS Auditor</h1>
  
  <p align="center">
    A professional full-stack MERN application that leverages Google Gemini AI to build, parse, and optimize resumes with real-time ATS scoring and AI-driven content enhancement.
    <br>
    <a href="https://github.com/Ronak-malpani/Resume-Builder"><strong>Explore the Repo »</strong></a>
    <br>
  </p>
</div>

<div align="center">

[![Stars](https://img.shields.io/github/stars/Ronak-malpani/Resume-Builder?style=for-the-badge&color=yellow)](https://github.com/Ronak-malpani/Resume-Builder/stargazers)
[![Forks](https://img.shields.io/github/forks/Ronak-malpani/Resume-Builder?style=for-the-badge&color=green)](https://github.com/Ronak-malpani/Resume-Builder/network/members)
[![Issues](https://img.shields.io/github/issues/Ronak-malpani/Resume-Builder?style=for-the-badge&color=orange)](https://github.com/Ronak-malpani/Resume-Builder/issues)
[![License](https://img.shields.io/github/license/Ronak-malpani/Resume-Builder?style=for-the-badge&color=blue)](https://github.com/Ronak-malpani/Resume-Builder/blob/main/LICENSE)

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
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About The Project

AI Resume Builder is an intelligent platform designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). By integrating the **Google Gemini AI** engine, the application allows users to transform raw text or uploaded PDFs into polished, industry-standard resumes. 

The core mission of this project is to provide data-driven feedback through the **ATS Audit** system, which scores resumes based on keyword relevance and formatting, ensuring users have the best chance of landing an interview.

---

## Key Features

* **AI Resume Parsing**: Automatically extract details from existing PDF resumes into a structured digital format.
* **ATS Score Audit**: Real-time analysis of resumes against job descriptions with keyword gap identification.
* **Professional AI Rewriting**: Optimize professional summaries and experience bullet points using Gemini AI.
* **Real-time Builder**: Interactive editor with live template preview and dynamic completion tracking.
* **Multi-Resume Management**: Dashboard to create, rename, delete, and manage multiple career documents.
* **Clean PDF Export**: High-fidelity document generation optimized for both human readers and ATS parsers.

---

## Tech Stack

| Category | Technology | Purpose |
| :---: | :---: | :--- |
| Frontend | React, Tailwind CSS, Vite | Building a fast, responsive, and modern user interface. |
| Backend | Node.js, Express.js | Core API engine and AI integration logic. |
| Database | MongoDB, Mongoose | NoSQL database for flexible resume data storage. |
| AI Engine | Google Gemini API | Powers the intelligent parsing and text optimization. |
| State Management | Redux Toolkit | Centralized state for authentication and UI flow. |

---

## Project Structure

```text
resume-builder
├── client
│   ├── public/                # Favicon and logo assets
│   ├── src
│   │   ├── app/               # Redux store and features
│   │   ├── assets/            # Global images and templates
│   │   ├── components/        # Reusable UI components
│   │   ├── configs/           # API and Axios setup
│   │   ├── pages/             # Main application views
│   │   ├── styles/            # Print and layout CSS
│   │   ├── App.jsx            # Main router
│   │   └── main.jsx           # Entry point
│   └── vite.config.js         # Build configuration
└── server
    ├── configs/               # AI, DB, and Multer setup
    ├── controllers/           # Business logic (AI, Resume, User)
    ├── middlewares/           # Auth and Clerk protection
    ├── models/                # Mongoose schemas (Resume, User)
    ├── routes/                # Express API routes
    └── server.js              # Backend entry point

```

---

## Getting Started

### Prerequisites

* **Node.js**: v18 or higher
* **MongoDB**: Atlas Account or local instance
* **Gemini API**: Google AI Studio API Key

### Installation & Setup

1. **Clone the Repository**
```bash
git clone [https://github.com/Ronak-malpani/Resume-Builder.git](https://github.com/Ronak-malpani/Resume-Builder.git)
cd Resume-Builder

```


2. **Backend Setup**
Create a `.env` file in the `server` directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

```


Install dependencies and start the server:
```bash
cd server
npm install
npm start

```


3. **Frontend Setup**
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000

```


Install dependencies and start the development server:
```bash
cd ../client
npm install
npm run dev

```



---

## Roadmap

* [x] AI Resume Parsing (PDF to JSON)
* [x] ATS Scoring & Feedback System
* [x] AI Professional Summary Enhancer
* [x] Multi-resume Dashboard Management
* [ ] Custom Template Color Themes
* [ ] LinkedIn Profile URL Parsing

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**Ronak Malpani** - [malpanironak11@gmail.com](mailto:malpanironak11@gmail.com)

**Project Link**: [https://github.com/Ronak-malpani/Resume-Builder](https://github.com/Ronak-malpani/Resume-Builder)

```

```
