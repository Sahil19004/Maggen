// QuickLoans JavaScript functionality

// Global variables
let currentSlide = 0;
let currentTestimonial = 0;
let currentStep = 1;
let carouselInterval;
let testimonialInterval;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    initializeTestimonials();
    initializeCalculators();
    initializeForms();
    initializeNavigation();
    initializeModals();
    initializeScrollEffects();
    
    // Calculate initial values
    calculateEMI();
    calculateEligibility();
});

// Hero Carousel Functions
function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel__slide');
    const dots = document.querySelectorAll('.carousel__dots .dot');
    const prevBtn = document.querySelector('.carousel__prev');
    const nextBtn = document.querySelector('.carousel__next');
    
    if (slides.length === 0) return;
    
    // Start autoplay
    startCarouselAutoplay();
    
    // Add event listeners for controls
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            previousSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });
    }
    
    // Add event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            goToSlide(index);
        });
    });
    
    // Pause on hover
    const carousel = document.querySelector('.hero__carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarouselAutoplay);
        carousel.addEventListener('mouseleave', startCarouselAutoplay);
    }
    
    // Touch/swipe support
    let startX = 0;
    let isDragging = false;
    
    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            stopCarouselAutoplay();
        });
        
        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
            
            isDragging = false;
            startCarouselAutoplay();
        });
    }
}

function startCarouselAutoplay() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopCarouselAutoplay() {
    clearInterval(carouselInterval);
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel__slide');
    const dots = document.querySelectorAll('.carousel__dots .dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    // Move to next slide
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Add active class to new slide and dot
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function previousSlide() {
    const slides = document.querySelectorAll('.carousel__slide');
    const dots = document.querySelectorAll('.carousel__dots .dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    // Move to previous slide
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    
    // Add active class to new slide and dot
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

function goToSlide(slideIndex) {
    const slides = document.querySelectorAll('.carousel__slide');
    const dots = document.querySelectorAll('.carousel__dots .dot');
    
    if (slides.length === 0 || slideIndex < 0 || slideIndex >= slides.length) return;
    
    // Remove active class from current slide and dot
    if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    // Set new current slide
    currentSlide = slideIndex;
    
    // Add active class to new slide and dot
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    // Restart autoplay
    stopCarouselAutoplay();
    startCarouselAutoplay();
}

// Testimonials Carousel Functions
function initializeTestimonials() {
    const slides = document.querySelectorAll('.testimonial__slide');
    const prevBtn = document.querySelector('.testimonial__prev');
    const nextBtn = document.querySelector('.testimonial__next');
    
    if (slides.length === 0) return;
    
    // Start autoplay
    startTestimonialAutoplay();
    
    // Add event listeners for controls
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            previousTestimonial();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            nextTestimonial();
        });
    }
    
    // Pause on hover
    const testimonialSection = document.querySelector('.testimonials__carousel');
    if (testimonialSection) {
        testimonialSection.addEventListener('mouseenter', stopTestimonialAutoplay);
        testimonialSection.addEventListener('mouseleave', startTestimonialAutoplay);
    }
    
    // Touch/swipe support for testimonials
    let startX = 0;
    let isDragging = false;
    
    if (testimonialSection) {
        testimonialSection.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            stopTestimonialAutoplay();
        });
        
        testimonialSection.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        testimonialSection.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    nextTestimonial();
                } else {
                    previousTestimonial();
                }
            }
            
            isDragging = false;
            startTestimonialAutoplay();
        });
    }
}

function startTestimonialAutoplay() {
    clearInterval(testimonialInterval);
    testimonialInterval = setInterval(() => {
        nextTestimonial();
    }, 4000);
}

function stopTestimonialAutoplay() {
    clearInterval(testimonialInterval);
}

function nextTestimonial() {
    const slides = document.querySelectorAll('.testimonial__slide');
    
    if (slides.length === 0) return;
    
    if (slides[currentTestimonial]) slides[currentTestimonial].classList.remove('active');
    currentTestimonial = (currentTestimonial + 1) % slides.length;
    if (slides[currentTestimonial]) slides[currentTestimonial].classList.add('active');
}

