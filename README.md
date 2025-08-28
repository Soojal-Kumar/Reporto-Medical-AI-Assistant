# Reporto - AI Medical Report Analyzer

<div align="center">
  <img src="https://user-images.githubusercontent.com/10557452/232264582-723f127c-6b19-478a-9280-5a3a78832c4e.png" alt="Reporto Application Screenshot" width="800"/>
</div>

<p align="center">
  A full-stack web application that allows users to securely upload medical documents and get instant, AI-powered analysis and answers through a conversational chat interface.
</p>

<p align="center">
  <a href="https://reporto-mai.vercel.app/"><strong>View Live Demo »</strong></a>
</p>

---

## ✨ Features

- **Secure User Authentication**: Safe and easy sign-in using Google, powered by Firebase Authentication.
- **Multi-Format Document Upload**: Supports PDF, PNG, JPG, and other image formats for medical reports.
- **Intelligent Text Extraction**: Utilizes Tesseract OCR for images and PyPDF for PDFs to accurately digitize documents.
- **AI-Powered Conversational Analysis**: A dynamic chat interface powered by Google's Gemini AI to ask complex questions about your documents.
- **Real-time Streaming Responses**: The AI's answers are streamed character-by-character for a smooth, interactive user experience.
- **Persistent Chat & File History**: All conversations and uploaded file metadata are saved per user in Cloud Firestore.
- **Smart Conversation Titling**: The AI automatically generates a concise title for each new conversation based on its content.
- **Fully Responsive Design**: A clean, modern UI that works seamlessly on both desktop and mobile devices.

---

## 🛠️ Tech Stack

| Category            | Technology                                                                                                                                                       |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**        | [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)            |
| **Backend**         | [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/)                                                                                      |
| **AI Model**        | [Google Gemini Pro](https://deepmind.google/technologies/gemini/)                                                                                                |
| **Database & Auth** | [Cloud Firestore](https://firebase.google.com/docs/firestore), [Firebase Authentication](https://firebase.google.com/docs/auth)                                  |
| **Deployment**      | [Vercel](https://vercel.com/) (Frontend), [Hugging Face Spaces](https://huggingface.co/spaces) (Backend)                                                         |
| **Text Extraction** | [Tesseract OCR](https://github.com/tesseract-ocr/tesseract), [PyPDF](https://pypdf.readthedocs.io/en/stable/)                                                    |

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js & npm  
- Python 3.8+ & pip  
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract#installing-tesseract) installed and available in your system `PATH`  
- A Google AI Studio API Key  
- A Firebase project with Authentication (Google provider enabled) and Firestore enabled

---

### 1) Clone the repository

```bash
git clone https://github.com/Soojal-Kumar/Reporto-Medical-AI-Assistant.git
cd Reporto-Medical-AI-Assistant
```

---

### 2) Frontend Setup (`/reporto-app`)

```bash
# Navigate to the frontend directory
cd reporto-app

# Install dependencies
npm install
```

Create a local environment file **`.env.local`** in `reporto-app/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

### 3) Backend Setup (`/reporto-backend`)

```bash
# From the repo root, go to the backend
cd ../reporto-backend

# (Recommended) Create and activate a virtual environment
python -m venv venv
# macOS/Linux:
source venv/bin/activate
# Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

Create an environment file **`.env`** in `reporto-backend/`:

```env
GOOGLE_API_KEY=your_google_gemini_api_key
```

---

### 4) Running the Application

You’ll need **two terminals**: one for the backend and one for the frontend.

**Terminal 1: Start the Backend (from `/reporto-backend`)**
```bash
uvicorn app:app --reload
```

**Terminal 2: Start the Frontend (from `/reporto-app`)**
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ☁️ Deployment

This project is deployed with a modern, decoupled architecture:

- The **Next.js frontend** is deployed on **Vercel**.
- The **FastAPI backend** is deployed on **Hugging Face Spaces**.
---
