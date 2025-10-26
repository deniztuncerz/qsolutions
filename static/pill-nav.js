// PillNav - Vanilla JavaScript Implementation
class PillNav {
  constructor(options = {}) {
    this.options = {
      logo: '/static/logo.png',
      logoAlt: 'Q Solutions Logo',
      items: [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Get Quote', href: '#quote' }
      ],
      activeHref: '#home',
      className: '',
      ease: 'power3.easeOut',
      baseColor: '#005691',
      pillColor: '#ffffff',
      hoveredPillTextColor: '#005691',
      pillTextColor: '#005691',
      onMobileMenuClick: null,
      initialLoadAnimation: true,
      ...options
    };

    this.isMobileMenuOpen = false;
    this.circleRefs = [];
    this.tlRefs = [];
    this.activeTweenRefs = [];
    this.logoImgRef = null;
    this.logoTweenRef = null;
    this.hamburgerRef = null;
    this.mobileMenuRef = null;
    this.navItemsRef = null;
    this.logoRef = null;

    this.init();
  }

  init() {
    this.createHTML();
    this.bindEvents();
    this.layout();
    this.animateOnLoad();
  }

  createHTML() {
    const container = document.createElement('div');
    container.className = 'pill-nav-container';
    container.innerHTML = `
      <nav class="pill-nav ${this.options.className}" aria-label="Primary" style="
        --base: ${this.options.baseColor};
        --pill-bg: ${this.options.pillColor};
        --hover-text: ${this.options.hoveredPillTextColor};
        --pill-text: ${this.options.pillTextColor};
      ">
        <a class="pill-logo" href="${this.options.items[0].href}" aria-label="Home">
          <div class="logo-text">Q</div>
        </a>

        <div class="pill-nav-items desktop-only">
          <ul class="pill-list" role="menubar">
            ${this.options.items.map((item, i) => `
              <li key="${item.href || `item-${i}`}" role="none">
                <a
                  role="menuitem"
                  href="${item.href}"
                  class="pill${this.options.activeHref === item.href ? ' is-active' : ''}${item.label === 'Get Quote' ? ' quote-button' : ''}"
                  aria-label="${item.ariaLabel || item.label}"
                >
                  <span class="hover-circle" aria-hidden="true"></span>
                  <span class="label-stack">
                    <span class="pill-label">${item.label}</span>
                    <span class="pill-label-hover" aria-hidden="true">${item.label}</span>
                  </span>
                </a>
              </li>
            `).join('')}
          </ul>
        </div>

        <button class="mobile-menu-button mobile-only" aria-label="Toggle menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </nav>

      <div class="mobile-menu-popover mobile-only">
        <ul class="mobile-menu-list">
          ${this.options.items.map((item, i) => `
            <li key="${item.href || `mobile-item-${i}`}">
              <a
                href="${item.href}"
                class="mobile-menu-link${this.options.activeHref === item.href ? ' is-active' : ''}"
              >
                ${item.label}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    // Replace existing navbar
    const existingNav = document.querySelector('.navbar');
    if (existingNav) {
      existingNav.parentNode.insertBefore(container, existingNav);
      existingNav.remove();
    } else {
      document.body.insertBefore(container, document.body.firstChild);
    }

    // Store references
    this.logoRef = container.querySelector('.pill-logo');
    this.logoImgRef = container.querySelector('.pill-logo img');
    this.navItemsRef = container.querySelector('.pill-nav-items');
    this.hamburgerRef = container.querySelector('.mobile-menu-button');
    this.mobileMenuRef = container.querySelector('.mobile-menu-popover');
    this.circleRefs = Array.from(container.querySelectorAll('.hover-circle'));
  }

  bindEvents() {
    // Logo hover
    if (this.logoRef) {
      this.logoRef.addEventListener('mouseenter', () => this.handleLogoEnter());
    }

    // Pill hover events
    const pills = document.querySelectorAll('.pill');
    pills.forEach((pill, i) => {
      pill.addEventListener('mouseenter', () => this.handleEnter(i));
      pill.addEventListener('mouseleave', () => this.handleLeave(i));
    });

    // Mobile menu toggle
    if (this.hamburgerRef) {
      this.hamburgerRef.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Mobile menu links
    const mobileLinks = document.querySelectorAll('.mobile-menu-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.isMobileMenuOpen = false;
        this.toggleMobileMenu();
      });
    });

    // Window resize
    window.addEventListener('resize', () => this.layout());
  }

  layout() {
    this.circleRefs.forEach((circle, i) => {
      if (!circle?.parentElement) return;

      const pill = circle.parentElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      if (typeof gsap !== 'undefined') {
        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        this.tlRefs[i]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: this.options.ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease: this.options.ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease: this.options.ease, overwrite: 'auto' }, 0);
        }

        this.tlRefs[i] = tl;
      }
    });
  }

  handleEnter(i) {
    const tl = this.tlRefs[i];
    if (!tl || typeof gsap === 'undefined') return;
    this.activeTweenRefs[i]?.kill();
    this.activeTweenRefs[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease: this.options.ease,
      overwrite: 'auto'
    });
  }

  handleLeave(i) {
    const tl = this.tlRefs[i];
    if (!tl || typeof gsap === 'undefined') return;
    this.activeTweenRefs[i]?.kill();
    this.activeTweenRefs[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease: this.options.ease,
      overwrite: 'auto'
    });
  }

  handleLogoEnter() {
    const img = this.logoImgRef;
    if (!img || typeof gsap === 'undefined') return;
    this.logoTweenRef?.kill();
    gsap.set(img, { rotate: 0 });
    this.logoTweenRef = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease: this.options.ease,
      overwrite: 'auto'
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    const hamburger = this.hamburgerRef;
    const menu = this.mobileMenuRef;

    if (hamburger && typeof gsap !== 'undefined') {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (this.isMobileMenuOpen) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: this.options.ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: this.options.ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: this.options.ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: this.options.ease });
      }
    }

    if (menu && typeof gsap !== 'undefined') {
      if (this.isMobileMenuOpen) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease: this.options.ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease: this.options.ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    this.options.onMobileMenuClick?.();
  }

  animateOnLoad() {
    if (!this.options.initialLoadAnimation || typeof gsap === 'undefined') return;

    const logo = this.logoRef;
    const navItems = this.navItemsRef;

    if (logo) {
      gsap.set(logo, { scale: 0 });
      gsap.to(logo, {
        scale: 1,
        duration: 0.6,
        ease: this.options.ease
      });
    }

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden' });
      gsap.to(navItems, {
        width: 'auto',
        duration: 0.6,
        ease: this.options.ease
      });
    }
  }

  destroy() {
    this.tlRefs.forEach(tl => tl?.kill());
    this.activeTweenRefs.forEach(tween => tween?.kill());
    this.logoTweenRef?.kill();
    window.removeEventListener('resize', this.layout);
  }
}

// Initialize PillNav when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PillNav({
    logo: '/static/logo.png',
    logoAlt: 'Q Solutions Logo',
    items: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' }
    ],
    activeHref: '#home',
    baseColor: '#1dcdc4',
    pillColor: '#ffffff',
    hoveredPillTextColor: '#1dcdc4',
    pillTextColor: '#1dcdc4'
  });
});