function previousTestimonial() {
    const slides = document.querySelectorAll('.testimonial__slide');
    
    if (slides.length === 0) return;
    
    if (slides[currentTestimonial]) slides[currentTestimonial].classList.remove('active');
    currentTestimonial = (currentTestimonial - 1 + slides.length) % slides.length;
    if (slides[currentTestimonial]) slides[currentTestimonial].classList.add('active');
    
    stopTestimonialAutoplay();
    startTestimonialAutoplay();
}
function initializeNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.querySelector('.header__nav');
    const navLinks = document.querySelectorAll('.nav__link');
    
    // Toggle mobile menu
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            
            // Force white background with JavaScript
            if (nav.classList.contains('active')) {
                nav.style.backgroundColor = 'white';
                nav.style.display = 'block';
            }
        });
    }
    
    // Close mobile menu when clicking on any nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close the mobile nav
            if (nav) {
                nav.classList.remove('active');
                nav.style.display = 'none';
            }
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
            }
        });
    });
    
    // Close mobile menu when clicking outside of it
    document.addEventListener('click', function(e) {
        if (nav && mobileToggle && 
            !nav.contains(e.target) && 
            !mobileToggle.contains(e.target) &&
            nav.classList.contains('active')) {
            
            nav.classList.remove('active');
            mobileToggle.classList.remove('active');
            nav.style.display = 'none';
        }
    });
    
    // Close mobile menu on window resize (when switching from mobile to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (nav) {
                nav.classList.remove('active');
                nav.style.display = '';
                nav.style.backgroundColor = '';
            }
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNavigation);

function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Modal Functions
function initializeModals() {
    // Apply Now buttons - more comprehensive selection
    const applyButtons = document.querySelectorAll('.apply-btn, .hero__cta, button[onclick*="loanModal"]');
    applyButtons.forEach(btn => {
        // Remove any existing onclick attributes
        btn.removeAttribute('onclick');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openModal('loanModal');
        });
    });
    
    // Login/Signup buttons
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openModal('loginModal');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openModal('signupModal');
        });
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.modal__close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = btn.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });
    
    // Switch between login and signup
    const signupLinks = document.querySelectorAll('.signup-link');
    const loginLinks = document.querySelectorAll('.login-link');
    
    signupLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('loginModal');
            openModal('signupModal');
        });
    });
    
    loginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('signupModal');
            openModal('loginModal');
        });
    });
    
    // Step navigation
    const nextStepBtn = document.getElementById('nextStep');
    const prevStepBtn = document.getElementById('prevStep');
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nextStep();
        });
    }
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', function(e) {
            e.preventDefault();
            previousStep();
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Reset loan application form to first step when opening
        if (modalId === 'loanModal') {
            resetLoanApplication();
        }
        
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// ESC key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal:not(.hidden)');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// Loan Application Form Functions
function resetLoanApplication() {
    currentStep = 1;
    updateApplicationSteps();
    
    const form = document.getElementById('loanApplicationForm');
    if (form) form.reset();
    
    // Clear any validation errors
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.remove());
    
    // Reset field styles
    const fields = form?.querySelectorAll('.form-control') || [];
    fields.forEach(field => {
        field.style.borderColor = '';
    });
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            currentStep++;
            updateApplicationSteps();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateApplicationSteps();
    }
}

