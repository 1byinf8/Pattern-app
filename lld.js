/**
 * LLD (Low-Level Design) Module
 * Handles the learning path, questions, and progress tracking
 */

// Storage keys
const LLD_STORAGE = {
    PROGRESS: 'lld_progress',
    COMPLETED_WEEKS: 'lld_completed_weeks',
    COMPLETED_QUESTIONS: 'lld_completed_questions',
    CURRENT_WEEK: 'lld_current_week'
};

// State
let lldData = null;
let lldState = {
    completedWeeks: new Set(),
    completedQuestions: new Set(),
    currentWeek: 1,
    selectedQuestion: null
};

// Initialize LLD module
async function initLLD() {
    await loadLLDData();
    loadLLDProgress();
    setupLLDEventListeners();
    renderLLD();
}

// Load LLD question data from JSON
async function loadLLDData() {
    try {
        const response = await fetch('lld_question.json');
        lldData = await response.json();
        console.log('LLD data loaded:', lldData.questions.length, 'questions');
    } catch (error) {
        console.error('Failed to load LLD data:', error);
        lldData = { questions: [], learningMap: { weeks: [] } };
    }
}

// Load progress from localStorage
function loadLLDProgress() {
    try {
        const completedWeeks = localStorage.getItem(LLD_STORAGE.COMPLETED_WEEKS);
        const completedQuestions = localStorage.getItem(LLD_STORAGE.COMPLETED_QUESTIONS);
        const currentWeek = localStorage.getItem(LLD_STORAGE.CURRENT_WEEK);

        if (completedWeeks) {
            lldState.completedWeeks = new Set(JSON.parse(completedWeeks));
        }
        if (completedQuestions) {
            lldState.completedQuestions = new Set(JSON.parse(completedQuestions));
        }
        if (currentWeek) {
            lldState.currentWeek = parseInt(currentWeek);
        }
    } catch (error) {
        console.error('Failed to load LLD progress:', error);
    }
}

// Save progress to localStorage
function saveLLDProgress() {
    try {
        localStorage.setItem(LLD_STORAGE.COMPLETED_WEEKS, JSON.stringify([...lldState.completedWeeks]));
        localStorage.setItem(LLD_STORAGE.COMPLETED_QUESTIONS, JSON.stringify([...lldState.completedQuestions]));
        localStorage.setItem(LLD_STORAGE.CURRENT_WEEK, lldState.currentWeek.toString());
    } catch (error) {
        console.error('Failed to save LLD progress:', error);
    }
}

// Setup event listeners
function setupLLDEventListeners() {
    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchLLDView(view);
        });
    });

    // Modal close button
    const closeBtn = document.getElementById('week-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWeekModal);
    }

    // Modal backdrop click
    const modal = document.getElementById('week-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeWeekModal();
            }
        });
    }

    // Complete week button
    const completeWeekBtn = document.getElementById('complete-week-btn');
    if (completeWeekBtn) {
        completeWeekBtn.addEventListener('click', completeCurrentWeek);
    }

    // Filter selects
    const difficultyFilter = document.getElementById('difficulty-filter');
    const statusFilter = document.getElementById('status-filter');

    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', renderQuestionsView);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderQuestionsView);
    }

    // Mark complete button in practice view
    const markCompleteBtn = document.getElementById('mark-lld-complete-btn');
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', markSelectedQuestionComplete);
    }
}

