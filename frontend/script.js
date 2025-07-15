class DocumentAIAssistant {
    constructor() {
        this.sessionId = null;
        this.currentMode = null;
        this.challengeQuestions = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload
        const fileInput = document.getElementById('file-input');
        const browseBtn = document.getElementById('browse-btn');
        const uploadArea = document.getElementById('upload-area');

        if (browseBtn) {
            browseBtn.addEventListener('click', () => fileInput.click());
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        }

        // Drag and drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Mode selection
        const askModeBtn = document.getElementById('ask-mode-btn');
        const challengeModeBtn = document.getElementById('challenge-mode-btn');
        
        if (askModeBtn) {
            askModeBtn.addEventListener('click', () => this.setMode('ask'));
        }
        
        if (challengeModeBtn) {
            challengeModeBtn.addEventListener('click', () => this.setMode('challenge'));
        }

        // Chat functionality
        const sendBtn = document.getElementById('send-btn');
        const questionInput = document.getElementById('question-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendQuestion());
        }
        
        if (questionInput) {
            questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendQuestion();
            });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.classList.add('dragover');
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.classList.remove('dragover');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.classList.remove('dragover');
        }
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileUpload(files[0]);
        }
    }

    async handleFileUpload(file) {
        if (!file) return;

        if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
            this.showError('Please upload a PDF or TXT file only.');
            return;
        }

        this.showProgress(true);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.sessionId = result.session_id;
                this.displayDocumentSummary(result.filename, result.summary);
                this.showModeSelection();
            } else {
                this.showError('Error uploading file. Please try again.');
            }
        } catch (error) {
            this.showError('Error uploading file: ' + error.message);
        } finally {
            this.showProgress(false);
        }
    }

    showProgress(show) {
        const progressBar = document.getElementById('upload-progress');
        if (progressBar) {
            if (show) {
                progressBar.classList.remove('hidden');
            } else {
                progressBar.classList.add('hidden');
            }
        }
    }

    displayDocumentSummary(filename, summary) {
        const summarySection = document.getElementById('summary-section');
        if (summarySection) {
            const filenameEl = summarySection.querySelector('.filename');
            const summaryEl = summarySection.querySelector('.summary');

            if (filenameEl) {
                filenameEl.textContent = `📄 ${filename}`;
            }
            
            if (summaryEl) {
                summaryEl.textContent = summary;
            }

            summarySection.classList.remove('hidden');
        }
    }

    showModeSelection() {
        const modeSection = document.getElementById('mode-section');
        if (modeSection) {
            modeSection.classList.remove('hidden');
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Hide all mode sections
        const askSection = document.getElementById('ask-section');
        const challengeSection = document.getElementById('challenge-section');
        
        if (askSection) {
            askSection.classList.add('hidden');
        }
        
        if (challengeSection) {
            challengeSection.classList.add('hidden');
        }

        if (mode === 'ask') {
            if (askSection) {
                askSection.classList.remove('hidden');
            }
            const questionInput = document.getElementById('question-input');
            if (questionInput) {
                questionInput.focus();
            }
        } else if (mode === 'challenge') {
            if (challengeSection) {
                challengeSection.classList.remove('hidden');
            }
            this.generateChallengeQuestions();
        }
    }

    async sendQuestion() {
        const input = document.getElementById('question-input');
        if (!input) return;
        
        const question = input.value.trim();
        if (!question) return;

        this.addMessageToChat('user', question);
        input.value = '';

        // Show loading
        this.addMessageToChat('assistant', 'Thinking...', '', true);

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    question: question
                })
            });

            const result = await response.json();

            // Remove loading message
            this.removeLoadingMessage();

            if (result.status === 'success') {
                this.addMessageToChat('assistant', result.answer, result.justification);
            } else {
                this.addMessageToChat('assistant', 'Sorry, I encountered an error processing your question.');
            }
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessageToChat('assistant', 'Sorry, I encountered an error: ' + error.message);
        }
    }

    addMessageToChat(sender, content, justification = '', isLoading = false) {
        const chatHistory = document.getElementById('chat-history');
        if (!chatHistory) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        if (isLoading) {
            messageDiv.classList.add('loading-message');
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        messageDiv.appendChild(contentDiv);

        if (justification && sender === 'assistant') {
            const justificationDiv = document.createElement('div');
            justificationDiv.className = 'message-justification';
            justificationDiv.textContent = justification;
            messageDiv.appendChild(justificationDiv);
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    removeLoadingMessage() {
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    async generateChallengeQuestions() {
        const loadingDiv = document.getElementById('challenge-loading');
        const questionsDiv = document.getElementById('challenge-questions');
        
        if (loadingDiv) {
            loadingDiv.classList.remove('hidden');
        }
        
        if (questionsDiv) {
            questionsDiv.classList.add('hidden');
        }

        try {
            const response = await fetch('/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionId
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.challengeQuestions = result.questions;
                this.displayChallengeQuestions();
            } else {
                this.showError('Error generating questions. Please try again.');
            }
        } catch (error) {
            this.showError('Error generating questions: ' + error.message);
        } finally {
            if (loadingDiv) {
                loadingDiv.classList.add('hidden');
            }
        }
    }

    displayChallengeQuestions() {
        const questionsDiv = document.getElementById('challenge-questions');
        if (!questionsDiv) return;
        
        questionsDiv.innerHTML = '';

        this.challengeQuestions.forEach((question, index) => {
            const questionCard = this.createQuestionCard(question, index);
            questionsDiv.appendChild(questionCard);
        });

        questionsDiv.classList.remove('hidden');
    }

    createQuestionCard(question, index) {
        const card = document.createElement('div');
        card.className = 'question-card';

        card.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <span class="question-type">${question.type}</span>
            </div>
            <div class="question-text">${question.question}</div>
            <textarea 
                class="answer-input" 
                placeholder="Enter your answer here..."
                id="answer-${index}"
            ></textarea>
            <div class="question-actions">
                <button class="btn-submit" onclick="app.submitAnswer(${index})">
                    Submit Answer
                </button>
            </div>
            <div id="evaluation-${index}" class="evaluation-result hidden"></div>
        `;

        return card;
    }

    async submitAnswer(questionIndex) {
        const answerInput = document.getElementById(`answer-${questionIndex}`);
        if (!answerInput) return;
        
        const answer = answerInput.value.trim();

        if (!answer) {
            this.showError('Please enter an answer before submitting.');
            return;
        }

        const submitBtn = answerInput.parentElement.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Evaluating...';
        }

        try {
            const response = await fetch('/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    question_id: questionIndex,
                    answer: answer
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.displayEvaluation(questionIndex, result.evaluation, result.correct_answer);
            } else {
                this.showError('Error evaluating answer. Please try again.');
            }
        } catch (error) {
            this.showError('Error evaluating answer: ' + error.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Answer';
            }
        }
    }

    displayEvaluation(questionIndex, evaluation, correctAnswer) {
        const evaluationDiv = document.getElementById(`evaluation-${questionIndex}`);
        if (!evaluationDiv) return;
        
        const scoreClass = evaluation.score.toLowerCase().replace(' ', '-');

        evaluationDiv.innerHTML = `
            <div class="score-badge ${scoreClass}">${evaluation.score}</div>
            <div class="evaluation-feedback">${evaluation.feedback}</div>
            <div class="correct-answer">
                <h4>Expected Answer:</h4>
                <p>${correctAnswer}</p>
            </div>
        `;

        evaluationDiv.className = `evaluation-result ${scoreClass}`;
        evaluationDiv.classList.remove('hidden');
    }

    showError(message) {
        alert(message); // Simple error handling - can be enhanced with toast notifications
    }
}

// Initialize the application
const app = new DocumentAIAssistant();