function updateApplicationSteps() {
    // Update step indicators
    const steps = document.querySelectorAll('.application__steps .step');
    const contents = document.querySelectorAll('.step__content');
    
    steps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    contents.forEach((content, index) => {
        if (index + 1 === currentStep) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update buttons
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitApplication');
    
    if (prevButton) {
        prevButton.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    }
    
    if (nextButton && submitButton) {
        if (currentStep === 4) {
            nextButton.style.display = 'none';
            submitButton.style.display = 'inline-flex';
            updateApplicationSummary();
        } else {
            nextButton.style.display = 'inline-flex';
            submitButton.style.display = 'none';
        }
    }
}

function validateCurrentStep() {
    const currentContent = document.querySelector(`.step__content[data-step="${currentStep}"]`);
    if (!currentContent) return true;
    
    const requiredFields = currentContent.querySelectorAll('[required]');
    let isValid = true;
    
    // Remove existing error messages
    const errorElements = currentContent.querySelectorAll('.form-error');
    errorElements.forEach(el => el.remove());
    
    requiredFields.forEach(field => {
        const value = field.value.trim();
        
        if (!value) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field.type === 'email' && !isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        } else if (field.type === 'tel' && !isValidPhone(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            isValid = false;
        } else if (field.type === 'number' && field.min && parseFloat(value) < parseFloat(field.min)) {
            showFieldError(field, `Value must be at least ${field.min}`);
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.color = 'var(--color-error)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-4)';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = 'var(--color-error)';
    
    // Remove error styling when user starts typing
    field.addEventListener('input', function() {
        field.style.borderColor = '';
        if (errorDiv.parentNode) errorDiv.remove();
    }, { once: true });
}

function updateApplicationSummary() {
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const loanType = document.getElementById('loanType')?.value || '';
    const requestedAmount = document.getElementById('requestedAmount')?.value || '';
    const income = document.getElementById('income')?.value || '';
    const purpose = document.getElementById('purpose')?.value || '';
    
    const loanTypeDisplay = loanType.charAt(0).toUpperCase() + loanType.slice(1);
    const amountFormatted = parseInt(requestedAmount || 0).toLocaleString();
    const incomeFormatted = parseInt(income || 0).toLocaleString();
    
    const summaryHTML = `
        <div style="background: var(--color-bg-1); padding: var(--space-16); border-radius: var(--radius-base); margin-bottom: var(--space-16); border: 1px solid var(--color-border);">
            <h5 style="margin-bottom: var(--space-12); color: var(--color-text);">Personal Information</h5>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Email:</strong> ${email}</p>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Phone:</strong> ${phone}</p>
        </div>
        <div style="background: var(--color-bg-3); padding: var(--space-16); border-radius: var(--radius-base); border: 1px solid var(--color-border);">
            <h5 style="margin-bottom: var(--space-12); color: var(--color-text);">Loan Information</h5>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Loan Type:</strong> ${loanTypeDisplay} Loan</p>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Requested Amount:</strong> $${amountFormatted}</p>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Annual Income:</strong> $${incomeFormatted}</p>
            <p style="margin: var(--space-4) 0; color: var(--color-text);"><strong>Purpose:</strong> ${purpose}</p>
        </div>
    `;
    
    const summaryElement = document.getElementById('applicationSummary');
    if (summaryElement) {
        summaryElement.innerHTML = summaryHTML;
    }
}

// Form Initialization and Validation
function initializeForms() {
    // Loan application form
    const loanForm = document.getElementById('loanApplicationForm');
    if (loanForm) {
        loanForm.addEventListener('submit', handleLoanApplicationSubmit);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }
    
    // Password strength indicator
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', updatePasswordStrength);
    }
    
    // Confirm password validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordConfirm);
    }
    
    // File upload handling
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });
}

function handleLoanApplicationSubmit(e) {
    e.preventDefault();
    
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms?.checked) {
        showNotification('Please accept the terms and conditions to proceed.', 'error');
        return;
    }
    
    // Simulate form submission
    const submitButton = document.getElementById('submitApplication');
    if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            showNotification('Loan application submitted successfully! We will review your application and contact you within 24 hours.', 'success');
            closeModal('loanModal');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    // Simulate login
    showNotification('Login successful! Welcome back.', 'success');
    closeModal('loginModal');
}

