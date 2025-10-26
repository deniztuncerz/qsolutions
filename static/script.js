/**
 * Q Solutions - Advanced Technical Services JavaScript
 * Smart form logic and API integration
 */

// Device-Brand mapping for smart form
const deviceData = {
    "Inverter": ["Solax", "Deye", "Tommatech", "SMA", "Fronius", "Huawei"],
    "HV Battery": ["BYD", "Pylontech", "Tesla", "LG Chem", "CATL"],
    "LV Battery": ["Pylontech", "BYD", "Tesla", "LG Chem", "CATL", "SimpliPhi"]
};

// API Base URL
const API_BASE_URL = window.location.origin;

// DOM Elements
const deviceTypeSelect = document.getElementById('device_type');
const brandSelect = document.getElementById('brand');
const modelInput = document.getElementById('model');
const quoteForm = document.getElementById('quote-form');
const trackingForm = document.getElementById('tracking-form');
const statusResult = document.getElementById('status-result');
const quoteStatusResult = document.getElementById('quote-status-result');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// ScrollFloat Animation Function
function initScrollFloat(element, options = {}) {
    const {
        animationDuration = 1,
        ease = 'back.inOut(2)',
        scrollStart = 'center bottom+=50%',
        scrollEnd = 'bottom bottom-=40%',
        stagger = 0.03
    } = options;

    if (!element) return;

    // Split text into characters
    const text = element.textContent;
    const chars = text.split('').map((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        return span;
    });

    // Clear original text and add character spans
    element.innerHTML = '';
    const textContainer = document.createElement('span');
    textContainer.className = 'scroll-float-text';
    chars.forEach(char => textContainer.appendChild(char));
    element.appendChild(textContainer);

    // Add scroll-float class if not present
    if (!element.classList.contains('scroll-float')) {
        element.classList.add('scroll-float');
    }

    // Initialize GSAP animation
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
        chars,
        {
            willChange: 'opacity, transform',
            opacity: 0,
            yPercent: 120,
            scaleY: 2.3,
            scaleX: 0.7,
            transformOrigin: '50% 0%'
        },
        {
            duration: animationDuration,
            ease: ease,
            opacity: 1,
            yPercent: 0,
            scaleY: 1,
            scaleX: 1,
            stagger: stagger,
            scrollTrigger: {
                trigger: element,
                start: scrollStart,
                end: scrollEnd,
                scrub: true
            }
        }
    );
}

// RotatingText Animation
function initRotatingText() {
    const rotatingTextElement = document.getElementById('rotating-text');
    if (!rotatingTextElement) {
        console.log('RotatingText element not found');
        return;
    }

    const texts = currentLanguage === 'tr' 
        ? ['Çözüm', 'Hizmet', 'Teknik', 'Enerji', 'Destek']
        : ['Solutions', 'Service', 'Technic', 'Energy', 'Support'];
    let currentIndex = 0;
    
    // Store texts globally for language switching
    window.rotatingTextWords = texts;

    function animateText() {
        const currentText = texts[currentIndex];
        console.log('Animating text:', currentText);
        
        // Fade out
        rotatingTextElement.style.opacity = '0';
        rotatingTextElement.style.transform = 'translateY(30px)';
        
        // Wait for fade out, then change text and fade in
        setTimeout(() => {
            rotatingTextElement.textContent = currentText;
            
            // Force reflow
            rotatingTextElement.offsetHeight;
            
            // Fade in with animation
            rotatingTextElement.style.opacity = '1';
            rotatingTextElement.style.transform = 'translateY(0)';
            
            console.log('Text updated to:', currentText);
        }, 300);
        
        // Move to next text
        currentIndex = (currentIndex + 1) % texts.length;
    }

    // Start animation
    animateText();
    
    // Set interval for continuous rotation
    setInterval(animateText, 2000);
}

