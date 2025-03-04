// DOM Elements
const currentTopic = document.getElementById('current-topic');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const scheduleList = document.getElementById('schedule-list');
const topicInput = document.getElementById('topic');
const durationInput = document.getElementById('duration');
const addBtn = document.getElementById('add-btn');
const quotesElement = document.getElementById('quotes');

// App State
let studySchedule = [];
let currentScheduleIndex = -1;
let timer = null;
let secondsRemaining = 0;
let isPaused = false;
let totalSeconds = 0;

// Motivational quotes
const motivationalQuotes = [
  "The expert in anything was once a beginner.",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Your time is limited, don't waste it living someone else's life.",
  "The future depends on what you do today.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dreams don't work unless you do."
];

// Load saved schedule from localStorage if exists
function loadSavedSchedule() {
  const savedSchedule = localStorage.getItem('studySchedule');
  if (savedSchedule) {
    studySchedule = JSON.parse(savedSchedule);
    renderSchedule();
  }
}

// Save schedule to localStorage
function saveSchedule() {
  localStorage.setItem('studySchedule', JSON.stringify(studySchedule));
}

// Format time as HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}

// Render the schedule list
function renderSchedule() {
  scheduleList.innerHTML = '';
  
  if (studySchedule.length === 0) {
    scheduleList.innerHTML = '<p>No study periods added. Add one below!</p>';
    return;
  }
  
  studySchedule.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'schedule-item';
    
    if (index === currentScheduleIndex) {
      itemElement.classList.add('active');
    } else if (index < currentScheduleIndex) {
      itemElement.classList.add('completed');
    }
    
    itemElement.innerHTML = `
      <div>
        <strong>${item.topic}</strong> - ${formatTime(item.duration * 60)}
      </div>
      <div class="schedule-item-actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
    
    scheduleList.appendChild(itemElement);
  });
  
  // Add event listeners for edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', handleEditItem);
  });
  
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', handleDeleteItem);
  });
}

// Add a new study period to the schedule
function handleAddItem() {
  const topic = topicInput.value.trim();
  const duration = parseInt(durationInput.value);
  
  if (!topic) {
    alert('Please enter a topic name');
    return;
  }
  
  if (isNaN(duration) || duration <= 0) {
    alert('Please enter a valid duration');
    return;
  }
  
  studySchedule.push({
    topic,
    duration,
    completed: false
  });
  
  saveSchedule();
  renderSchedule();
  
  // Clear inputs
  topicInput.value = '';
  durationInput.value = '60';
}

// Edit a study period
function handleEditItem(e) {
  const index = parseInt(e.target.dataset.index);
  const item = studySchedule[index];
  
  topicInput.value = item.topic;
  durationInput.value = item.duration;
  
  // Remove the item from the schedule
  studySchedule.splice(index, 1);
  
  // Update the current schedule index if needed
  if (index < currentScheduleIndex) {
    currentScheduleIndex--;
  } else if (index === currentScheduleIndex) {
    // If editing the active item, reset timer
    resetTimer();
    currentScheduleIndex = -1;
  }
  
  saveSchedule();
  renderSchedule();
}

// Delete a study period
function handleDeleteItem(e) {
  const index = parseInt(e.target.dataset.index);
  
  if (confirm('Are you sure you want to delete this study period?')) {
    studySchedule.splice(index, 1);
    
    // Update the current schedule index if needed
    if (index < currentScheduleIndex) {
      currentScheduleIndex--;
    } else if (index === currentScheduleIndex) {
      // If deleting the active item, reset timer
      resetTimer();
      currentScheduleIndex = -1;
    }
    
    saveSchedule();
    renderSchedule();
  }
}

function updateProgressCircle() {
    if (totalSeconds > 0) {
        const progress = (secondsRemaining / totalSeconds);
        const offset = circumference * (1 - progress);
        progressCircle.style.strokeDashoffset = offset;
    }
}

// Start the timer
function startTimer() {
    if (studySchedule.length === 0) {
        alert('Please add at least one study period to your schedule');
        return;
    }
    
    if (currentScheduleIndex === -1) {
        currentScheduleIndex = 0;
        const currentItem = studySchedule[currentScheduleIndex];
        secondsRemaining = currentItem.duration * 60;
        totalSeconds = secondsRemaining; // Set total seconds for progress calculation
        currentTopic.textContent = currentItem.topic;
        updateProgressCircle(); // Initialize circle
    }
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    
    if (!timer) {
        timer = setInterval(updateTimer, 1000);
    }
    
    isPaused = false;
    renderSchedule();
}

// Pause the timer
function pauseTimer() {
  isPaused = true;
  pauseBtn.textContent = 'Resume';
  pauseBtn.removeEventListener('click', pauseTimer);
  pauseBtn.addEventListener('click', resumeTimer);
}

// Resume the timer
function resumeTimer() {
  isPaused = false;
  pauseBtn.textContent = 'Pause';
  pauseBtn.removeEventListener('click', resumeTimer);
  pauseBtn.addEventListener('click', pauseTimer);
}

// Reset the timer
function resetTimer() {
    clearInterval(timer);
    timer = null;
    
    currentScheduleIndex = -1;
    secondsRemaining = 0;
    totalSeconds = 0;
    isPaused = false;
    
    timerElement.textContent = '00:00:00';
    currentTopic.textContent = 'Not started';
    progressCircle.style.strokeDashoffset = 0; // Reset circle
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    
    pauseBtn.textContent = 'Pause';
    pauseBtn.removeEventListener('click', resumeTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    
    renderSchedule();
}

// Update the timer display
function updateTimer() {
    if (isPaused) return;
    
    secondsRemaining--;
    timerElement.textContent = formatTime(secondsRemaining);
    updateProgressCircle(); // Update circle progress
    
    if (secondsRemaining <= 0) {
        window.api.playSound();
        
        const currentItem = studySchedule[currentScheduleIndex];
        window.api.showNotification({
            title: 'Study Period Complete!',
            message: `You've completed studying ${currentItem.topic}!`
        });
        
        showInAppNotification(currentItem.topic);
        
        currentScheduleIndex++;
        
        if (currentScheduleIndex < studySchedule.length) {
            const nextItem = studySchedule[currentScheduleIndex];
            secondsRemaining = nextItem.duration * 60;
            totalSeconds = secondsRemaining; // Reset total for new topic
            currentTopic.textContent = nextItem.topic;
            updateProgressCircle(); // Reset circle for new topic
            renderSchedule();
        } else {
            endSchedule();
        }
    }
}

