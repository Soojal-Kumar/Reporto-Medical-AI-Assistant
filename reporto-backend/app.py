# reporto-backend/main.py
import os
import io
import json
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Optional

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from pypdf import PdfReader
from PIL import Image
import pytesseract

load_dotenv()

# If you are on Windows, you MUST uncomment the line below and replace the path
# with your Tesseract installation path (e.g., C:\\Program Files\\Tesseract-OCR\\tesseract.exe)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    contextText: Optional[str] = None
    conversationHistory: List[Message] = []

class TitleRequest(BaseModel):
    firstUserMessage: str
    firstAiMessage: str

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.content_type in ["application/pdf", "image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    try:
        content = await file.read()
        extracted_text = ""
        if file.content_type == "application/pdf":
            pdf_reader = PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() or ""
        else:
            image = Image.open(io.BytesIO(content))
            extracted_text = pytesseract.image_to_string(image)
        
        if not extracted_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract any text from the document.")

        return {"filename": file.filename, "extractedText": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.post("/generate-title")
async def generate_title(request: TitleRequest):
    try:
        prompt = f"""Generate a short, descriptive title (max 4-5 words) for this conversation based on the first exchange:

User: {request.firstUserMessage}
Assistant: {request.firstAiMessage}

Return only the title, nothing else."""
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        title = response.text.strip().replace('"', '').replace("'", '')
        
        return {"title": title}
    except Exception as e:
        traceback.print_exc()
        return {"title": "New Chat"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_question = request.message
    document_context = request.contextText
    conversation_history = request.conversationHistory
    
    # Enhanced prompt for better formatting and more concise responses
    prompt_parts = []
    
    if document_context:
        prompt_parts.append(f"""You are a helpful AI medical assistant with access to the user's medical documents. 

IMPORTANT FORMATTING GUIDELINES:
- Keep responses concise and well-organized
- Use clear sections with headers when discussing multiple points
- Use bullet points sparingly and only when listing specific items
- Avoid overly long explanations - be direct and helpful
- For blood test results, present changes in a clean, easy-to-read format

--- DOCUMENT CONTEXT ---
{document_context}
--- END OF CONTEXT ---

Use the document context as your primary source but supplement with general medical knowledge to provide complete, helpful answers.""")
    else:
        prompt_parts.append("""You are a helpful AI medical assistant. Provide clear, concise, and well-formatted responses. Keep your answers focused and easy to read.""")
    
    # Add conversation history for context
    if conversation_history:
        prompt_parts.append("\n--- CONVERSATION HISTORY ---")
        for msg in conversation_history[-4:]:  # Reduced to last 4 messages for better performance
            role = "User" if msg.role == "user" else "Assistant"
            prompt_parts.append(f"{role}: {msg.content}")
        prompt_parts.append("--- END OF HISTORY ---")
    
    prompt_parts.append(f"\nUser's Current Question: {user_question}")
    prompt = "\n".join(prompt_parts)
    
    def generate_stream():
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
            
            # Generate streaming response
            response = model.generate_content(prompt, safety_settings=safety_settings, stream=True)
            
            for chunk in response:
                if chunk.text:
                    # Send each chunk as JSON
                    chunk_data = {"content": chunk.text, "done": False}
                    yield f"data: {json.dumps(chunk_data)}\n\n"
            
            # Send final message to indicate completion
            final_data = {"content": "", "done": True}
            yield f"data: {json.dumps(final_data)}\n\n"
            
        except Exception as e:
            traceback.print_exc()
            error_data = {"error": "An error occurred with the AI service.", "done": True}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/stream"
        }
    )
import uvicorn

# This block will only run when the script is executed directly
if __name__ == "__main__":
    # Hugging Face Spaces expects the app to run on port 7860
    uvicorn.run(app, host="0.0.0.0", port=7860)