// Switch between views
function switchLLDView(view) {
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update view visibility
    document.querySelectorAll('.lld-view').forEach(v => {
        v.classList.remove('active');
    });

    const targetView = document.getElementById(`lld-${view}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Render specific view content
    if (view === 'questions') {
        renderQuestionsView();
    } else if (view === 'practice') {
        renderPracticeView();
    }
}

// Main render function
function renderLLD() {
    updateLLDStats();
    renderRoadmapView();
    renderQuestionsView();
    renderPracticeView();
}

// Update header stats
function updateLLDStats() {
    const topicsCompleted = document.getElementById('lld-topics-completed');
    const questionsUnlocked = document.getElementById('lld-questions-unlocked');
    const currentWeekEl = document.getElementById('lld-current-week');

    // Count completed topics (weeks * 2 concepts per week approximately)
    const topicCount = lldState.completedWeeks.size * 2;

    // Count unlocked questions (all questions from completed weeks + current week)
    const unlockedCount = getUnlockedQuestions().length;

    if (topicsCompleted) topicsCompleted.textContent = topicCount;
    if (questionsUnlocked) questionsUnlocked.textContent = unlockedCount;
    if (currentWeekEl) currentWeekEl.textContent = lldState.currentWeek;

    // Update roadmap progress bar
    const progressFill = document.getElementById('roadmap-progress-fill');
    if (progressFill && lldData?.learningMap?.weeks) {
        const totalWeeks = lldData.learningMap.weeks.length;
        const progress = (lldState.completedWeeks.size / totalWeeks) * 100;
        progressFill.style.width = `${progress}%`;
    }
}

// Get list of unlocked questions
function getUnlockedQuestions() {
    if (!lldData?.questions) return [];

    return lldData.questions.filter(q => {
        // Questions are unlocked if their week is <= current week
        return q.week <= lldState.currentWeek;
    });
}

// Check if a question is unlocked
function isQuestionUnlocked(questionId) {
    const question = lldData?.questions?.find(q => q.id === questionId);
    if (!question) return false;
    return question.week <= lldState.currentWeek;
}

// Check if a question is completed
function isQuestionCompleted(questionId) {
    return lldState.completedQuestions.has(questionId);
}

// Render roadmap view
function renderRoadmapView() {
    const grid = document.getElementById('weeks-grid');
    if (!grid || !lldData?.learningMap?.weeks) return;

    grid.innerHTML = '';

    lldData.learningMap.weeks.forEach(week => {
        const isCompleted = lldState.completedWeeks.has(week.week);
        const isCurrent = week.week === lldState.currentWeek;
        const isLocked = week.week > lldState.currentWeek;

        const card = document.createElement('div');
        card.className = `week-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;

        const statusIcon = isCompleted ? '✓' : (isCurrent ? '→' : (isLocked ? '🔒' : ''));

        card.innerHTML = `
            <div class="week-card-header">
                <span class="week-number">Week ${week.week}</span>
                <span class="week-status">${statusIcon}</span>
            </div>
            <p class="week-focus">${week.focus}</p>
            <div class="week-topics">
                ${week.concepts.map(c => `
                    <span class="week-topic-tag ${isCompleted ? 'learned' : ''}">${c.name.split(' ')[0]}</span>
                `).join('')}
            </div>
        `;

        if (!isLocked) {
            card.addEventListener('click', () => openWeekModal(week));
        }

        grid.appendChild(card);
    });
}

// Open week detail modal
function openWeekModal(week) {
    const modal = document.getElementById('week-modal');
    const title = document.getElementById('week-modal-title');
    const focus = document.getElementById('week-modal-focus');
    const conceptsList = document.getElementById('week-concepts-list');
    const questionsList = document.getElementById('week-questions-list');
    const completeBtn = document.getElementById('complete-week-btn');

    if (!modal) return;

    // Set header
    title.textContent = `Week ${week.week}`;
    focus.textContent = week.focus;

    // Render concepts
    conceptsList.innerHTML = week.concepts.map(concept => `
        <div class="concept-item">
            <div class="concept-name">${concept.name}</div>
            <div class="concept-subtopics">
                ${concept.subtopics.map(st => `<span class="subtopic-tag">${st}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Render questions for this week
    const weekQuestions = lldData.questions.filter(q => week.questions.includes(q.id));
    questionsList.innerHTML = weekQuestions.map(q => `
        <div class="week-question-item">
            <input type="checkbox" id="wq-${q.id}" ${isQuestionCompleted(q.id) ? 'checked' : ''} data-qid="${q.id}">
            <label for="wq-${q.id}">
                <strong>#${q.id} ${q.title}</strong> 
                <span class="question-difficulty ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
            </label>
        </div>
    `).join('');

    // Setup checkbox listeners
    questionsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const qid = parseInt(e.target.dataset.qid);
            if (e.target.checked) {
                lldState.completedQuestions.add(qid);
            } else {
                lldState.completedQuestions.delete(qid);
            }
            saveLLDProgress();
            updateLLDStats();
        });
    });

    // Update complete button
    const isCompleted = lldState.completedWeeks.has(week.week);
    completeBtn.textContent = isCompleted ? '✓ WEEK COMPLETED' : '✓ COMPLETE THIS WEEK';
    completeBtn.disabled = isCompleted;
    completeBtn.dataset.week = week.week;

    modal.classList.add('active');
}