function handleSignupSubmit(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName')?.value || '';
    const lastName = document.getElementById('signupLastName')?.value || '';
    const email = document.getElementById('signupEmail')?.value || '';
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    
    
    if (!firstName || !lastName || !email || !password) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    
    // Simulate signup
    showNotification('Account created successfully! Please check your email for verification.', 'success');
    closeModal('signupModal');
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    const label = e.target.nextElementSibling;
    
    if (file && label) {
        label.style.background = 'var(--color-success)';
        label.style.color = 'white';
        label.style.borderColor = 'var(--color-success)';
        label.textContent = `✓ ${file.name}`;
    } else if (label) {
        label.style.background = '';
        label.style.color = '';
        label.style.borderColor = '';
        label.textContent = label.getAttribute('data-original-text') || label.textContent;
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('signupPassword')?.value || '';
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (!strengthIndicator) return;
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    strengthIndicator.className = 'password__strength';
    
    if (strength <= 2) {
        strengthIndicator.classList.add('weak');
    } else if (strength <= 3) {
        strengthIndicator.classList.add('medium');
    } else {
        strengthIndicator.classList.add('strong');
    }
}

function validatePasswordConfirm() {
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const confirmField = document.getElementById('confirmPassword');
    
    if (!confirmField) return;
    
    if (confirmPassword && password !== confirmPassword) {
        confirmField.style.borderColor = 'var(--color-error)';
    } else {
        confirmField.style.borderColor = '';
    }
}

// Calculator Functions
function initializeCalculators() {
    // Add event listeners for calculator inputs with immediate response
    const calculatorInputs = document.querySelectorAll('#loanAmount, #interestRate, #loanTenure, #monthlyIncome, #monthlyExpenses, #existingEMI');
    calculatorInputs.forEach(input => {
        // Real-time updates on input
        input.addEventListener('input', function() {
            if (input.id === 'loanAmount' || input.id === 'interestRate' || input.id === 'loanTenure') {
                calculateEMI();
            } else {
                calculateEligibility();
            }
        });
        
        // Also update on change for better compatibility
        input.addEventListener('change', function() {
            if (input.id === 'loanAmount' || input.id === 'interestRate' || input.id === 'loanTenure') {
                calculateEMI();
            } else {
                calculateEligibility();
            }
        });
        
        // Update on keyup for immediate feedback
        input.addEventListener('keyup', function() {
            if (input.id === 'loanAmount' || input.id === 'interestRate' || input.id === 'loanTenure') {
                calculateEMI();
            } else {
                calculateEligibility();
            }
        });
    });
}

function calculateEMI() {
    const loanAmountElement = document.getElementById('loanAmount');
    const interestRateElement = document.getElementById('interestRate');
    const loanTenureElement = document.getElementById('loanTenure');
    
    if (!loanAmountElement || !interestRateElement || !loanTenureElement) return;
    
    const loanAmount = parseFloat(loanAmountElement.value) || 0;
    const interestRate = parseFloat(interestRateElement.value) || 0;
    const loanTenure = parseFloat(loanTenureElement.value) || 0;
    
    const emiAmountElement = document.getElementById('emiAmount');
    const totalInterestElement = document.getElementById('totalInterest');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (loanAmount > 0 && interestRate > 0 && loanTenure > 0) {
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTenure * 12;
        
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        
        const totalAmount = emi * numberOfPayments;
        const totalInterest = totalAmount - loanAmount;
        
        if (emiAmountElement) emiAmountElement.textContent = `₹${emi.toFixed(2)}`;
        if (totalInterestElement) totalInterestElement.textContent = `₹${totalInterest.toFixed(2)}`;
        if (totalAmountElement) totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
        
        // Add visual feedback
        [emiAmountElement, totalInterestElement, totalAmountElement].forEach(el => {
            if (el) {
                el.style.transform = 'scale(1.05)';
                el.style.color = 'var(--color-primary)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                    el.style.color = '';
                }, 200);
            }
        });
    } else {
        // Show default values when inputs are invalid
        if (emiAmountElement) emiAmountElement.textContent = '₹0.00';
        if (totalInterestElement) totalInterestElement.textContent = '₹0.00';
        if (totalAmountElement) totalAmountElement.textContent = '₹0.00';
    }
}

