let quizData = []; // 🔹 Global to store loaded questions
let currentQuestion = 0;
let userAnswers = [];
let timer = null;
let timeLeft = 15;
let userName = '';
let userClass = '';

// Load quiz data from external JSON
function loadQuizData() {
    return fetch('questions.json')
        .then(response => {
            if (!response.ok) throw new Error("Could not load quiz questions.");
            return response.json();
        })
        .then(data => {
            quizData = data;
            document.getElementById('totalQuestions').textContent = quizData.length;
        })
        .catch(err => {
            alert("Error loading quiz questions: " + err.message);
        });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {
    showScreen('userInfoScreen');

    document.getElementById('userInfoForm').addEventListener('submit', function (e) {
        e.preventDefault();
        userName = document.getElementById('userName').value.trim();
        userClass = document.getElementById('userClass').value.trim();

        if (userName && userClass) {
            loadQuizData().then(() => {
                showScreen('preQuizScreen');
            });
        }
    });
});

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);

    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = newTheme === 'dark' ? '☀️ Switch Theme' : '🌙 Switch Theme';
}

// Screen manager
function showScreen(screenId) {
    const screens = ['userInfoScreen', 'preQuizScreen', 'quizScreen', 'resultsScreen', 'reviewScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (id === screenId) {
            el.classList.remove('hidden');
            el.classList.add('fade-in');
        } else {
            el.classList.add('hidden');
            el.classList.remove('fade-in');
        }
    });
}

// Start quiz
function startQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    showScreen('quizScreen');
    loadQuestion();
}

// Load a question
function loadQuestion() {
    if (currentQuestion >= quizData.length) {
        showResults();
        return;
    }

    const question = quizData[currentQuestion];
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionCounter').textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-button';
        btn.textContent = option;
        btn.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(btn);
    });

    startTimer();
}

// Timer
function startTimer() {
    timeLeft = 15;
    updateTimerDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            selectAnswer(-1); // Timeout, no answer
        }
    }, 1000);
}

function updateTimerDisplay() {
    const progress = (timeLeft / 15) * 100;
    document.getElementById('timerProgress').style.width = progress + '%';
    document.getElementById('timeRemaining').textContent = timeLeft + 's';
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
}

// Handle answer
function selectAnswer(selectedIndex) {
    stopTimer();
    userAnswers[currentQuestion] = selectedIndex;

    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach((btn, i) => {
        btn.style.pointerEvents = 'none';
        if (i === selectedIndex) {
            btn.classList.add('selected');
        }
    });

    setTimeout(() => {
        currentQuestion++;
        loadQuestion();
    }, 1000);
}

// Show result screen
function showResults() {
    let correct = 0;
    userAnswers.forEach((answer, i) => {
        if (answer === quizData[i].correct) correct++;
    });

    const incorrect = quizData.length - correct;
    const score = Math.round((correct / quizData.length) * 100);

    document.getElementById('totalQuestionsResult').textContent = quizData.length;
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('incorrectAnswers').textContent = incorrect;
    document.getElementById('finalScore').textContent = `${score}%`;

    showScreen('resultsScreen');
}

// Review screen
function showReview() {
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';

    quizData.forEach((q, i) => {
        const userAnswer = userAnswers[i];
        const isCorrect = userAnswer === q.correct;

        const review = document.createElement('div');
        review.className = 'review-item';
        review.innerHTML = `
            <div class="review-question">${i + 1}. ${q.question}</div>
            <div class="review-answers">
                <div class="review-answer ${isCorrect ? 'user-correct' : 'user-incorrect'}">
                    Your answer: ${userAnswer >= 0 ? q.options[userAnswer] : 'No answer selected'}
                </div>
                <div class="review-answer correct-answer">
                    Correct answer: ${q.options[q.correct]}
                </div>
            </div>
            <div class="review-explanation">
                ${q.explanation}
            </div>
        `;

        reviewContainer.appendChild(review);
    });

    showScreen('reviewScreen');
}

// Restart quiz
function restartQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    stopTimer();
    showScreen('userInfoScreen');

    document.getElementById('userName').value = '';
    document.getElementById('userClass').value = '';
}
