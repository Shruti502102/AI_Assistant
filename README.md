# AI_Assistant
A comprehensive AI-powered document analysis tool that enables users to upload documents and interact with them through intelligent question answering and comprehension testing.

## Features

- **Document Upload**: Support for PDF and TXT files
- **Auto Summary**: Generates concise summaries (≤150 words) upon upload
- **Ask Anything Mode**: Free-form question answering with document-based justifications
- **Challenge Mode**: AI-generated comprehension questions with automated evaluation
- **Contextual Understanding**: All responses grounded in uploaded document content
- **Clean Web Interface**: Intuitive, responsive design for seamless user experience

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-ai-assistant
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create necessary directories**
   ```bash
   mkdir -p uploads frontend/static frontend/templates
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## Architecture & Reasoning Flow

### System Architecture
```
Frontend (HTML/CSS/JS) → FastAPI Backend → Document Processor → AI Assistant
                                        → Question Generator → Evaluation Engine
```

### Core Components

1. **Document Processor** (`backend/document_processor.py`)
   - Extracts text from PDF and TXT files
   - Cleans and normalizes text content
   - Splits documents into logical sections

2. **AI Assistant** (`backend/ai_assistant.py`)
   - Generates document summaries
   - Processes user questions with contextual understanding
   - Provides document-based justifications for answers
   - Evaluates user responses against expected answers

3. **Question Generator** (`backend/question_generator.py`)
   - Creates three types of questions: factual, analytical, and comprehension
   - Extracts key topics and concepts from documents
   - Generates expected answers based on document content

4. **FastAPI Backend** (`app.py`)
   - RESTful API endpoints for file upload, question processing, and evaluation
   - Session management for maintaining context
   - File handling and error management

5. **Frontend Interface**
   - Drag-and-drop file upload
   - Real-time chat interface for Q&A
   - Interactive challenge mode with question cards
   - Responsive design with smooth animations

### Reasoning Flow

1. **Document Upload**
   - User uploads PDF/TXT file
   - System extracts and processes text
   - Generates automatic summary
   - Creates session for context maintenance

2. **Ask Anything Mode**
   - User submits question
   - System finds relevant document sections
   - Generates contextual answer with justification
   - Maintains conversation history

3. **Challenge Mode**
   - System analyzes document content
   - Generates three diverse question types
   - User provides answers
   - System evaluates responses and provides feedback

## Usage

1. **Upload Document**: Drag and drop or browse for PDF/TXT files
2. **Review Summary**: Read the auto-generated document summary
3. **Choose Mode**:
   - **Ask Anything**: Ask questions about the document
   - **Challenge Me**: Test your understanding with AI-generated questions
4. **Interact**: Engage with the AI assistant through the clean web interface

## Technical Implementation

### Key Features Implemented

- **Minimal Hallucination**: All responses are grounded in document content
- **Contextual Understanding**: Maintains conversation context across interactions
- **Document Reference**: Each answer includes justification pointing to source content
- **Responsive Design**: Works seamlessly across devices
- **Error Handling**: Comprehensive error management and user feedback

### File Structure
```
document-ai-assistant/
├── app.py                 # Main FastAPI application
├── requirements.txt       # Python dependencies
├── backend/
│   ├── document_processor.py  # Text extraction and processing
│   ├── ai_assistant.py        # Core AI logic and responses
│   └── question_generator.py  # Question generation algorithms
├── frontend/
│   ├── templates/
│   │   └── index.html        # Main HTML template
│   └── static/
│       ├── style.css         # Styling and animations
│       └── script.js         # Frontend JavaScript logic
└── uploads/                  # Uploaded files storage
```

## Future Enhancements

- Integration with advanced LLMs (OpenAI GPT, Claude)
- Memory handling for complex conversations
- Answer highlighting with document snippets
- Advanced question types and evaluation metrics
- Export functionality for conversations and evaluations
- Multi-language support
- Document comparison features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

This completes the full project structure with all requirements implemented!
```