function calculateEligibility() {
    const monthlyIncomeElement = document.getElementById('monthlyIncome');
    const monthlyExpensesElement = document.getElementById('monthlyExpenses');
    const existingEMIElement = document.getElementById('existingEMI');
    
    if (!monthlyIncomeElement || !monthlyExpensesElement || !existingEMIElement) return;
    
    const monthlyIncome = parseFloat(monthlyIncomeElement.value) || 0;
    const monthlyExpenses = parseFloat(monthlyExpensesElement.value) || 0;
    const existingEMI = parseFloat(existingEMIElement.value) || 0;
    
    const availableIncome = monthlyIncome - monthlyExpenses - existingEMI;
    
    // Assuming 50% of available income can be used for loan EMI
    const maxEMI = Math.max(0, availableIncome * 0.5);
    
    // Assuming average interest rate of 10% and 5-year tenure for calculation
    let eligibleAmount = 0;
    if (maxEMI > 0) {
        const rate = 0.10 / 12; // 10% annual rate, monthly
        const tenure = 5 * 12; // 5 years in months
        eligibleAmount = (maxEMI * (Math.pow(1 + rate, tenure) - 1)) / (rate * Math.pow(1 + rate, tenure));
    }
    
    const availableIncomeElement = document.getElementById('availableIncome');
    const eligibleAmountElement = document.getElementById('eligibleAmount');
    const statusElement = document.getElementById('eligibilityStatus');
    
    if (availableIncomeElement) availableIncomeElement.textContent = `₹${availableIncome.toFixed(2)}`;
    if (eligibleAmountElement) eligibleAmountElement.textContent = `₹${Math.max(0, eligibleAmount).toFixed(0)}`;
    
    if (statusElement) {
        if (availableIncome > 1000) {
            statusElement.textContent = 'Eligible for loan';
            statusElement.className = 'status status--success';
        } else if (availableIncome > 500) {
            statusElement.textContent = 'Limited eligibility';
            statusElement.className = 'status status--warning';
        } else {
            statusElement.textContent = 'Not eligible';
            statusElement.className = 'status status--error';
        }
    }
    
    // Add visual feedback
    [availableIncomeElement, eligibleAmountElement].forEach(el => {
        if (el) {
            el.style.transform = 'scale(1.05)';
            el.style.color = 'var(--color-primary)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
                el.style.color = '';
            }, 200);
        }
    });
}

// Scroll Effects
function initializeScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Add animation to elements
    const animatedElements = document.querySelectorAll('.loan__card, .stat__item, .feature__item, .testimonial__card, .calculator');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-surface);
        color: var(--color-text);
        padding: var(--space-16) var(--space-20);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 20000;
        border-left: 4px solid var(--color-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'});
        transform: translateX(100%);
        opacity: 0;
        transition: all var(--duration-normal) var(--ease-standard);
        max-width: 400px;
        word-wrap: break-word;
        cursor: pointer;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Handle page visibility changes to pause/resume carousels
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopCarouselAutoplay();
        stopTestimonialAutoplay();
    } else {
        startCarouselAutoplay();
        startTestimonialAutoplay();
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Close mobile menu on larger screens
    if (window.innerWidth > 768) {
        const nav = document.querySelector('.header__nav');
        const mobileToggle = document.getElementById('mobileToggle');
        if (nav) nav.classList.remove('active');
        if (mobileToggle) mobileToggle.classList.remove('active');
    }
});

// Initialize file upload labels
document.addEventListener('DOMContentLoaded', function() {
    const fileLabels = document.querySelectorAll('.file__upload label');
    fileLabels.forEach(label => {
        label.setAttribute('data-original-text', label.textContent);
    });
});

// Enhanced marquee animation control
document.addEventListener('DOMContentLoaded', function() {
    const marqueeTrack = document.querySelector('.marquee__track');
    if (marqueeTrack) {
        // Pause animation on hover
        marqueeTrack.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        marqueeTrack.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Arrow key navigation for carousel
    if (document.activeElement.closest('.hero__carousel')) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    }
    
    // Arrow key navigation for testimonials
    if (document.activeElement.closest('.testimonials__carousel')) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousTestimonial();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextTestimonial();
        }
    }
});

// Add ARIA labels and roles for accessibility
document.addEventListener('DOMContentLoaded', function() {
    // Carousel accessibility
    const carousel = document.querySelector('.hero__carousel');
    if (carousel) {
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-label', 'Hero carousel');
        
        const slides = carousel.querySelectorAll('.carousel__slide');
        slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
        });
    }
    
    // Testimonials accessibility
    const testimonials = document.querySelector('.testimonials__carousel');
    if (testimonials) {
        testimonials.setAttribute('role', 'region');
        testimonials.setAttribute('aria-label', 'Customer testimonials');
    }
});