// Initialize ScrollFloat animations
function initScrollAnimations() {
    // Hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        initScrollFloat(heroTitle, {
            animationDuration: 1.2,
            ease: 'back.out(1.7)',
            scrollStart: 'top bottom-=20%',
            scrollEnd: 'center center',
            stagger: 0.05
        });
    }

    // Section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('scroll-float-section');
        initScrollFloat(title, {
            animationDuration: 1,
            ease: 'back.out(1.7)',
            scrollStart: 'center bottom+=30%',
            scrollEnd: 'bottom bottom-=30%',
            stagger: 0.07
        });
    });

    // Service cards
    const serviceCards = document.querySelectorAll('.service-card h3');
    serviceCards.forEach((card, index) => {
        card.classList.add('scroll-float-small');
        initScrollFloat(card, {
            animationDuration: 0.8,
            ease: 'back.out(1.7)',
            scrollStart: 'center bottom+=20%',
            scrollEnd: 'bottom bottom-=20%',
            stagger: 0.07
        });
    });

    // Brand cards
    const brandCards = document.querySelectorAll('.brand-card .brand-logo');
    brandCards.forEach((brand, index) => {
        brand.classList.add('scroll-float-medium');
        initScrollFloat(brand, {
            animationDuration: 0.6,
            ease: 'back.out(1.7)',
            scrollStart: 'center bottom+=10%',
            scrollEnd: 'bottom bottom-=10%',
            stagger: 0.07
        });
    });
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Language Support
let currentLanguage = localStorage.getItem('language') || 'tr';

// Language data
const translations = {
    tr: {
        'Solutions': 'Çözüm',
        'Service': 'Hizmet',
        'Technic': 'Teknik',
        'Energy': 'Enerji',
        'Support': 'Destek'
    },
    en: {
        'Solutions': 'Solutions',
        'Service': 'Service',
        'Technic': 'Technic',
        'Energy': 'Energy',
        'Support': 'Support'
    }
};

