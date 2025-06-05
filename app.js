// Vibe Timer App
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const settingsBtn = document.getElementById('settings-btn');
const musicBtn = document.getElementById('music-btn');
const chillAudio = document.getElementById('chill-audio');
const ringProgress = document.querySelector('.ring-progress');

// Default durations (in seconds)
let workDuration = parseInt(localStorage.getItem('workDuration')) || 1500; // 25 min
let breakDuration = parseInt(localStorage.getItem('breakDuration')) || 300; // 5 min
let isWork = true;
let timer = null;
let timeLeft = workDuration;
let running = false;

// SVG ring setup
const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
ringProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
ringProgress.style.strokeDashoffset = 0;

function updateDisplay() {
  const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const sec = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
}

function updateRing() {
  const percent = timeLeft / (isWork ? workDuration : breakDuration);
  ringProgress.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - percent)}`;
}

function playChime() {
  const chime = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae3e2.mp3');
  chime.play();
}

function notify(msg) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(msg);
  } else {
    playChime();
  }
}

function startTimer() {
  if (running) return;
  running = true;
  startBtn.textContent = 'Pause';
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
      updateRing();
    } else {
      clearInterval(timer);
      running = false;
      playChime();
      if (isWork) {
        notify('Work session complete! Time for a break.');
        isWork = false;
        timeLeft = breakDuration;
      } else {
        notify('Break over! Back to work.');
        isWork = true;
        timeLeft = workDuration;
      }
      updateDisplay();
      updateRing();
      startTimer();
    }
  }, 1000);
}

function pauseTimer() {
  running = false;
  startBtn.textContent = 'Start';
  clearInterval(timer);
}

startBtn.addEventListener('click', () => {
  if (running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

musicBtn.addEventListener('click', () => {
  if (chillAudio.paused) {
    chillAudio.play();
    musicBtn.textContent = 'Pause Beats';
  } else {
    chillAudio.pause();
    musicBtn.textContent = 'Chill Beats';
  }
});

// Settings modal (basic prompt for now)
settingsBtn.addEventListener('click', () => {
  const work = prompt('Work duration (minutes):', workDuration / 60);
  const brk = prompt('Break duration (minutes):', breakDuration / 60);
  if (work && brk) {
    workDuration = Math.max(1, parseInt(work)) * 60;
    breakDuration = Math.max(1, parseInt(brk)) * 60;
    localStorage.setItem('workDuration', workDuration);
    localStorage.setItem('breakDuration', breakDuration);
    isWork = true;
    timeLeft = workDuration;
    updateDisplay();
    updateRing();
    pauseTimer();
  }
});

// Request notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Initial render
updateDisplay();
updateRing(); 