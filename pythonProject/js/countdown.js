(function() {
  // 倒计时配置
  const COUNTDOWN_SECONDS = 10; // 10秒倒计时
  let countdownInterval = null;
  let currentSeconds = COUNTDOWN_SECONDS;

  // DOM元素
  const countdownElement = document.getElementById('countdown');
  const newYearGreetingElement = document.getElementById('new-year-greeting');
  const secondsElement = document.getElementById('seconds');
  const toggleMusicButton = document.getElementById('toggle-music');
  const toggleFireworksButton = document.getElementById('toggle-fireworks');
  const resetCountdownButton = document.getElementById('reset-countdown');
  const bgMusic = document.getElementById('bg-music');

  // 初始化倒计时
  function initCountdown() {
    // 显示倒计时，隐藏新年祝福
    countdownElement.classList.remove('hidden');
    newYearGreetingElement.classList.add('hidden');

    // 重置秒数
    currentSeconds = COUNTDOWN_SECONDS;
    secondsElement.textContent = currentSeconds;

    // 清除现有计时器
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    // 开始倒计时
    countdownInterval = setInterval(() => {
      currentSeconds--;
      secondsElement.textContent = currentSeconds;

      // 倒计时结束
      if (currentSeconds <= 0) {
        clearInterval(countdownInterval);
        showNewYearGreeting();

        // 尝试播放背景音乐
        playBackgroundMusic();
      }
    }, 1000);
  }

  // 显示新年祝福
  function showNewYearGreeting() {
    countdownElement.classList.add('hidden');
    newYearGreetingElement.classList.remove('hidden');

    // 添加显示动画
    setTimeout(() => {
      newYearGreetingElement.style.opacity = '1';
      newYearGreetingElement.style.transform = 'scale(1)';
    }, 100);
  }

  // 播放背景音乐
  function playBackgroundMusic() {
    if (bgMusic.paused) {
      bgMusic.play().catch(e => {
        console.log("背景音乐播放被阻止，请手动点击播放按钮");
      });
    }
  }

  // 切换音乐播放状态
  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play();
      toggleMusicButton.innerHTML = '<span class="music-icon">🔊</span> 音乐';
    } else {
      bgMusic.pause();
      toggleMusicButton.innerHTML = '<span class="music-icon">🔇</span> 音乐';
    }
  }

  // 切换烟花显示
  function toggleFireworks() {
    if (window.fireworksInstance) {
      if (window.fireworksInstance._timer) {
        // 暂停烟花
        window.fireworksInstance.pause();
        toggleFireworksButton.innerHTML = '<span class="fireworks-icon">🎇</span> 烟花';
      } else {
        // 恢复烟花
        window.fireworksInstance.start();
        toggleFireworksButton.innerHTML = '<span class="fireworks-icon">🎆</span> 烟花';
      }
    }
  }

  // 重置倒计时
  function resetCountdown() {
    initCountdown();
  }

  // 页面卸载时清理
  function cleanup() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    if (window.fireworksInstance) {
      window.fireworksInstance.stop();
    }

    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  // 初始化
  function init() {
    // 开始倒计时
    initCountdown();

    // 绑定按钮事件
    if (toggleMusicButton) {
      toggleMusicButton.addEventListener('click', toggleMusic);
    }

    if (toggleFireworksButton) {
      toggleFireworksButton.addEventListener('click', toggleFireworks);
    }

    if (resetCountdownButton) {
      resetCountdownButton.addEventListener('click', resetCountdown);
    }

    // 页面关闭时清理
    window.addEventListener('beforeunload', cleanup);

    // 页面隐藏时暂停音乐
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && !bgMusic.paused) {
        bgMusic.pause();
      }
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();