// ProfileCard Component - Vanilla JavaScript Implementation
class ProfileCard {
  constructor(options = {}) {
    this.options = {
      name: options.name || 'Brand Name',
      title: options.title || 'Brand Description',
      handle: options.handle || 'brand',
      status: options.status || 'Available',
      contactText: options.contactText || 'Learn More',
      avatarUrl: options.avatarUrl || '',
      iconUrl: options.iconUrl || '',
      grainUrl: options.grainUrl || '',
      behindGradient: options.behindGradient,
      innerGradient: options.innerGradient,
      showBehindGradient: options.showBehindGradient !== false,
      showUserInfo: options.showUserInfo !== false,
      enableTilt: options.enableTilt !== false,
      enableMobileTilt: options.enableMobileTilt || false,
      mobileTiltSensitivity: options.mobileTiltSensitivity || 5,
      className: options.className || '',
      onContactClick: options.onContactClick || (() => {})
    };

    this.wrapRef = null;
    this.cardRef = null;
    this.rafId = null;
    this.isActive = false;

    this.init();
  }

  init() {
    this.createCard();
    this.setupEventListeners();
    this.setInitialTransform();
  }

  createCard() {
    const wrapper = document.createElement('div');
    wrapper.className = `pc-card-wrapper ${this.options.className}`.trim();
    
    // Simple test version first
    wrapper.innerHTML = `
      <div style="text-align: center; color: white; font-weight: bold;">
        <h3 style="font-size: 24px; margin: 0 0 10px 0;">${this.options.name}</h3>
        <p style="font-size: 14px; margin: 0; opacity: 0.8;">${this.options.title}</p>
        <button style="margin-top: 15px; padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: white; cursor: pointer;">
          ${this.options.contactText}
        </button>
      </div>
    `;

    this.wrapRef = wrapper;
    this.cardRef = wrapper;
    
    // Contact button event
    const contactBtn = wrapper.querySelector('button');
    if (contactBtn) {
      contactBtn.addEventListener('click', this.options.onContactClick);
    }
  }

  getDefaultBehindGradient() {
    return 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)';
  }

  getDefaultInnerGradient() {
    return 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';
  }

  setupEventListeners() {
    // Simplified for testing
    if (this.cardRef) {
      this.cardRef.addEventListener('mouseenter', () => {
        this.cardRef.style.transform = 'scale(1.05)';
        this.cardRef.style.transition = 'transform 0.3s ease';
      });
      
      this.cardRef.addEventListener('mouseleave', () => {
        this.cardRef.style.transform = 'scale(1)';
      });
    }
  }

  handlePointerEnter() {
    this.isActive = true;
    this.wrapRef.classList.add('active');
    this.cardRef.classList.add('active');
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  handlePointerMove(event) {
    if (!this.isActive) return;
    
    const rect = this.cardRef.getBoundingClientRect();
    this.updateCardTransform(event.clientX - rect.left, event.clientY - rect.top);
  }

  handlePointerLeave(event) {
    this.isActive = false;
    this.wrapRef.classList.remove('active');
    this.cardRef.classList.remove('active');
    this.createSmoothAnimation(600, event.offsetX, event.offsetY);
  }

  handleDeviceOrientationClick() {
    if (this.options.enableMobileTilt && location.protocol === 'https:') {
      if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
        window.DeviceMotionEvent.requestPermission()
          .then(state => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
            }
          })
          .catch(err => console.error(err));
      } else {
        window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
      }
    }
  }

  handleDeviceOrientation(event) {
    const { beta, gamma } = event;
    if (!beta || !gamma) return;

    this.updateCardTransform(
      this.cardRef.clientHeight / 2 + gamma * this.options.mobileTiltSensitivity,
      this.cardRef.clientWidth / 2 + (beta - 20) * this.options.mobileTiltSensitivity
    );
  }

  updateCardTransform(offsetX, offsetY) {
    const width = this.cardRef.clientWidth;
    const height = this.cardRef.clientHeight;

    const percentX = this.clamp((100 / width) * offsetX);
    const percentY = this.clamp((100 / height) * offsetY);

    const centerX = percentX - 50;
    const centerY = percentY - 50;

    const properties = {
      '--pointer-x': `${percentX}%`,
      '--pointer-y': `${percentY}%`,
      '--background-x': `${this.adjust(percentX, 0, 100, 35, 65)}%`,
      '--background-y': `${this.adjust(percentY, 0, 100, 35, 65)}%`,
      '--pointer-from-center': `${this.clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
      '--pointer-from-top': `${percentY / 100}`,
      '--pointer-from-left': `${percentX / 100}`,
      '--rotate-x': `${this.round(-(centerX / 5))}deg`,
      '--rotate-y': `${this.round(centerY / 4)}deg`
    };

    Object.entries(properties).forEach(([property, value]) => {
      this.wrapRef.style.setProperty(property, value);
    });
  }

  createSmoothAnimation(duration, startX, startY) {
    const startTime = performance.now();
    const targetX = this.wrapRef.clientWidth / 2;
    const targetY = this.wrapRef.clientHeight / 2;

    const animationLoop = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = this.clamp(elapsed / duration);
      const easedProgress = this.easeInOutCubic(progress);

      const currentX = this.adjust(easedProgress, 0, 1, startX, targetX);
      const currentY = this.adjust(easedProgress, 0, 1, startY, targetY);

      this.updateCardTransform(currentX, currentY);

      if (progress < 1) {
        this.rafId = requestAnimationFrame(animationLoop);
      }
    };

    this.rafId = requestAnimationFrame(animationLoop);
  }

  setInitialTransform() {
    // Simplified for testing - no complex transforms
    console.log('ProfileCard initialized for:', this.options.name);
  }

  clamp(value, min = 0, max = 100) {
    return Math.min(Math.max(value, min), max);
  }

  round(value, precision = 3) {
    return parseFloat(value.toFixed(precision));
  }

  adjust(value, fromMin, fromMax, toMin, toMax) {
    return this.round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
    if (this.wrapRef && this.wrapRef.parentNode) {
      this.wrapRef.parentNode.removeChild(this.wrapRef);
    }
  }

  getElement() {
    return this.wrapRef;
  }
}

// Export for use
window.ProfileCard = ProfileCard;
