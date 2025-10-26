// ScrollStack Effect - Vanilla JavaScript Implementation
class ScrollStack {
  constructor(options = {}) {
    this.options = {
      itemDistance: 100,
      itemScale: 0.03,
      itemStackDistance: 30,
      stackPosition: '20%',
      scaleEndPosition: '10%',
      baseScale: 0.85,
      scaleDuration: 0.5,
      rotationAmount: 0,
      blurAmount: 0,
      useWindowScroll: true,
      onStackComplete: null,
      ...options
    };

    this.cards = [];
    this.lastTransforms = new Map();
    this.isUpdating = false;
    this.stackCompleted = false;
    this.animationFrame = null;
    this.lenis = null;

    this.init();
  }

  init() {
    this.cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
    this.setupCards();
    this.setupLenis();
    this.updateCardTransforms();
    this.bindEvents();
  }

  setupCards() {
    this.cards.forEach((card, i) => {
      if (i < this.cards.length - 1) {
        card.style.marginBottom = `${this.options.itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
    });
  }

  setupLenis() {
    if (typeof Lenis !== 'undefined') {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075
      });

      this.lenis.on('scroll', () => this.updateCardTransforms());

      const raf = time => {
        this.lenis.raf(time);
        this.animationFrame = requestAnimationFrame(raf);
      };
      this.animationFrame = requestAnimationFrame(raf);
    }
  }

  calculateProgress(scrollTop, start, end) {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }

  parsePercentage(value, containerHeight) {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }

  getScrollData() {
    return {
      scrollTop: window.scrollY,
      containerHeight: window.innerHeight,
      scrollContainer: document.documentElement
    };
  }

  getElementOffset(element) {
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  }

  updateCardTransforms() {
    if (!this.cards.length || this.isUpdating) return;

    this.isUpdating = true;

    const { scrollTop, containerHeight } = this.getScrollData();
    const stackPositionPx = this.parsePercentage(this.options.stackPosition, containerHeight);
    const scaleEndPositionPx = this.parsePercentage(this.options.scaleEndPosition, containerHeight);

    const endElement = document.querySelector('.scroll-stack-end');
    const endElementTop = endElement ? this.getElementOffset(endElement) : 0;

    this.cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = this.getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - this.options.itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - this.options.itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = this.calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = this.options.baseScale + i * this.options.itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = this.options.rotationAmount ? i * this.options.rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (this.options.blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < this.cards.length; j++) {
          const jCardTop = this.getElementOffset(this.cards[j]);
          const jTriggerStart = jCardTop - stackPositionPx - this.options.itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * this.options.blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + this.options.itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + this.options.itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100
      };

      const lastTransform = this.lastTransforms.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        card.style.filter = filter;

        this.lastTransforms.set(i, newTransform);
      }

      if (i === this.cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !this.stackCompleted) {
          this.stackCompleted = true;
          this.options.onStackComplete?.();
        } else if (!isInView && this.stackCompleted) {
          this.stackCompleted = false;
        }
      }
    });

    this.isUpdating = false;
  }

  bindEvents() {
    window.addEventListener('scroll', () => this.updateCardTransforms());
    window.addEventListener('resize', () => this.updateCardTransforms());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.lenis) {
      this.lenis.destroy();
    }
    this.stackCompleted = false;
    this.cards = [];
    this.lastTransforms.clear();
    this.isUpdating = false;
  }
}

// Initialize ScrollStack when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if Lenis is available, if not load it
  if (typeof Lenis === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js';
    script.onload = () => {
      new ScrollStack({
        itemDistance: 100,
        itemScale: 0.03,
        itemStackDistance: 30,
        stackPosition: '20%',
        scaleEndPosition: '10%',
        baseScale: 0.85,
        rotationAmount: 0,
        blurAmount: 0,
        onStackComplete: () => {
          console.log('Scroll stack completed!');
        }
      });
    };
    document.head.appendChild(script);
  } else {
    new ScrollStack({
      itemDistance: 100,
      itemScale: 0.03,
      itemStackDistance: 30,
      stackPosition: '20%',
      scaleEndPosition: '10%',
      baseScale: 0.85,
      rotationAmount: 0,
      blurAmount: 0,
      onStackComplete: () => {
        console.log('Scroll stack completed!');
      }
    });
  }
});