// Initialize language
function initLanguage() {
    // Set initial language
    setLanguage(currentLanguage);
    
    // Add event listeners for toggle switch
    const toggleTrack = document.querySelector('.toggle-track');
    const toggleThumb = document.getElementById('toggle-thumb');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    
    if (toggleTrack && toggleThumb) {
        toggleTrack.addEventListener('click', function() {
            const newLang = currentLanguage === 'tr' ? 'en' : 'tr';
            setLanguage(newLang);
        });
        
        // Label clicks
        toggleLabels.forEach(label => {
            label.addEventListener('click', function(e) {
                e.stopPropagation();
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    }
}

// Set language
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update toggle switch
    const toggleThumb = document.getElementById('toggle-thumb');
    const toggleFlag = toggleThumb.querySelector('.toggle-flag');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    
    if (lang === 'tr') {
        toggleThumb.classList.remove('en');
        toggleFlag.textContent = '🇹🇷';
        toggleLabels[0].classList.add('active');
        toggleLabels[1].classList.remove('active');
    } else {
        toggleThumb.classList.add('en');
        toggleFlag.textContent = '🇺🇸';
        toggleLabels[0].classList.remove('active');
        toggleLabels[1].classList.add('active');
    }
    
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-en][data-tr]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update rotating text
    updateRotatingText();
    
    // Update ScrollStack cards based on language
    updateScrollStackCards();
}

// Update rotating text based on language
function updateRotatingText() {
    const rotatingTextElement = document.getElementById('rotating-text');
    if (rotatingTextElement) {
        const words = currentLanguage === 'tr' 
            ? ['Çözüm', 'Hizmet', 'Teknik', 'Enerji', 'Destek']
            : ['Solutions', 'Service', 'Technic', 'Energy', 'Support'];
        
        // Update the rotating text words
        if (window.rotatingTextWords) {
            window.rotatingTextWords = words;
        }
    }
}

// Update ScrollStack cards based on language
function updateScrollStackCards() {
    const cards = document.querySelectorAll('.scroll-stack-card');
    cards.forEach(card => {
        const title = card.querySelector('h2');
        const description = card.querySelector('p');
        
        if (title) {
            const enText = title.getAttribute('data-en');
            const trText = title.getAttribute('data-tr');
            if (enText && trText) {
                title.textContent = currentLanguage === 'tr' ? trText : enText;
            }
        }
        
        if (description) {
            const enText = description.getAttribute('data-en');
            const trText = description.getAttribute('data-tr');
            if (enText && trText) {
                description.textContent = currentLanguage === 'tr' ? trText : enText;
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeSmartForm();
        initializeEventListeners();
        initializeNavigation();
        initializeSmoothScrolling();
        initLanguage();
        initRotatingText();
        initScrollAnimations();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

/**
 * Initialize smart form with cascading selects
 */
function initializeSmartForm() {
    if (deviceTypeSelect) {
        deviceTypeSelect.addEventListener('change', handleDeviceTypeChange);
    }
}

/**
 * Handle device type selection change
 */
function handleDeviceTypeChange() {
    const selectedDeviceType = deviceTypeSelect.value;
    
    // Clear and disable brand select
    brandSelect.innerHTML = '<option value="">Select brand...</option>';
    brandSelect.disabled = true;
    
    // Clear and disable model input
    modelInput.value = '';
    modelInput.disabled = true;
    
    if (selectedDeviceType && deviceData[selectedDeviceType]) {
        // Populate brand options
        deviceData[selectedDeviceType].forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
        
        // Enable brand select
        brandSelect.disabled = false;
        
        // Add change listener to brand select
        brandSelect.addEventListener('change', handleBrandChange);
    }
}

/**
 * Handle brand selection change
 */
function handleBrandChange() {
    const selectedBrand = brandSelect.value;
    
    if (selectedBrand) {
        modelInput.disabled = false;
        modelInput.placeholder = `Enter ${selectedBrand} model...`;
    } else {
        modelInput.disabled = true;
        modelInput.value = '';
        modelInput.placeholder = 'Select brand first';
    }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Quote form submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmission);
    }
    
    // Tracking form submission
    if (trackingForm) {
        trackingForm.addEventListener('submit', handleTrackingSubmission);
    }
}

/**
 * Handle quote form submission
 */
async function handleQuoteSubmission(event) {
    event.preventDefault();
    
    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.innerHTML = '<span class="shiny-text disabled">Submitting...</span>';
        submitButton.disabled = true;
        quoteForm.classList.add('loading');
        
        // Gather form data
        const formData = new FormData(quoteForm);
        const quoteData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            device_type: formData.get('device_type'),
            brand: formData.get('brand'),
            model: formData.get('model'),
            issue_description: formData.get('issue_description')
        };
        
        // Validate required fields
        if (!validateQuoteData(quoteData)) {
            throw new Error('Please fill in all required fields');
        }
        
        // Submit to API
        const response = await fetch(`${API_BASE_URL}/api/v1/submit_quote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quoteData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit quote');
        }
        
        const result = await response.json();
        
        // Show success message with more details
        showQuoteSuccessMessage(`
            <div style="text-align: center;">
                <h3 style="margin-bottom: 1rem; color: #065f46;">🎉 Request Submitted Successfully!</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Your Tracking Code:</strong> <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace;">${result.tracking_code}</span></p>
                <p style="margin-bottom: 0.5rem;">📧 A confirmation email has been sent to your email address.</p>
                <p style="margin-bottom: 0;">🔍 You can track your repair status using the tracking code above.</p>
            </div>
        `);
        
        // Reset form
        quoteForm.reset();
        brandSelect.disabled = true;
        modelInput.disabled = true;
        
    } catch (error) {
        console.error('Quote submission error:', error);
        showQuoteErrorMessage(error.message || 'Failed to submit quote. Please try again.');
    } finally {
        // Reset button state
        submitButton.innerHTML = `<span class="shiny-text">${originalText}</span>`;
        submitButton.disabled = false;
        quoteForm.classList.remove('loading');
    }
}

/**
 * Handle tracking form submission
 */
async function handleTrackingSubmission(event) {
    event.preventDefault();
    
    const trackingCodeInput = document.getElementById('tracking_code');
    const trackingCode = trackingCodeInput.value.trim();
    
    if (!trackingCode) {
        showErrorMessage('Please enter a tracking code');
        return;
    }
    
    try {
        // Show loading state
        statusResult.style.display = 'block';
        statusResult.className = 'status-result';
        statusResult.innerHTML = '<div class="loading">Checking status...</div>';
        
        // Fetch status from API
        const response = await fetch(`${API_BASE_URL}/api/v1/track/${encodeURIComponent(trackingCode)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Tracking code not found');
            }
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to retrieve status');
        }
        
        const statusData = await response.json();
        
        // Display status
        displayStatusResult(statusData);
        
    } catch (error) {
        console.error('Tracking error:', error);
        showErrorMessage(error.message || 'Failed to retrieve status. Please try again.');
    }
}

/**
 * Display status result
 */
function displayStatusResult(statusData) {
    const lastUpdated = new Date(statusData.last_updated_at).toLocaleString();
    
    statusResult.className = 'status-result success';
    statusResult.innerHTML = `
        <div class="status-info">
            <h3>Repair Status</h3>
            <p><strong>Tracking Code:</strong> ${statusData.tracking_code}</p>
            <p><strong>Current Status:</strong> ${statusData.current_status}</p>
            <p><strong>Last Updated:</strong> ${lastUpdated}</p>
        </div>
    `;
    statusResult.style.display = 'block';
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    statusResult.className = 'status-result success';
    statusResult.innerHTML = `<div class="success-message">${message}</div>`;
    statusResult.style.display = 'block';
    
    // Scroll to status result
    statusResult.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show success message for quote form
 */
function showQuoteSuccessMessage(message) {
    quoteStatusResult.className = 'status-result success';
    quoteStatusResult.innerHTML = `<div class="success-message">${message}</div>`;
    quoteStatusResult.style.display = 'block';
    
    // Scroll to quote status result
    quoteStatusResult.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    statusResult.className = 'status-result error';
    statusResult.innerHTML = `<div class="error-message">${message}</div>`;
    statusResult.style.display = 'block';
    
    // Scroll to status result
    statusResult.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show error message for quote form
 */
function showQuoteErrorMessage(message) {
    quoteStatusResult.className = 'status-result error';
    quoteStatusResult.innerHTML = `<div class="error-message">${message}</div>`;
    quoteStatusResult.style.display = 'block';
    
    // Scroll to quote status result
    quoteStatusResult.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Validate quote data
 */
function validateQuoteData(data) {
    const requiredFields = ['full_name', 'email', 'phone', 'city', 'device_type', 'brand', 'model', 'issue_description'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return false;
        }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return false;
    }
    
    return true;
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

/**
 * Initialize smooth scrolling for navigation links
 */
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Utility function to format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Add scroll effect to navbar
 */
window.addEventListener('scroll', debounce(function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 10));

/**
 * Add fade-in animation to sections on scroll
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

/**
 * Handle form validation with real-time feedback
 */
function addRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const isValid = value !== '';
    
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
    }
    
    return isValid;
}

// Initialize real-time validation
document.addEventListener('DOMContentLoaded', addRealTimeValidation);

/**
 * Add loading states to buttons
 */
function addLoadingState(button, text = 'Loading...') {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = text;
}

function removeLoadingState(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
}

// Initialize ShinyText animation
function initShinyText() {
    // Prevent multiple initializations
    if (window.shinyTextInitialized) {
        return;
    }
    window.shinyTextInitialized = true;
    
    console.log('Initializing ShinyText...');
    
    // Add shiny text animation to buttons (only once)
    const shinyButtons = document.querySelectorAll('.btn-shiny:not([data-shiny-initialized])');
    shinyButtons.forEach(button => {
        if (!button.querySelector('.shiny-text')) {
            const text = button.textContent;
            button.innerHTML = `<span class="shiny-text">${text}</span>`;
            button.dataset.shinyInitialized = 'true';
        }
    });
    
    // Add CSS animation (only if not already added)
    if (!document.querySelector('#shiny-text-styles')) {
        const style = document.createElement('style');
        style.id = 'shiny-text-styles';
        style.textContent = `
            .shiny-text {
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
                background-size: 400% 400%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shinyMove 3s ease-in-out infinite;
            }
            
            @keyframes shinyMove {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize ScrollFloat animation
function initScrollFloat() {
    // Prevent multiple initializations
    if (window.scrollFloatInitialized) {
        return;
    }
    window.scrollFloatInitialized = true;
    
    console.log('Initializing ScrollFloat...');
    
    // Add scroll float animation to elements (only once)
    const floatElements = document.querySelectorAll('.scroll-float:not(.scroll-float-text)');
    floatElements.forEach(element => {
        element.classList.add('scroll-float-text');
    });
    
    // Add CSS animation (only if not already added)
    if (!document.querySelector('#scroll-float-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-float-styles';
        style.textContent = `
            .scroll-float-text {
                animation: floatUp 2s ease-in-out infinite;
            }
            
            @keyframes floatUp {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize RotatingText animation
function initRotatingText() {
    // Prevent multiple initializations
    if (window.rotatingTextInitialized) {
        return;
    }
    window.rotatingTextInitialized = true;
    
    console.log('Initializing RotatingText...');
    
    const rotatingText = document.querySelector('.rotating-text');
    if (!rotatingText) return;
    
    const texts = ['Service', 'Technic', 'Energy', 'Support', 'Solutions'];
    let currentIndex = 0;
    
    function updateText() {
        const currentText = texts[currentIndex];
        console.log('Animating text:', currentText);
        
        rotatingText.style.opacity = '0';
        rotatingText.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            rotatingText.textContent = currentText;
            rotatingText.style.opacity = '1';
            rotatingText.style.transform = 'translateY(0)';
            console.log('Text updated to:', currentText);
        }, 300);
        
        currentIndex = (currentIndex + 1) % texts.length;
    }
    
    // Start rotation
    updateText();
    setInterval(updateText, 2000);
}

// Initialize ScrollStack
function initScrollStack() {
    // Prevent multiple initializations
    if (window.scrollStackInitialized) {
        return;
    }
    window.scrollStackInitialized = true;
    
    console.log('Initializing ScrollStack...');
    // ScrollStack is handled by external library
}

// Initialize PillNav
function initPillNav() {
    // Prevent multiple initializations
    if (window.pillNavInitialized) {
        return;
    }
    window.pillNavInitialized = true;
    
    console.log('Initializing PillNav...');
    // PillNav is handled by external library
}

// Initialize RippleGrid backgrounds
function initRippleGrid() {
    // Disabled - user requested to remove background effects
    console.log('RippleGrid disabled - background effects removed');
    return;
}

// ProfileCards removed

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initLanguage();
    initShinyText();
    initScrollFloat();
    initRotatingText();
    initScrollStack();
    initPillNav();
    // initRippleGrid(); // Disabled - background effects removed
    initSpotlightCards();
    initSectionToggle();
});

// Handle section visibility for FAQ
function initSectionToggle() {
    // Hide FAQ section by default
    const faqSection = document.querySelector('#faq');
    if (faqSection) {
        faqSection.style.display = 'none';
    }
}

// Initialize SpotlightCards
function initSpotlightCards() {
    if (window.spotlightCardsInitialized) { return; }
    window.spotlightCardsInitialized = true;
    console.log('Initializing SpotlightCards...');
    
    const serviceCards = document.querySelectorAll('.service-card');
    console.log('Found service cards:', serviceCards.length);
    
    serviceCards.forEach((card, index) => {
        console.log(`Setting up spotlight for card ${index + 1}`);
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            console.log(`Mouse position: ${x}px, ${y}px`);
        });
        
        // Test spotlight effect on mouse enter
        card.addEventListener('mouseenter', () => {
            console.log('Mouse entered card');
        });
    });
}

// Export functions for potential external use
window.QSolutions = {
    handleQuoteSubmission,
    handleTrackingSubmission,
    showSuccessMessage,
    showErrorMessage,
    formatDate
};

