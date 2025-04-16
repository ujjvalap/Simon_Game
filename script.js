let level = 1;
let sequence = [];
let userSequence = [];
let isMuted = false;
let highScore = localStorage.getItem('simonHighScore') || 0;
let isPlaying = false;
const tones = [261.6, 329.6, 392.0, 523.3]; // C4, E4, G4, C5

const display = document.getElementById('display');
const gameOverScreen = document.getElementById('gameOverScreen');

document.getElementById('highScore').textContent = highScore;

function generateSequence() {
  sequence = [];
  for (let i = 0; i < 20; i++) {
    sequence.push(Math.floor(Math.random() * 4));
  }
}

function updateProgress() {
  const progress = (level / 20) * 100;
  document.querySelector('.progress').style.width = `${progress}%`;
}

function updateHighScore() {
  if (level > highScore) {
    highScore = level;
    localStorage.setItem('simonHighScore', highScore);
    document.getElementById('highScore').textContent = highScore;
  }
}

function toggleMute() {
  isMuted = !isMuted;
  document.getElementById('muteBtn').textContent = `🔊 Sound: ${isMuted ? 'OFF' : 'ON'}`;
}

function playTone(frequency) {
  if (isMuted) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    context.close();
  }, 300);
}

function activateButton(colorIndex) {
  const button = document.querySelector(`[data-color="${colorIndex}"]`);
  button.classList.add('active');
  playTone(tones[colorIndex]);
  setTimeout(() => button.classList.remove('active'), 300);
}

function handleGameOver() {
  updateHighScore();
  document.querySelector('.score-display').textContent = `Score: ${level - 1}`;
  gameOverScreen.classList.add('show');
  isPlaying = false;

  if (level === 21) {
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: hsl(${Math.random() * 360}, 100%, 50%);
        top: -10px;
        left: ${Math.random() * 100}%;
        animation: fall ${Math.random() * 3 + 2}s linear;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  }
}

document.getElementById('muteBtn').addEventListener('click', toggleMute);

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const theme = this.classList.contains('neon') ? 'neon-theme' : '';
    document.body.className = theme;
  });
});

document.querySelectorAll('.simon-button').forEach(button => {
  button.addEventListener('click', () => {
    if (!isPlaying || !canClick) return;
    const index = parseInt(button.dataset.color);
    handleUserInput(index);
  });
});

document.getElementById('startBtn').addEventListener('click', initGame);
document.getElementById('strictBtn').addEventListener('click', toggleStrict);

function initGame() {
  level = 1;
  sequence = [];
  userSequence = [];
  isPlaying = true;
  display.textContent = `0${level}`;
  gameOverScreen.classList.remove('show');
  generateSequence();
  playSequence();
}

function playSequence() {
  let i = 0;
  canClick = false;
  const interval = setInterval(() => {
    activateButton(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(interval);
      canClick = true;
    }
  }, 1000);
}

function handleUserInput(index) {
  if (sequence[userSequence.length] === index) {
    userSequence.push(index);
    if (userSequence.length === sequence.length) {
      level++;
      display.textContent = level < 10 ? `0${level}` : level;
      updateProgress();
      userSequence = [];
      setTimeout(playSequence, 1000);
    }
  } else {
    handleGameOver();
  }
}

function toggleStrict() {
  strictMode = !strictMode;
  document.getElementById('strictBtn').textContent = `🔒 Strict: ${strictMode ? 'ON' : 'OFF'}`;
}
