/**
 * Q Solutions - Advanced Technical Services JavaScript
 * Smart form logic and API integration
 */

// ============================================
// LANGUAGE SWITCHING FUNCTIONS
// ============================================

function toggleLanguageDropdown() {
    const switcher = document.getElementById('language-switcher');
    switcher.classList.toggle('active');
    
    // Close dropdown when clicking outside
    if (switcher.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('click', closeLanguageDropdown);
        }, 0);
    }
}

function closeLanguageDropdown(e) {
    const switcher = document.getElementById('language-switcher');
    if (switcher && !switcher.contains(e.target)) {
        switcher.classList.remove('active');
        document.removeEventListener('click', closeLanguageDropdown);
    }
}

function changeLanguage(lang) {
    if (window.i18n) {
        window.i18n.changeLanguage(lang);
    }
    // Close dropdown
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
        switcher.classList.remove('active');
    }
}

// Listen for language change events to update dynamic content
window.addEventListener('languageChanged', (e) => {
    console.log('Language changed to:', e.detail.language);
    // Update any dynamic content here if needed
});

// ============================================
// END LANGUAGE SWITCHING
// ============================================

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
    // Prevent multiple initializations
    if (window.rotatingTextInitialized) {
        return;
    }
    window.rotatingTextInitialized = true;
    
    const rotatingTextElement = document.getElementById('rotating-text');
    if (!rotatingTextElement) {
        console.log('RotatingText element not found');
        return;
    }

    // Get current language from i18n or default to 'tr'
    const getCurrentLanguage = () => window.i18n ? window.i18n.getCurrentLanguage() : 'tr';
    
    // Get texts based on language
    const getTexts = (lang) => {
        return lang === 'tr' 
            ? ['Çözüm', 'Hizmet', 'Teknik', 'Enerji', 'Destek']
            : ['Solutions', 'Service', 'Technical', 'Energy', 'Support'];
    };
    
    let texts = getTexts(getCurrentLanguage());
    let currentIndex = 0;
    let intervalId = null;

    function animateText() {
        const currentText = texts[currentIndex];
        
        // Fade out
        rotatingTextElement.style.opacity = '0';
        rotatingTextElement.style.transform = 'translateY(20px)';
        
        // Wait for fade out, then change text and fade in
        setTimeout(() => {
            rotatingTextElement.textContent = currentText;
            
            // Fade in with animation
            rotatingTextElement.style.opacity = '1';
            rotatingTextElement.style.transform = 'translateY(0)';
        }, 300);
        
        // Move to next text
        currentIndex = (currentIndex + 1) % texts.length;
    }

    // Start animation
    animateText();
    
    // Set interval for continuous rotation
    intervalId = setInterval(animateText, 2500);
    
    // Update texts when language changes
    window.addEventListener('languageChanged', () => {
        texts = getTexts(getCurrentLanguage());
        currentIndex = 0;
        // Immediately show the first text in the new language
        rotatingTextElement.textContent = texts[0];
    });
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
// Language is now handled by i18n.js

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeSmartForm();
        initializeEventListeners();
        initializeNavigation();
        initializeSmoothScrolling();
        // initLanguage() removed - using i18n.js
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
    const originalHTML = submitButton.innerHTML;
    
    try {
        // Show loading state
        submitButton.innerHTML = '<span>GÖNDERİLİYOR...</span>';
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
            const errorMsg = window.i18n ? window.i18n.t('quote.errorValidation') : 'Lütfen tüm gerekli alanları doldurun';
            throw new Error(errorMsg);
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
        const successMsg = window.i18n ? window.i18n.t('quote.successMessage').replace('{trackingCode}', `<span style="background: #00A859; color: white; padding: 0.35rem 0.75rem; border-radius: 8px; font-family: monospace; font-size: 1.1em; font-weight: 700;">${result.tracking_code}</span>`) : 
            `Talebiniz başarıyla alındı! <br><br>
            <strong>Takip Kodunuz:</strong> <span style="background: #00A859; color: white; padding: 0.35rem 0.75rem; border-radius: 8px; font-family: monospace; font-size: 1.1em; font-weight: 700;">${result.tracking_code}</span><br><br>
            Bu kodu kullanarak tamir sürecinizi takip edebilirsiniz.<br><br>
            En kısa sürede iletişime geçilecektir.`;
        showQuoteSuccessMessage(successMsg);
        
        // Reset form
        quoteForm.reset();
        brandSelect.disabled = true;
        modelInput.disabled = true;
        
    } catch (error) {
        console.error('Quote submission error:', error);
        const defaultError = window.i18n ? window.i18n.t('quote.errorGeneral') : 'Teklif gönderilemedi. Lütfen tekrar deneyin.';
        showQuoteErrorMessage(error.message || defaultError);
    } finally {
        // Reset button state
        submitButton.innerHTML = originalHTML;
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
    const resultPanel = document.getElementById('tracking-result-panel');
    const trackingInfo = document.getElementById('tracking-info');
    const trackingStepper = document.getElementById('tracking-stepper');
    
    if (!trackingCode) {
        const errorMsg = window.i18n ? window.i18n.t('tracking.errorGeneral') : 'Lütfen geçerli bir takip kodu girin';
        showTrackingError(errorMsg);
        return;
    }
    
    try {
        // Show loading state
        resultPanel.style.display = 'block';
        trackingInfo.innerHTML = '<div class="tracking-loading"><div class="tracking-spinner"></div></div>';
        trackingStepper.innerHTML = '';
        
        // Fetch status from API
        const response = await fetch(`${API_BASE_URL}/api/v1/track/${encodeURIComponent(trackingCode)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                const notFoundMsg = window.i18n ? window.i18n.t('tracking.notFound') : 'Takip kodu bulunamadı. Lütfen kodunuzu kontrol edin.';
                throw new Error(notFoundMsg);
            }
            const errorData = await response.json();
            const errorMsg = window.i18n ? window.i18n.t('tracking.errorGeneral') : 'Durum bilgisi alınamadı';
            throw new Error(errorData.detail || errorMsg);
        }
        
        const statusData = await response.json();
        
        // Display status with stepper
        displayTrackingResult(statusData);
        
    } catch (error) {
        console.error('Tracking error:', error);
        showTrackingError(error.message || 'Durum bilgisi alınamadı. Lütfen tekrar deneyin.');
    }
}

/**
 * Display tracking result with stepper
 */
function displayTrackingResult(statusData) {
    const trackingInfo = document.getElementById('tracking-info');
    const trackingStepper = document.getElementById('tracking-stepper');
    const lastUpdated = new Date(statusData.last_updated_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Display tracking info
    const trackingCodeLabel = window.i18n ? window.i18n.t('tracking.trackingCode') : 'Takip Kodu';
    const lastUpdateLabel = window.i18n ? window.i18n.t('tracking.lastUpdate') : 'Son Güncelleme';
    
    trackingInfo.innerHTML = `
        <div class="tracking-info-item">
            <span class="tracking-info-label">${trackingCodeLabel}:</span>
            <span class="tracking-info-value">${statusData.tracking_code}</span>
        </div>
        <div class="tracking-info-item">
            <span class="tracking-info-label">${lastUpdateLabel}:</span>
            <span class="tracking-info-value">${lastUpdated}</span>
        </div>
    `;
    
    // Define repair steps with i18n support
    const getStepTitle = (key) => window.i18n ? window.i18n.t(`tracking.steps.${key}.title`) : '';
    const getStepDesc = (key) => window.i18n ? window.i18n.t(`tracking.steps.${key}.description`) : '';
    
    const repairSteps = [
        {
            id: 'received',
            title: getStepTitle('received') || 'Talep Alındı',
            description: getStepDesc('received') || 'Talebiniz başarıyla sisteme kaydedildi. En kısa sürede iletişime geçilecektir.',
            icon: checkIcon
        },
        {
            id: 'inspection',
            title: getStepTitle('inspection') || 'Teknik İnceleme',
            description: getStepDesc('inspection') || 'Cihazınız teknik ekibimiz tarafından inceleniyor',
            icon: searchIcon
        },
        {
            id: 'diagnosis',
            title: getStepTitle('diagnosis') || 'Arıza Tespiti',
            description: getStepDesc('diagnosis') || 'Sorun tespit edildi ve çözüm planı hazırlanıyor',
            icon: diagnosticIcon
        },
        {
            id: 'repair',
            title: getStepTitle('repair') || 'Onarım Aşaması',
            description: getStepDesc('repair') || 'Cihazınız onarım sürecinde',
            icon: repairIcon
        },
        {
            id: 'testing',
            title: getStepTitle('testing') || 'Test ve Kalite Kontrol',
            description: getStepDesc('testing') || 'Onarım tamamlandı, testler yapılıyor',
            icon: testIcon
        },
        {
            id: 'completed',
            title: getStepTitle('completed') || 'Tamamlandı',
            description: getStepDesc('completed') || 'Cihazınız teslime hazır',
            icon: completedIcon
        }
    ];
    
    // Determine current step based on status
    const currentStatus = statusData.current_status.toLowerCase();
    let currentStepIndex = 0;
    
    if (currentStatus.includes('inspection') || currentStatus.includes('incelemen')) {
        currentStepIndex = 1;
    } else if (currentStatus.includes('diagnosis') || currentStatus.includes('tespit')) {
        currentStepIndex = 2;
    } else if (currentStatus.includes('repair') || currentStatus.includes('onarım')) {
        currentStepIndex = 3;
    } else if (currentStatus.includes('test') || currentStatus.includes('kontrol')) {
        currentStepIndex = 4;
    } else if (currentStatus.includes('complete') || currentStatus.includes('tamamlan') || currentStatus.includes('hazır')) {
        currentStepIndex = 5;
    }
    
    // Generate stepper HTML
    trackingStepper.innerHTML = repairSteps.map((step, index) => {
        let stepState = 'pending';
        if (index < currentStepIndex) {
            stepState = 'completed';
        } else if (index === currentStepIndex) {
            stepState = 'active';
        }
        
        return `
            <div class="stepper-step ${stepState}">
                <div class="stepper-icon">
                    ${step.icon}
                </div>
                <div class="stepper-content">
                    <h3 class="stepper-title">${step.title}</h3>
                    <p class="stepper-description">${step.description}</p>
                    ${stepState === 'active' || stepState === 'completed' ? `<span class="stepper-timestamp">${lastUpdated}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Show tracking error
 */
function showTrackingError(message) {
    const trackingInfo = document.getElementById('tracking-info');
    const errorTitle = window.i18n ? window.i18n.t('tracking.errorTitle') : 'Hata';
    trackingInfo.innerHTML = `
        <div class="tracking-error">
            <h3 class="tracking-error-title">${errorTitle}</h3>
            <p class="tracking-error-message">${message}</p>
        </div>
    `;
}

// SVG Icons for stepper
const checkIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const searchIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
    <path d="M21 21L16.65 16.65" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const diagnosticIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const repairIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const testIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const completedIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/**
 * Display status result (Legacy - kept for compatibility)
 */
function displayStatusResult(statusData) {
    // Call new function
    displayTrackingResult(statusData);
}

// Keep old statusResult display for backward compatibility
function displayOldStatusResult(statusData) {
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
    const successTitle = window.i18n ? window.i18n.t('quote.successTitle') : 'Başarılı!';
    quoteStatusResult.className = 'quote-status-message success';
    quoteStatusResult.innerHTML = `
        <h3>${successTitle}</h3>
        <p>${message}</p>
    `;
    quoteStatusResult.style.display = 'block';
    
    // Scroll to quote status result
    quoteStatusResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    const errorTitle = window.i18n ? window.i18n.t('quote.errorTitle') : 'Hata';
    quoteStatusResult.className = 'quote-status-message error';
    quoteStatusResult.innerHTML = `
        <h3>${errorTitle}</h3>
        <p>${message}</p>
    `;
    quoteStatusResult.style.display = 'block';
    
    // Scroll to quote status result
    quoteStatusResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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


// Removed unused functions: initScrollStack, initPillNav, initRippleGrid

// ProfileCards removed

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initShinyText();
    initScrollFloat();
    initRotatingText();
    initSpotlightCards();
    initSectionToggle();
});

// Handle language changes
window.addEventListener('languageChanged', () => {
    // Re-render tracking results if they are visible
    const resultPanel = document.getElementById('tracking-result-panel');
    if (resultPanel && resultPanel.style.display !== 'none') {
        const trackingCode = document.getElementById('tracking_code').value.trim();
        if (trackingCode) {
            // Re-fetch and display tracking results
            handleTrackingSubmission(new Event('submit'));
        }
    }
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
    
    // Use the new service card class
    const serviceCards = document.querySelectorAll('.service-card-new');
    
    if (serviceCards.length === 0) {
        // No cards found, skip initialization
        return;
    }
    
    serviceCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
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

