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

        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Mode selection
        document.getElementById('ask-mode-btn').addEventListener('click', () => this.setMode('ask'));
        document.getElementById('challenge-mode-btn').addEventListener('click', () => this.setMode('challenge'));

        // Chat functionality
        document.getElementById('send-btn').addEventListener('click', () => this.sendQuestion());
        document.getElementById('question-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendQuestion();
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('upload-area').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('upload-area').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('upload-area').classList.remove('dragover');
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
        if (show) {
            progressBar.classList.remove('hidden');
        } else {
            progressBar.classList.add('hidden');
        }
    }

    displayDocumentSummary(filename, summary) {
        const summarySection = document.getElementById('summary-section');
        const filenameEl = summarySection.querySelector('.filename');
        const summaryEl = summarySection.querySelector('.summary');

        filenameEl.textContent = `📄 ${filename}`;
        summaryEl.textContent = summary;

        summarySection.classList.remove('hidden');
    }

    showModeSelection() {
        document.getElementById('mode-section').classList.remove('hidden');
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Hide all mode sections
        document.getElementById('ask-section').classList.add('hidden');
        document.getElementById('challenge-section').classList.add('hidden');

        if (mode === 'ask') {
            document.getElementById('ask-section').classList.remove('hidden');
            document.getElementById('question-input').focus();
        } else if (mode === 'challenge') {
            document.getElementById('challenge-section').classList.remove('hidden');
            this.generateChallengeQuestions();
        }
    }

    async sendQuestion() {
        const input = document.getElementById('question-input');
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
        
        loadingDiv.classList.remove('hidden');
        questionsDiv.classList.add('hidden');

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
            loadingDiv.classList.add('hidden');
        }
    }

    displayChallengeQuestions() {
        const questionsDiv = document.getElementById('challenge-questions');
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
        const answer = answerInput.value.trim();

        if (!answer) {
            this.showError('Please enter an answer before submitting.');
            return;
        }

        const submitBtn = answerInput.parentElement.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Evaluating...';

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
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Answer';
        }
    }

    displayEvaluation(questionIndex, evaluation, correctAnswer) {
        const evaluationDiv = document.getElementById(`evaluation-${questionIndex}`);
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
