document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const playbackSpeed = document.getElementById('playbackSpeed');
  const skipDuration = document.getElementById('skipDuration');
  const autoCompleteSwitch = document.getElementById('autoCompleteSwitch');

  // Load settings from storage
  chrome.storage.local.get(['isEnabled', 'playbackSpeed', 'skipDuration', 'autoComplete'], (data) => {
    const isEnabled = typeof data.isEnabled === 'undefined' ? true : data.isEnabled;
    const speed = data.playbackSpeed || '1';
    const duration = data.skipDuration || 2;
    const autoComplete = typeof data.autoComplete === 'undefined' ? false : data.autoComplete;
    
    updateUI({ isEnabled, speed, duration, autoComplete });
  });

  toggleSwitch.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    saveAndSendMessage({ isEnabled });
    updateUI({ isEnabled });
  });

  playbackSpeed.addEventListener('change', (e) => {
    const speed = e.target.value;
    saveAndSendMessage({ playbackSpeed: speed });
    updateUI({ speed });
  });

  skipDuration.addEventListener('input', (e) => {
    const duration = e.target.value;
    saveAndSendMessage({ skipDuration: duration });
    updateUI({ duration });
  });

  autoCompleteSwitch.addEventListener('change', (e) => {
    const autoComplete = e.target.checked;
    saveAndSendMessage({ autoComplete });
    updateUI({ autoComplete });
  });

  function saveAndSendMessage(settings) {
    chrome.storage.local.set(settings, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { settings });
        }
      });
    });
  }

  function updateUI(settings) {
    if (typeof settings.isEnabled !== 'undefined') {
      toggleSwitch.checked = settings.isEnabled;
    }
    if (typeof settings.speed !== 'undefined') {
      playbackSpeed.value = settings.speed;
    }
    if (typeof settings.duration !== 'undefined') {
      skipDuration.value = settings.duration;
    }
    if (typeof settings.autoComplete !== 'undefined') {
      autoCompleteSwitch.checked = settings.autoComplete;
    }
  }

  // Particle animation
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let particles = [];

  const mouse = {
    x: null,
    y: null
  };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
    for (let i = 0; i < 1; i++) {
      particles.push(new Particle());
    }
  });

  class Particle {
    constructor() {
      this.x = mouse.x;
      this.y = mouse.y;
      this.size = Math.random() * 5 + 1;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.speedY = Math.random() * 1.5 - 0.75;
      this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.size > 0.2) this.size -= 0.1;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].size <= 0.3) {
        particles.splice(i, 1);
        i--;
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animate);
  }
  animate();
});
