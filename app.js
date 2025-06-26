// Vibe Timer App
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const settingsBtn = document.getElementById('settings-btn');
const musicBtn = document.getElementById('music-btn');
const chillAudio = document.getElementById('chill-audio');
const ringProgress = document.querySelector('.ring-progress');
const centerPlayPauseBtn = document.getElementById('center-play-pause');

// Default durations (in seconds)
let workDuration = parseInt(localStorage.getItem('workDuration')) || 1500; // 25 min
let isWork = true;
let timer = null;
let timeLeft = workDuration;
let running = false;
let isMuted = false;

// SVG ring setup
const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
ringProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
ringProgress.style.strokeDashoffset = 0;

let chillPlaylist = [];
let currentTrack = 0;

async function loadPlaylist() {
  try {
    const resp = await fetch('assets/playlist.json');
    if (resp.ok) {
      const files = await resp.json();
      chillPlaylist = files.filter(f => f.endsWith('.mp3')).map(f => 'assets/' + f);
      console.log('Playlist loaded:', chillPlaylist);
    } else {
      chillPlaylist = [
        'assets/song1_texas_hold_em.mp3',
        'assets/song2_push_2_start.mp3',
        'assets/song3_anxiety.mp3',
        'assets/song4_you_make_loving_fun.mp3',
        'assets/song5_don\'t_stop_believin.mp3',
        'assets/song6_summer_of_69.mp3',
        'assets/song7_another_brick_in_the_wall.mp3',
        'assets/song8_daba_dee_daba.mp3',
        'assets/song9_beat_it.mp3',
        'assets/song10_californication.mp3',
        'assets/song11_daft_p.munkp3',
        'assets/song12_stairway_to_heaven.mp3',
        'assets/song13_party_in_the_usa.mp3',
        'assets/song14_begging.mp3',
        'assets/song15_suspicious_minds.mp3',
        'assets/song16_hound_dog.mp3'
      ];
      console.log('Fallback playlist loaded:', chillPlaylist);
    }
  } catch (error) {
    console.error('Error loading playlist:', error);
    chillPlaylist = [
      'assets/song1_texas_hold_em.mp3',
        'assets/song2_push_2_start.mp3',
        'assets/song3_anxiety.mp3',
        'assets/song4_you_make_loving_fun.mp3',
        'assets/song5_don\'t_stop_believin.mp3',
        'assets/song6_summer_of_69.mp3',
        'assets/song7_another_brick_in_the_wall.mp3',
        'assets/song8_daba_dee_daba.mp3',
        'assets/song9_beat_it.mp3',
        'assets/song10_californication.mp3',
        'assets/song11_daft_p.munkp3',
        'assets/song12_stairway_to_heaven.mp3',
        'assets/song13_party_in_the_usa.mp3',
        'assets/song14_begging.mp3',
        'assets/song15_suspicious_minds.mp3',
        'assets/song16_hound_dog.mp3'
    ];
  }
}

function updateDisplay() {
  const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const sec = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
}

function updateRing() {
  const percent = timeLeft / workDuration;
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

function setPlayPauseIcon() {
  centerPlayPauseBtn.innerHTML = running
    ? `<svg viewBox="0 0 32 32"><rect x="7" y="6" width="6" height="20" rx="2"/><rect x="19" y="6" width="6" height="20" rx="2"/></svg>`
    : `<svg viewBox="0 0 32 32"><polygon points="8,6 26,16 8,26"/></svg>`;
  startBtn.textContent = running ? 'Pause' : 'Start';
  
  // Update music button icon
  musicBtn.innerHTML = isMuted ? 'Sound 🔇' : 'Sound 🔊';
}

function startTimer() {
  if (running) return;
  running = true;
  setPlayPauseIcon();
  
  // Resume music if not muted and was previously playing
  if (!isMuted && chillPlaylist.length > 0) {
    if (chillAudio.paused && chillAudio.src) {
      chillAudio.play(); // Resume from where it was paused
    } else if (!chillAudio.src) {
      playCurrentTrack(); // Start new track only if no track was loaded
    }
  }
  
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
      updateRing();
    } else {
      clearInterval(timer);
      running = false;
      setPlayPauseIcon();
      playChime();
      notify('Work session complete!');
      timeLeft = workDuration;
      updateDisplay();
      updateRing();
      startTimer();
    }
  }, 1000);
}

function pauseTimer() {
  running = false;
  setPlayPauseIcon();
  clearInterval(timer);
  
  // Pause music (but don't stop it)
  if (!chillAudio.paused) {
    chillAudio.pause();
  }
}

function playCurrentTrack() {
  if (!chillPlaylist.length) return;
  chillAudio.src = chillPlaylist[currentTrack];
  chillAudio.loop = false;
  chillAudio.play();
  console.log('Playing track:', chillPlaylist[currentTrack]);
}

chillAudio.addEventListener('ended', () => {
  if (!chillPlaylist.length) return;
  currentTrack = (currentTrack + 1) % chillPlaylist.length;
  console.log('Track ended, next track:', chillPlaylist[currentTrack]);
  playCurrentTrack();
});

musicBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  chillAudio.muted = isMuted;
  setPlayPauseIcon();
});

// Settings modal (basic prompt for now)
settingsBtn.addEventListener('click', () => {
  const work = prompt('Work duration (minutes):', workDuration / 60);
  if (work) {
    workDuration = Math.max(1, parseInt(work)) * 60;
    localStorage.setItem('workDuration', workDuration);
    timeLeft = workDuration;
    updateDisplay();
    updateRing();
    pauseTimer();
  }
});

// Initial render
updateDisplay();
updateRing();
setPlayPauseIcon();

startBtn.addEventListener('click', () => {
  if (running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

centerPlayPauseBtn.addEventListener('click', () => {
  if (running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

loadPlaylist(); 