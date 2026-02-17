let isEnabled = true;
let playbackSpeed = 1;
let skipDuration = 2;
let autoComplete = false;
let automationInterval = null;

const runAutomation = () => {
  const videos = document.querySelectorAll('video');
  const nextButton = document.querySelector('[data-purpose="go-to-next-item"], [class*="next-lesson"]');

  videos.forEach(video => {
    // Apply playback speed
    if (video.playbackRate !== playbackSpeed) {
      video.playbackRate = playbackSpeed;
    }

    // Video skipping logic
    if (video.currentTime < (video.duration - skipDuration)) {
      video.muted = true;
      video.currentTime = video.duration - skipDuration;
      video.play();
    }

    // Auto-mark complete and go to next
    if (video.ended || video.currentTime >= (video.duration - 1)) {
      if (autoComplete) {
        const markAsCompleteButton = document.querySelector('[data-purpose="mark-as-complete"]');
        if (markAsCompleteButton) {
          markAsCompleteButton.click();
        }
      }
      if (nextButton) {
        nextButton.click();
      }
    }
  });

  // Quiz solver logic (remains the same)
  const quizOptions = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
  const checkAnswerBtn = document.querySelector('[data-purpose="check-answer"], button[class*="submit-answer"]');
  const nextQuestionBtn = document.querySelector('[data-purpose="next-question"], [data-purpose="finish-quiz"]');

  if (quizOptions.length > 0) {
    console.log("Quiz detected! Solving...");
    quizOptions[0].click();
    setTimeout(() => {
      if (checkAnswerBtn) checkAnswerBtn.click();
    }, 1000);
    setTimeout(() => {
      if (nextQuestionBtn) nextQuestionBtn.click();
    }, 2000);
  }
};

const startAutomation = () => {
  if (automationInterval) return;
  automationInterval = setInterval(runAutomation, 3000);
};

const stopAutomation = () => {
  clearInterval(automationInterval);
  automationInterval = null;
};

// Get initial state
chrome.storage.local.get(['isEnabled', 'playbackSpeed', 'skipDuration', 'autoComplete'], (data) => {
  isEnabled = typeof data.isEnabled === 'undefined' ? true : data.isEnabled;
  playbackSpeed = parseFloat(data.playbackSpeed) || 1;
  skipDuration = parseInt(data.skipDuration, 10) || 2;
  autoComplete = typeof data.autoComplete === 'undefined' ? false : data.autoComplete;

  if (isEnabled) {
    startAutomation();
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.settings) {
    if (typeof request.settings.isEnabled !== 'undefined') {
      isEnabled = request.settings.isEnabled;
      if (isEnabled) {
        startAutomation();
      } else {
        stopAutomation();
      }
    }
    if (typeof request.settings.playbackSpeed !== 'undefined') {
      playbackSpeed = parseFloat(request.settings.playbackSpeed);
    }
    if (typeof request.settings.skipDuration !== 'undefined') {
      skipDuration = parseInt(request.settings.skipDuration, 10);
    }
    if (typeof request.settings.autoComplete !== 'undefined') {
      autoComplete = request.settings.autoComplete;
    }
  }
});