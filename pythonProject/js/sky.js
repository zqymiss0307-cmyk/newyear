(function () {
  // 移动端检测函数
  function isMobile() {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];
    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    }) || window.innerWidth <= 768;
  }

  // 移动端减少星星数量
  const STAR_COUNT = isMobile() ? 150 : 300;
  const MIN_STAR_SIZE = isMobile() ? 1 : 2;
  const MAX_STAR_SIZE = isMobile() ? 4 : 8;

  const container = document.querySelector('#sky');
  if (!container) {
    console.error('Sky container not found');
    return;
  }

  const collection = document.createDocumentFragment();

  for (let index = 0; index < STAR_COUNT; index++) {
    const star = document.createElement('span');
    star.setAttribute('class', 'star');

    const width = random(MIN_STAR_SIZE, MAX_STAR_SIZE);
    const height = width;
    const top = random(0, 100);
    const left = random(0, 100);

    // 移动端调整动画参数
    const duration = isMobile() ? random(0.8, 1.5) : random(0.5, 1);
    const delay = random(0, 0.75);

    star.style.cssText = `
      width: ${width}px; 
      height: ${height}px;
      left: ${left}%; 
      top: ${top}%; 
      animation-duration: ${duration}s; 
      animation-delay: ${delay}s;
      opacity: ${random(0.3, 0.8)};
    `;

    collection.appendChild(star);
  }

  container.appendChild(collection);

  // 移动端性能优化：添加动画简化
  if (isMobile()) {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .star {
          animation: star-twinkle-mobile 1.5s infinite alternate !important;
        }
        
        @keyframes star-twinkle-mobile {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1); }
        }
      }
    `;
    document.head.appendChild(style);
  }
})();