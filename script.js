const dom = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.getElementById('navLinks'),
    scrollLinks: document.querySelectorAll('a[href^="#"]'),
    contactForm: document.getElementById('contactForm'),
    formAlert: document.getElementById('formAlert'),
    year: document.getElementById('year'),
    testimonialSlider: document.getElementById('testimonialSlider'),
};

const state = {
    lastScrollY: 0,
    scrollTimeout: null,
    testimonialIndex: 0,
    testimonials: [],
};

function setYear() {
    if (dom.year) {
        dom.year.textContent = new Date().getFullYear();
    }
}

function toggleNav() {
    document.body.classList.toggle('nav-open');
}

function closeNav() {
    document.body.classList.remove('nav-open');
}

function handleScroll() {
    const currentScroll = window.scrollY;
    const isScrollingDown = currentScroll > state.lastScrollY;

    dom.navbar.classList.toggle('navbar--hidden', isScrollingDown && currentScroll > 80);
    state.lastScrollY = currentScroll;
}

function scrollSpy() {
    const reveals = document.querySelectorAll('.reveal');
    const viewportHeight = window.innerHeight;
    const revealPoint = 0.88;

    reveals.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < viewportHeight * revealPoint) {
            element.classList.add('active');
        }
    });
}

function setupReveals() {
    const revealTargets = document.querySelectorAll(
        '#trust .trust-card, #services .service-card, #how .step-card, #pricing .pricing-card, #testimonials .testimonial, #faq .faq-item, #contact .contact-card, #contact .contact-form, #problem .problem-card, #why .why-card, #stats .stat-card, .cta-section'
    );

    revealTargets.forEach((target, idx) => {
        target.classList.add('reveal');
        target.style.transitionDelay = `${idx * 50}ms`;
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    revealTargets.forEach((target) => observer.observe(target));
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-card[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const card = entry.target;
                const target = Number(card.getAttribute('data-target')) || 0;
                const valueNode = card.querySelector('.stat-num');

                if (!valueNode) return;

                const start = 0;
                const duration = 1400;
                const startTime = performance.now();

                function tick(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const current = Math.floor(start + (target - start) * progress);
                    valueNode.textContent = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(tick);
                    }
                }

                requestAnimationFrame(tick);
                observer.unobserve(card);
            });
        },
        { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
}

function initHeroRotator() {
    const rotator = document.querySelector('.hero-rotate');
    if (!rotator) return;

    const words = rotator.getAttribute('data-words')?.split(',').map((w) => w.trim()) || [];
    if (!words.length) return;

    let index = 0;
    rotator.textContent = words[index];

    setInterval(() => {
        index = (index + 1) % words.length;
        rotator.classList.remove('fade-in');
        void rotator.offsetWidth;
        rotator.textContent = words[index];
        rotator.classList.add('fade-in');
    }, 3600);
}


function smoothScroll(event) {
    const target = event.currentTarget;
    const href = target.getAttribute('href');

    if (!href || !href.startsWith('#')) return;

    const destination = document.querySelector(href);
    if (!destination) return;

    event.preventDefault();
    closeNav();

    const offset = 78; // navbar height
    const top = destination.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
}

function showFormMessage(message, success = true) {
    if (!dom.formAlert) return;

    dom.formAlert.textContent = message;
    dom.formAlert.classList.add('active');
    dom.formAlert.style.borderColor = success ? 'rgba(76, 217, 100, 0.35)' : 'rgba(255, 75, 110, 0.35)';
    dom.formAlert.style.background = success
        ? 'rgba(76, 217, 100, 0.14)'
        : 'rgba(255, 75, 110, 0.14)';

    window.setTimeout(() => {
        dom.formAlert.classList.remove('active');
    }, 6000);
}

function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {};

    data.forEach((value, key) => {
        payload[key] = value;
    });

    if (!payload.name || !payload.email || !payload.appName || !payload.package || !payload.message) {
        showFormMessage('Please fill in all fields before sending.', false);
        return;
    }

    showFormMessage('Thanks! Your request is on the way. We’ll reply in under an hour.');
    form.reset();
}

function initTestimonialSlider() {
    const slides = dom.testimonialSlider?.querySelectorAll('.testimonial');
    const nextBtn = dom.testimonialSlider?.querySelector("[data-slide='next']");
    const prevBtn = dom.testimonialSlider?.querySelector("[data-slide='prev']");

    if (!slides?.length) return;

    state.testimonials = Array.from(slides);
    state.testimonialIndex = 0;

    function showSlide(index) {
        state.testimonials.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === index);
        });
    }

    function nextSlide(direction = 1) {
        state.testimonialIndex = (state.testimonialIndex + direction + state.testimonials.length) % state.testimonials.length;
        showSlide(state.testimonialIndex);
    }

    nextBtn?.addEventListener('click', () => nextSlide(1));
    prevBtn?.addEventListener('click', () => nextSlide(-1));

    setInterval(() => nextSlide(1), 9000);
    showSlide(state.testimonialIndex);
}

function init() {
    setYear();
    setupReveals();
    initHeroRotator();
    initCounters();
    initTestimonialSlider();

    dom.navToggle?.addEventListener('click', toggleNav);
    dom.scrollLinks?.forEach((link) => link.addEventListener('click', smoothScroll));
    dom.contactForm?.addEventListener('submit', handleFormSubmit);

    window.addEventListener('scroll', () => {
        if (state.scrollTimeout) return;

        state.scrollTimeout = window.setTimeout(() => {
            handleScroll();
            scrollSpy();
            state.scrollTimeout = null;
        }, 14);
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.closest('.nav-links') && !target.closest('.nav-toggle')) {
            closeNav();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
