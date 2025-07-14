from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import json
import uuid
from datetime import datetime
from backend.document_processor import DocumentProcessor
from backend.ai_assistant import AIAssistant
from backend.question_generator import QuestionGenerator

app = FastAPI(title="Document AI Assistant")

# Setup directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("frontend/static", exist_ok=True)
os.makedirs("frontend/templates", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# Initialize components
doc_processor = DocumentProcessor()
ai_assistant = AIAssistant()
question_gen = QuestionGenerator()

# Session storage (in production, use Redis or database)
sessions = {}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
    
    # Save file
    session_id = str(uuid.uuid4())
    file_path = f"uploads/{session_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Process document
    try:
        document_text = doc_processor.extract_text(file_path)
        summary = ai_assistant.generate_summary(document_text)
        
        # Store in session
        sessions[session_id] = {
            'filename': file.filename,
            'filepath': file_path,
            'document_text': document_text,
            'summary': summary,
            'conversation_history': [],
            'created_at': datetime.now().isoformat()
        }
        
        return JSONResponse({
            'session_id': session_id,
            'filename': file.filename,
            'summary': summary,
            'status': 'success'
        })
    
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/ask")
async def ask_question(request: Request):
    data = await request.json()
    session_id = data.get('session_id')
    question = data.get('question')
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    try:
        answer, justification = ai_assistant.answer_question(
            question, 
            session['document_text'],
            session['conversation_history']
        )
        
        # Update conversation history
        session['conversation_history'].append({
            'question': question,
            'answer': answer,
            'justification': justification,
            'timestamp': datetime.now().isoformat()
        })
        
        return JSONResponse({
            'answer': answer,
            'justification': justification,
            'status': 'success'
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.post("/challenge")
async def generate_challenge(request: Request):
    data = await request.json()
    session_id = data.get('session_id')
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    try:
        questions = question_gen.generate_questions(session['document_text'])
        
        # Store challenge questions in session
        session['challenge_questions'] = questions
        
        return JSONResponse({
            'questions': questions,
            'status': 'success'
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@app.post("/evaluate")
async def evaluate_answer(request: Request):
    data = await request.json()
    session_id = data.get('session_id')
    question_id = data.get('question_id')
    user_answer = data.get('answer')
    
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    if 'challenge_questions' not in session:
        raise HTTPException(status_code=400, detail="No challenge questions found")
    
    try:
        questions = session['challenge_questions']
        if question_id >= len(questions):
            raise HTTPException(status_code=400, detail="Invalid question ID")
        
        question_data = questions[question_id]
        
        evaluation = ai_assistant.evaluate_answer(
            question_data['question'],
            user_answer,
            question_data['expected_answer'],
            session['document_text']
        )
        
        return JSONResponse({
            'evaluation': evaluation,
            'correct_answer': question_data['expected_answer'],
            'status': 'success'
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating answer: {str(e)}")

@app.get("/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    return JSONResponse({
        'filename': session['filename'],
        'summary': session['summary'],
        'conversation_history': session['conversation_history'],
        'status': 'success'
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)