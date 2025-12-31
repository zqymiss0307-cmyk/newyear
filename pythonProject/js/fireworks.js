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

  const DEFAULT_COLORS = ['#BDC9E5', '#F5D488', '#F5B488', '#DCBBA3', '#BE88DC',
  '#FFE2A0', '#C9FFA0', '#A0ECFF', '#A0C0FF', '#FFA0A0']

  const STATUS = {
    INIT: 'init',
    COMPLETED: 'completed'
  }

  // 焰火集合类
  class Fireworks {
    _timer = null;
    _animater = null;

    useAnimationFrame = false; // 移动端不使用animationFrame
    ctx = null;
    offScreenCtx = null;
    fireworks = [];
    fireworkCount = 8;
    fireworkInterval = 400;
    fireworkColors = DEFAULT_COLORS;
    particleOptions = {
      size: 15,
      speed: 15,
      gravity: 0.08,
      power: 0.93,
      shrink: 0.97,
      jitter: 1,
      color: "hsla(210, 100%, 50%, 1)",
    };

    constructor(dom, options = {}) {
      if (!(dom instanceof HTMLElement)) {
        options = dom || {};
      }

      if (!dom) {
        dom = document.body;
      }

      this.initCanvas(dom);

      const { particleOptions = {}, ...others } = options;
      this.particleOptions = { ...this.particleOptions, ...particleOptions };
      Object.keys(others).forEach((key) => (this[key] = others[key]));

      // 移动端调整参数
      if (isMobile()) {
        this.fps = 30; // 移动端降低帧率
        this.fireworkCount = 6; // 减少烟花数量
        this.particleOptions = {
          ...this.particleOptions,
          size: 10, // 减小粒子大小
          speed: 12, // 降低速度
          particleCount: 60, // 减少粒子数量
        };
        this.fireworkInterval = 500; // 增加爆炸间隔
      } else {
        this.fps = 45;
        this.fireworkCount = 8;
      }

      this.fireworkInterval = 3000 / this.fireworkCount;
    }

    // 初始化画布
    initCanvas(dom) {
      let canvas = dom;

      const isCanvas = canvas.nodeName.toLowerCase() === "canvas";
      if (!isCanvas) {
        canvas = document.createElement("canvas");
        dom.appendChild(canvas);
      }

      // 移动端优化：降低画布分辨率
      const pixelRatio = isMobile() ? 1 : window.devicePixelRatio || 1;
      const { width, height } = dom.getBoundingClientRect();

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.cssText = `width: ${width}px; height: ${height}px;`;

      this.ctx = canvas.getContext("2d");

      // 缩放画布以匹配CSS大小
      if (pixelRatio !== 1) {
        this.ctx.scale(pixelRatio, pixelRatio);
      }

      const offScreenCanvas = canvas.cloneNode();
      this.offScreenCtx = offScreenCanvas.getContext("2d");

      if (pixelRatio !== 1) {
        this.offScreenCtx.scale(pixelRatio, pixelRatio);
      }
    }

    // 创建单个焰火
    createFirework(x, y, color) {
      const { ctx, particleOptions, fireworkColors } = this;
      const { width, height } = ctx.canvas;

      // 如果是移动端，限制烟花在屏幕中间区域
      if (isMobile()) {
        x = x ?? random(width * 0.2, width * 0.8);
        y = y ?? random(height * 0.2, height * 0.8);
      } else {
        x = x ?? random(width * 0.1, width * 0.9);
        y = y ?? random(height * 0.1, height * 0.9);
      }

      color = color ?? random(fireworkColors);
      const particleCount = isMobile() ? random(50, 70) : random(80, 100);

      const firework = new Firework({
        particleOptions,
        particleCount,
        x: x / (window.devicePixelRatio || 1),
        y: y / (window.devicePixelRatio || 1),
        color,
      });
      this.fireworks.push(firework);
    }

    // 焰火燃尽
    checkFireworks() {
      this.fireworks = this.fireworks.filter(
        (firework) => !firework.isBurnOff()
      );
    }

    // 检查是否需要创建焰火
    loop() {
      let interval = this.fireworkInterval * random(0.5, 1.5);
      this._timer = setTimeout(() => {
        this.checkFireworks();

        if (this.fireworks.length < this.fireworkCount) {
          this.createFirework();
        }

        this.loop();
      }, interval);
    }

    // 绘制焰火
    render(animationFunction, interval) {
      this._animater = animationFunction(() => {
        const { width, height } = this.ctx.canvas;

        // 通过绘制黑色透明图层，达到尾焰的效果
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        this.ctx.fillRect(0, 0, width, height);

        this.offScreenCtx.clearRect(0, 0, width, height);

        this.fireworks.forEach((firework) => {
          firework.render(this.offScreenCtx);
        });

        this.ctx.save();
        this.ctx.globalCompositeOperation = "lighter";
        this.ctx.drawImage(this.offScreenCtx.canvas, 0, 0, width, height);
        this.ctx.restore();

        this.render(animationFunction, interval);
      }, interval);
    }

    // 开始
    start() {
      this.loop();
      const animationFunction = this.useAnimationFrame
        ? requestAnimationFrame
        : setTimeout;
      const interval = 16.67 * (60 / this.fps);
      this.render(animationFunction, interval);
    }

    // 暂停
    pause() {
      this._timer && clearTimeout(this._timer);
      this._animater &&
        (this.useAnimationFrame
          ? cancelAnimationFrame(this._animater)
          : clearTimeout(this._animater));

      this._timer = null;
      this._animater = null;
    }

    // 停止
    stop() {
      this.pause();
      this.fireworks.length = 0;
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  // 焰火类
  class Firework {
    _status = STATUS.INIT;

    x = 0;
    y = 0;

    color = "rgba(255, 255, 255, 1)";
    particleCount = 80;
    particles = [];
    particleOptions = {};

    constructor(options = {}) {
      Object.keys(options).forEach((key) => (this[key] = options[key]));
      this._status = STATUS.INIT;

      this.initParticles();
    }

    // 初始化粒子
    initParticles() {
      const { x, y, color, particleOptions } = this;
      const { size: baseSize } = particleOptions;

      for (let index = 0; index < this.particleCount; index++) {
        const size = random(-baseSize / 2, baseSize / 2) + baseSize;
        const particle = new Particle({
          ...particleOptions,
          x,
          y,
          size,
          color,
        });
        this.particles.push(particle);
      }
    }

    // 更新粒子
    updateParticles() {
      this.particles.forEach((particle) => particle.update());

      this.particles = this.particles.filter(
        (particle) => !particle.isBurnOff()
      );

      // 粒子都燃尽了，自己也就结束了
      if (this.particles.length === 0) {
        this._status = STATUS.COMPLETED;
      }
    }

    // 渲染粒子
    render(ctx) {
      this.updateParticles();
      if (this.isBurnOff()) return;

      this.particles.forEach((particle) => {
        particle.render(ctx);
      });
    }

    isBurnOff() {
      return this._status === STATUS.COMPLETED;
    }
  }

  // 焰火粒子类
  class Particle {
    size = 10;
    speed = 15;
    gravity = 0.2;
    power = 0.92;
    shrink = 0.93;
    jitter = 0.08;
    color = "hsla(210, 100%, 50%, 1)";
    shadowColor = "hsla(210, 100%, 50%, 0.1)";

    x = 0;
    y = 0;

    vel = {
      x: 0,
      y: 0,
    };

    constructor(options) {
      Object.keys(options).forEach((key) => (this[key] = options[key]));
      const angle = random(0, Math.PI * 2);
      const speed = Math.cos(random(0, Math.PI / 2)) * this.speed;
      this.vel = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };
      this.shadowColor = tinycolor(this.color).setAlpha(0.1);
    }

    // 更新位置
    update() {
      this.vel.x *= this.power;
      this.vel.y *= this.power;

      this.vel.y += this.gravity;

      const jitter = random(-1, 1) * this.jitter;
      this.x += this.vel.x + jitter;
      this.y += this.vel.y + jitter;

      this.size *= this.shrink;
    }

    // 绘制单粒子
    render(ctx) {
      if (this.isBurnOff()) return;

      ctx.save();

      const { x, y, size, color, shadowColor } = this;

      // 移动端简化渐变效果
      if (isMobile()) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
        gradient.addColorStop(0.1, "rgba(255, 255, 255, 0.3)");
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, shadowColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, size, size);
      }

      ctx.restore();
    }

    // 粒子消失判断
    isBurnOff() {
      return this.size < (isMobile() ? 0.5 : 1);
    }
  }

  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      const dom = document.querySelector('#fireworks');

      if (!dom) {
        console.error('Fireworks canvas not found');
        return;
      }

      // 移动端参数调整
      const options = {
        fps: isMobile() ? 30 : 45,
        useAnimationFrame: false,
        fireworkCount: isMobile() ? 6 : 8,
        particleOptions: {
          size: isMobile() ? 10 : 15,
          speed: isMobile() ? 12 : 15,
          particleCount: isMobile() ? 60 : 100,
          gravity: isMobile() ? 0.1 : 0.08,
        }
      };

      const fireworks = new Fireworks(dom, options);
      fireworks.start();

      // 点击事件
      dom.addEventListener('click', (event) => {
        const rect = dom.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        fireworks.createFirework(x, y);
      });

      // 触摸事件支持
      dom.addEventListener('touchstart', (event) => {
        if (event.touches.length > 0) {
          event.preventDefault();
          const touch = event.touches[0];
          const rect = dom.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          // 移动端点击时创建多个烟花
          for (let i = 0; i < 2; i++) {
            setTimeout(() => {
              fireworks.createFirework(
                x + random(-20, 20),
                y + random(-20, 20)
              );
            }, i * 100);
          }
        }
      }, { passive: false });

      // 保存烟花实例到全局
      window.fireworksInstance = fireworks;

    }, 1000); // 延迟启动，确保页面完全加载
  });
})();