// Close week modal
function closeWeekModal() {
    const modal = document.getElementById('week-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Complete current week
function completeCurrentWeek() {
    const btn = document.getElementById('complete-week-btn');
    const weekNum = parseInt(btn.dataset.week);

    if (!weekNum) return;

    lldState.completedWeeks.add(weekNum);

    // Advance to next week if this was the current week
    if (weekNum === lldState.currentWeek) {
        lldState.currentWeek = weekNum + 1;
    }

    saveLLDProgress();
    closeWeekModal();
    renderLLD();
}

// Render questions view
function renderQuestionsView() {
    const grid = document.getElementById('questions-grid');
    if (!grid || !lldData?.questions) return;

    const difficultyFilter = document.getElementById('difficulty-filter')?.value || 'all';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';

    let questions = [...lldData.questions];

    // Apply filters
    if (difficultyFilter !== 'all') {
        questions = questions.filter(q => q.difficulty === difficultyFilter);
    }

    if (statusFilter !== 'all') {
        questions = questions.filter(q => {
            const unlocked = isQuestionUnlocked(q.id);
            const completed = isQuestionCompleted(q.id);

            switch (statusFilter) {
                case 'unlocked': return unlocked && !completed;
                case 'locked': return !unlocked;
                case 'completed': return completed;
                default: return true;
            }
        });
    }

    grid.innerHTML = questions.map(q => {
        const unlocked = isQuestionUnlocked(q.id);
        const completed = isQuestionCompleted(q.id);

        return `
            <div class="question-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}" data-qid="${q.id}">
                <div class="question-header">
                    <span class="question-id">#${q.id}</span>
                    <span class="question-difficulty ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                </div>
                <h4 class="question-title">${q.title}</h4>
                <div class="question-meta">
                    <span>⏱️ ${q.estimatedTime}</span>
                    <span>📅 Week ${q.week}</span>
                </div>
                <div class="question-topics">
                    ${q.topics.slice(0, 3).map(t => `<span class="question-topic">${t.replace(/_/g, ' ')}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers for unlocked questions
    grid.querySelectorAll('.question-card:not(.locked)').forEach(card => {
        card.addEventListener('click', () => {
            const qid = parseInt(card.dataset.qid);
            selectQuestion(qid);
            switchLLDView('practice');
        });
    });
}

// Render practice view
function renderPracticeView() {
    const list = document.getElementById('practice-question-list');
    if (!list || !lldData?.questions) return;

    const unlockedQuestions = getUnlockedQuestions();

    list.innerHTML = unlockedQuestions.map(q => {
        const completed = isQuestionCompleted(q.id);
        const selected = lldState.selectedQuestion === q.id;

        return `
            <div class="practice-question-item ${completed ? 'completed' : ''} ${selected ? 'active' : ''}" data-qid="${q.id}">
                <div class="pq-title">${completed ? '✓ ' : ''}${q.title}</div>
                <div class="pq-meta">${q.difficulty} • ${q.estimatedTime}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    list.querySelectorAll('.practice-question-item').forEach(item => {
        item.addEventListener('click', () => {
            const qid = parseInt(item.dataset.qid);
            selectQuestion(qid);
        });
    });

    // Render selected question if any
    if (lldState.selectedQuestion) {
        renderSelectedQuestion();
    }
}

// Select a question for practice
function selectQuestion(questionId) {
    lldState.selectedQuestion = questionId;

    // Update sidebar selection
    document.querySelectorAll('.practice-question-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.qid) === questionId);
    });

    renderSelectedQuestion();
}

// Render selected question details
function renderSelectedQuestion() {
    const welcomeEl = document.getElementById('practice-welcome');
    const contentEl = document.getElementById('practice-content');

    if (!lldState.selectedQuestion || !lldData?.questions) {
        if (welcomeEl) welcomeEl.style.display = 'flex';
        if (contentEl) contentEl.style.display = 'none';
        return;
    }

    const question = lldData.questions.find(q => q.id === lldState.selectedQuestion);
    if (!question) return;

    if (welcomeEl) welcomeEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'flex';

    // Update header
    document.getElementById('practice-difficulty').textContent = question.difficulty;
    document.getElementById('practice-difficulty').className = `practice-difficulty ${question.difficulty.toLowerCase()}`;
    document.getElementById('practice-question-title').textContent = question.title;
    document.getElementById('practice-time').textContent = `⏱️ ${question.estimatedTime}`;

    // Update requirements
    const reqList = document.getElementById('practice-requirements-list');
    reqList.innerHTML = question.requirements.map(req => `<li>${req}</li>`).join('');

    // Update expectations
    const expGrid = document.getElementById('practice-expectations');
    const expectations = question.expectations;

    expGrid.innerHTML = `
        <div class="expectation-card">
            <div class="expectation-label">CORE CLASSES</div>
            <div class="expectation-value">${expectations.coreClasses.join(', ')}</div>
        </div>
        <div class="expectation-card">
            <div class="expectation-label">DESIGN PATTERNS</div>
            <div class="expectation-value">${expectations.designPatterns.join(', ') || 'None required'}</div>
        </div>
        <div class="expectation-card">
            <div class="expectation-label">RELATIONSHIPS</div>
            <div class="expectation-value">${expectations.relationships}</div>
        </div>
        <div class="expectation-card">
            <div class="expectation-label">KEY METHODS</div>
            <div class="expectation-value">${expectations.keyMethods.slice(0, 3).join(', ')}</div>
        </div>
    `;

    // Update complete button
    const completeBtn = document.getElementById('mark-lld-complete-btn');
    if (completeBtn) {
        const isCompleted = isQuestionCompleted(question.id);
        completeBtn.textContent = isCompleted ? '✓ COMPLETED' : '✓ MARK COMPLETE';
        completeBtn.disabled = isCompleted;
    }
}

// Mark selected question as complete
function markSelectedQuestionComplete() {
    if (!lldState.selectedQuestion) return;

    lldState.completedQuestions.add(lldState.selectedQuestion);
    saveLLDProgress();
    renderLLD();
    renderSelectedQuestion();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the LLD section
    initLLD();
});
