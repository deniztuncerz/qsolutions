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
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSmartForm();
    initializeEventListeners();
    initializeNavigation();
    initializeSmoothScrolling();
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
        submitButton.textContent = 'Submitting...';
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
        
        // Show success message
        showSuccessMessage(`Your request has been received! Your Tracking Code is: ${result.tracking_code}`);
        
        // Reset form
        quoteForm.reset();
        brandSelect.disabled = true;
        modelInput.disabled = true;
        
    } catch (error) {
        console.error('Quote submission error:', error);
        showErrorMessage(error.message || 'Failed to submit quote. Please try again.');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
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

// Export functions for potential external use
window.QSolutions = {
    handleQuoteSubmission,
    handleTrackingSubmission,
    showSuccessMessage,
    showErrorMessage,
    formatDate
};

