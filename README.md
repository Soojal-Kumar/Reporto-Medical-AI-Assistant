# Reporto - AI Medical Report Analyzer

<div align="center">
  <img src="YOUR_SCREENSHOT_URL_HERE" alt="Reporto Application Screenshot" width="800"/>
</div>

<p align="center">
  A full-stack web application that allows users to securely upload medical documents and get instant, AI-powered analysis and answers through a conversational chat interface.
</p>

<p align="center">
  <a href="https://reporto-mai.vercel.app/"><strong>View Live Demo »</strong></a>
</p>

---

## ✨ Features

-   **Secure User Authentication**: Safe and easy sign-in using Google, powered by Firebase Authentication.
-   **Multi-Format Document Upload**: Supports PDF, PNG, JPG, and other image formats for medical reports.
-   **Intelligent Text Extraction**: Utilizes Tesseract OCR for images and PyPDF for PDFs to accurately digitize documents.
-   **AI-Powered Conversational Analysis**: A dynamic chat interface powered by Google's Gemini AI to ask complex questions about your documents.
-   **Real-time Streaming Responses**: The AI's answers are streamed character-by-character for a smooth, interactive user experience.
-   **Persistent Chat & File History**: All conversations and uploaded file metadata are saved per user in Cloud Firestore.
-   **Smart Conversation Titling**: The AI automatically generates a concise title for each new conversation based on its content.
-   **Fully Responsive Design**: A clean, modern UI that works seamlessly on both desktop and mobile devices.

## 🛠️ Tech Stack

| Category               | Technology                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**           | [**Next.js**](https://nextjs.org/), [**React**](https://react.dev/), [**TypeScript**](https://www.typescriptlang.org/), [**Tailwind CSS**](https://tailwindcss.com/) |
| **Backend**            | [**FastAPI**](https://fastapi.tiangolo.com/), [**Python**](https://www.python.org/)                                                                                  |
| **AI Model**           | [**Google Gemini Pro**](https://deepmind.google/technologies/gemini/)                                                                                   |
| **Database & Auth**    | [**Cloud Firestore**](https://firebase.google.com/docs/firestore), [**Firebase Authentication**](https://firebase.google.com/docs/auth)                     |
| **Deployment**         | [**Vercel**](https://vercel.com/) (Frontend), [**Hugging Face Spaces**](https://huggingface.co/spaces) (Backend)                                                |
| **Text Extraction**    | [**Tesseract OCR**](https://github.com/tesseract-ocr/tesseract), [**PyPDF**](https://pypdf.readthedocs.io/en/stable/)                                                  |

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   Node.js & npm
-   Python 3.8+ & pip
-   [Tesseract OCR](https://github.com/tesseract-ocr/tesseract#installing-tesseract) installed and accessible in your system's PATH.
-   A Google AI Studio API Key.
-   A Firebase project with Authentication (Google provider enabled) and Firestore enabled.

### 1. Clone the repository

```bash
git clone https://github.com/Soojal-Kumar/Reporto-Medical-AI-Assistant.git
cd Reporto-Medical-AI-Assistant
