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

  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;

  const svg = document.querySelector('svg');
  if (!svg) {
    console.error('SVG element not found');
    return;
  }

  svg.setAttribute('width', WIDTH);
  svg.setAttribute('height', HEIGHT);
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

  const container = document.querySelector('.lanternContainer');
  if (!container) {
    console.error('Lantern container not found');
    return;
  }

  const originLantern = document.querySelector('#lantern');
  if (!originLantern) {
    console.error('Origin lantern not found');
    return;
  }

  // 移动端减少孔明灯数量
  let wishesToUse = [];
  if (typeof WISHES !== 'undefined' && WISHES.length > 0) {
    if (isMobile()) {
      // 移动端只取部分愿望，减少数量
      wishesToUse = WISHES.slice(0, Math.min(WISHES.length, 20));
    } else {
      wishesToUse = WISHES;
    }
  } else {
    // 如果没有愿望数据，创建一些默认的
    wishesToUse = [
      ["新年快乐", "万事如意"],
      ["身体健康", "心想事成"],
      ["阖家幸福", "平安喜乐"],
      ["财源广进", "步步高升"],
      ["学业有成", "事业顺利"]
    ];
  }

  // 孔明灯数量进一步控制
  const lanternCount = isMobile() ? 8 : 15;
  const actualWishes = wishesToUse.slice(0, lanternCount);

  for (let index = 0; index < actualWishes.length; index++) {
    const interval = random(0.3, 0.8) * index * 1000;
    setTimeout(() => {
      const lantern = createLantern(originLantern, actualWishes[index]);
      container.appendChild(lantern);
    }, interval);
  }

  function createLantern(originLantern, wish) {
    const [fans, wishText] = wish;
    const lantern = originLantern.cloneNode(true);

    // 移动端调整孔明灯大小
    const scaleFactor = isMobile() ? 0.7 : 1;

    // 更新孔明灯尺寸
    const rect = lantern.querySelector('rect');
    const ellipse = lantern.querySelector('ellipse');

    if (rect) {
      const currentX = parseFloat(rect.getAttribute('x') || -20);
      const currentY = parseFloat(rect.getAttribute('y') || -40);
      const currentWidth = parseFloat(rect.getAttribute('width') || 40);
      const currentHeight = parseFloat(rect.getAttribute('height') || 80);

      rect.setAttribute('x', currentX * scaleFactor);
      rect.setAttribute('y', currentY * scaleFactor);
      rect.setAttribute('width', currentWidth * scaleFactor);
      rect.setAttribute('height', currentHeight * scaleFactor);
    }

    if (ellipse) {
      const currentRx = parseFloat(ellipse.getAttribute('rx') || 15);
      const currentRy = parseFloat(ellipse.getAttribute('ry') || 5);

      ellipse.setAttribute('rx', currentRx * scaleFactor);
      ellipse.setAttribute('ry', currentRy * scaleFactor);
    }

    // 调整位置和移动速度
    const x = random(WIDTH * 0.1, WIDTH * 0.9);
    const y = HEIGHT;
    const transformOrigin = `0 0`;
    const transform = `translate(${x}, ${y}) scale(${scaleFactor})`;

    lantern.setAttribute('transformOrigin', transformOrigin);
    lantern.setAttribute('transform', transform);
    lantern.setAttribute('wish', wishText);
    lantern.setAttribute('fans', fans);
    lantern.x = x;
    lantern.y = y;

    // 移动端调整移动速度
    if (isMobile()) {
      lantern.deltaX = random(-0.3, 0.3);
      lantern.deltaY = random(0.3, 0.6);
    } else {
      lantern.deltaX = random(-0.5, 0.5);
      lantern.deltaY = random(0.5, 1);
    }

    lantern.scale = scaleFactor;

    // 添加触摸/点击事件
    lantern.addEventListener('click', onLanternClick);

    // 移动端添加触摸事件
    lantern.addEventListener('touchstart', function(e) {
      e.preventDefault();
      onLanternClick({ currentTarget: this });
    }, { passive: false });

    return lantern;
  }

  // 愿望显示相关
  const wishContainer = document.querySelector('#wish .wish-container');
  const fansDom = document.querySelector('#wish .fans');
  const wishDom = document.querySelector('#wish .wish');
  let wishTimer = null;

  function onLanternClick(event) {
    // 检查是否已经隐藏了愿望显示功能
    if (typeof window.onLanternClick === 'function' && window.onLanternClick.toString().includes('return;')) {
      return; // 如果被禁用，直接返回
    }

    wishTimer && clearTimeout(wishTimer);
    const { currentTarget } = event;
    const fans = currentTarget.getAttribute('fans');
    const wish = currentTarget.getAttribute('wish');

    if (fansDom && wishDom && wishContainer) {
      fansDom.innerHTML = `—— ${fans}`;
      wishDom.innerHTML = wish;

      wishContainer.style.transition = 'none';
      wishContainer.style.transform = 'scale(0)';
      wishContainer.style.opacity = 0;

      setTimeout(() => {
        wishContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        wishContainer.style.opacity = 1;
        wishContainer.style.transform = 'scale(1)';

        wishTimer = setTimeout(() => {
          wishContainer.style.transition = 'opacity 0.6s ease';
          wishContainer.style.opacity = 0;
        }, 2000);
      }, 0);
    }
  }

  // 移动端调整更新频率
  const updateInterval = isMobile() ? 33 : 16.6; // 移动端30fps，桌面端60fps

  setInterval(() => {
    const lanterns = container.children;
    for (let index = 0; index < lanterns.length; index++) {
      const lantern = lanterns[index];
      let x = lantern.x + lantern.deltaX;
      let y = lantern.y - lantern.deltaY;
      let scale = lantern.scale;

      // 移动端调整缩放速度
      const scaleReduction = isMobile() ? 0.998 : 0.997;
      if (y <= HEIGHT - 100) {
        scale *= scaleReduction;
      }

      const transform = `translate(${x}, ${y}) scale(${scale}, ${scale})`;
      lantern.setAttribute('transform', transform);

      // 重置位置（飞出屏幕后重新开始）
      if (y <= -100 || x <= -100 || x > WIDTH) {
        x = random(WIDTH * 0.1, WIDTH * 0.9);
        y = HEIGHT;
        scale = lantern.scale;
      }

      lantern.x = x;
      lantern.y = y;
      lantern.scale = scale;
    }
  }, updateInterval);
})();