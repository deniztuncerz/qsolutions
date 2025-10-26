/**
 * Q Solutions - Internationalization (i18n) System
 * Simple but powerful multi-language support
 */

class I18n {
    constructor() {
        this.currentLanguage = 'tr'; // Default language
        this.translations = {};
        this.supportedLanguages = ['tr', 'en'];
        this.init();
    }
    
    async init() {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        const savedLang = localStorage.getItem('qsolutions_lang');
        
        // Priority: saved > browser > default
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        } else if (this.supportedLanguages.includes(browserLang)) {
            this.currentLanguage = browserLang;
        }
        
        // Load translations
        await this.loadTranslations();
        
        // Apply translations
        this.applyTranslations();
        
        // Update language switcher UI
        this.updateLanguageSwitcher();
    }
    
    async loadTranslations() {
        try {
            const response = await fetch(`/static/locales/${this.currentLanguage}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to Turkish if loading fails
            if (this.currentLanguage !== 'tr') {
                this.currentLanguage = 'tr';
                await this.loadTranslations();
            }
        }
    }
    
    t(key) {
        // Support nested keys like "nav.home"
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value || key;
    }
    
    applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });
        
        // Translate elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // Update page title
        const titleKey = document.querySelector('meta[name="i18n-title"]');
        if (titleKey) {
            document.title = this.t(titleKey.getAttribute('content'));
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }
    
    async changeLanguage(lang) {
        if (!this.supportedLanguages.includes(lang) || lang === this.currentLanguage) {
            return;
        }
        
        // Show loading indicator (optional)
        document.body.classList.add('language-switching');
        
        this.currentLanguage = lang;
        localStorage.setItem('qsolutions_lang', lang);
        
        // Reload translations
        await this.loadTranslations();
        
        // Apply new translations
        this.applyTranslations();
        
        // Update UI
        this.updateLanguageSwitcher();
        
        // Remove loading indicator
        setTimeout(() => {
            document.body.classList.remove('language-switching');
        }, 300);
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
    
    updateLanguageSwitcher() {
        // Update active language in switcher
        document.querySelectorAll('.lang-option').forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Update current language display
        const currentLangDisplay = document.getElementById('current-lang');
        if (currentLangDisplay) {
            currentLangDisplay.textContent = this.currentLanguage.toUpperCase();
        }
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Create global instance
const i18n = new I18n();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}

// Export for use in other scripts
window.i18n = i18n;

