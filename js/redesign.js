/* ═══════════════════════════════════════════════════════
   Forest Fyzioterapie — Redesign v2 enhancements
   Scroll progress, sticky CTA, glass nav, card spotlight
   ═══════════════════════════════════════════════════════ */

(() => {
    'use strict';

    // ─── Scroll progress bar ────────────────────────────────
    const progress = document.getElementById('scrollProgress');
    const header = document.getElementById('header');
    const floatingCta = document.getElementById('floatingCta');
    const heroSection = document.getElementById('hero');

    const updateScroll = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

        if (progress) progress.style.width = pct + '%';

        // Glass navbar — scrolled state
        if (header) {
            if (scrollY > 30) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }

        // Floating CTA — show after hero scroll
        if (floatingCta && heroSection) {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            if (scrollY > heroBottom * 0.6) {
                floatingCta.classList.add('visible');
            } else {
                floatingCta.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    // ─── Service card mouse-tracked spotlight ───────────────
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
        card.addEventListener('mouseleave', () => {
            card.style.removeProperty('--mx');
            card.style.removeProperty('--my');
        });
    });

    // ─── Floating CTA → trigger SimplyBook (sdílí logiku s data-booking) ──
    if (floatingCta) {
        floatingCta.addEventListener('click', e => {
            e.preventDefault();
            // Klikneme na první data-booking link → spustí stávající booking handler
            const original = document.querySelector('a[data-booking]:not(#floatingCta)');
            if (original) original.click();
        });
    }

    // ─── Reveal animace pro nové sekce ──────────────────────
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '-40px' });

        document.querySelectorAll('.process-step, .pricing-card').forEach(el => io.observe(el));
    }
})();