// Show in-app notification
function showInAppNotification(completedTopic) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  
  if (currentScheduleIndex >= studySchedule.length) {
    // All periods completed
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    notification.innerHTML = `
      <h3>Today's Study Complete!</h3>
      <p>${randomQuote}</p>
    `;
  } else {
    // Moving to next period
    const nextItem = studySchedule[currentScheduleIndex];
    notification.innerHTML = `
      <h3>${completedTopic} Complete!</h3>
      <p>Next up: ${nextItem.topic}</p>
    `;
  }
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// End the schedule
function endSchedule() {
    clearInterval(timer);
    timer = null;
    
    currentScheduleIndex = -1;
    currentTopic.textContent = 'All Done!';
    progressCircle.style.strokeDashoffset = 0; // Reset circle
    
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    quotesElement.textContent = randomQuote;
    
    window.api.showNotification({
        title: 'Study Schedule Complete!',
        message: 'You\'ve completed all your study periods for today!'
    });
    
    resetBtn.disabled = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    renderSchedule();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addBtn.addEventListener('click', handleAddItem);

// Display a random quote on load
quotesElement.textContent = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

// Load saved schedule on startup
loadSavedSchedule();

// renderer.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        html.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
    });
});

const progressCircle = document.querySelector('.progress-ring__circle');

const radius = 90; // Matches r="90" in SVG
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = 0; // Initially full


class QuoteTypewriter {
    constructor(elementId, quotes) {
        this.element = document.getElementById(elementId);
        this.quotes = quotes;
        this.currentQuoteIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.typingSpeed = 50;
        this.deletingSpeed = 30;
        this.pauseBetweenQuotes = 2000;
    }

    type() {
        const currentQuote = this.quotes[this.currentQuoteIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentQuote.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentQuote.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }

        let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

        if (!this.isDeleting && this.currentCharIndex === currentQuote.length) {
            typeSpeed = this.pauseBetweenQuotes;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
        }

        setTimeout(() => this.type(), typeSpeed);
    }

    start() {
        this.type();
    }
}

// Initialize the typewriter when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const quoteTypewriter = new QuoteTypewriter('quotes', motivationalQuotes);
    quoteTypewriter.start();
});