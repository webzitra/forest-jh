/* ═══════════════════════════════════════════════════════
   Forest Fyzioterapie — Jindřichův Hradec
   WebZítra — webzitra.cz
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Cookie Banner ──────────────────────────────────── */
(function initCookieBanner() {
    const banner  = document.getElementById('cookie-banner');
    const accept  = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');

    if (!banner) return;

    // Zobrazit banner, pokud uživatel ještě neodpověděl
    if (!localStorage.getItem('cookie-consent')) {
        // Krátká prodleva, aby se stránka nejdřív načetla
        setTimeout(() => banner.classList.add('visible'), 800);
    }

    const dismiss = (choice) => {
        localStorage.setItem('cookie-consent', choice);
        banner.classList.remove('visible');
        // Animace zmizení
        setTimeout(() => banner.style.display = 'none', 400);
    };

    accept?.addEventListener('click',  () => dismiss('accepted'));
    decline?.addEventListener('click', () => dismiss('declined'));
})();


/* ─── Header — scroll efekt + transparent over fullscreen hero ── */
(function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const heroFullimg = document.querySelector('.hero-fullimg');
    const heroHeight = heroFullimg ? heroFullimg.offsetHeight - 100 : 0;

    const update = () => {
        const y = window.scrollY;
        const inHero = heroFullimg && y < heroHeight;

        header.classList.toggle('scrolled', !inHero && y > 20);
        if (heroFullimg) {
            header.classList.toggle('hero-transparent', inHero);
        }
    };

    window.addEventListener('scroll', update, { passive: true });
    update(); // při načtení stránky
})();


/* ─── Mobilní navigace ───────────────────────────────── */
(function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mNav      = document.getElementById('m-nav');
    const overlay   = document.getElementById('nav-overlay');
    if (!hamburger || !mNav) return;

    // Drawer žije vždy přímo v <body> → žádný backdrop-filter bug

    // ── Fix výšky pro in-app browsery (Facebook, Messenger, Instagram) ──
    // CSS viewport units (100dvh) nejsou spolehlivé ve WebView — JS je vždy přesný.
    function syncNavHeight() {
        mNav.style.height = window.innerHeight + 'px';
        if (overlay) {
            overlay.style.height = window.innerHeight + 'px';
        }
    }
    syncNavHeight();
    window.addEventListener('resize', syncNavHeight, { passive: true });

    function openNav() {
        syncNavHeight(); // aktualizovat při každém otevření (otočení displeje atd.)
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mNav.classList.add('open');
        mNav.removeAttribute('aria-hidden');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mNav.classList.remove('open');
        mNav.setAttribute('aria-hidden', 'true');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    mNav.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', closeNav)
    );

    hamburger.addEventListener('click', () =>
        hamburger.classList.contains('active') ? closeNav() : openNav()
    );

    if (overlay) overlay.addEventListener('click', closeNav);

    // Klávesa Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mNav.classList.contains('open')) closeNav();
    });

    // Zavřít při resize na desktop
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
        if (e.matches) closeNav();
    });
})();


/* ─── Smooth scroll ──────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Booking modal links handled separately
        if (this.hasAttribute('data-booking')) return;

        const id     = this.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const headerH = document.getElementById('header')?.offsetHeight ?? 68;
        const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

        window.scrollTo({ top, behavior: 'smooth' });

        // Přesunout fokus na sekci pro přístupnost
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
    });
});


/* ─── Aktivní nav odkaz (IntersectionObserver) ───────── */
(function initActiveNav() {
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const setActive = (id) => {
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, {
        threshold: 0.35,
        rootMargin: `-${document.getElementById('header')?.offsetHeight ?? 68}px 0px -45% 0px`,
    });

    sections.forEach(s => observer.observe(s));
})();


/* ─── Scroll animace (IntersectionObserver) ──────────── */
(function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    // Respektuj prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach(el => el.classList.add('animated'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Staggered efekt pro sourozence (karty v gridu)
            const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'))
                .filter(el => !el.classList.contains('animated'));
            const idx = siblings.indexOf(entry.target);
            const delay = Math.min(idx * 80, 400); // max 400ms

            setTimeout(() => entry.target.classList.add('animated'), delay);
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px',
    });

    elements.forEach(el => observer.observe(el));
})();


/* ─── Tlačítko Zpět nahoru ───────────────────────────── */
(function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const toggleBtn = () => {
        if (window.scrollY > 450) {
            btn.removeAttribute('hidden');
        } else {
            btn.setAttribute('hidden', '');
        }
    };

    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();

    btn.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: 'smooth' })
    );
})();


/* ─── Aktuální rok v patičce ─────────────────────────── */
(function setFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();


/* ─── Kontaktní formulář ─────────────────────────────── */
(function initContactForm() {
    const form       = document.getElementById('contact-form');
    const submitBtn  = document.getElementById('submit-btn');
    const successMsg = document.getElementById('form-success');
    if (!form) return;

    // ── Validace jednoho pole ──
    const validateField = (field, errorId, errorMsg) => {
        const errEl = document.getElementById(errorId);
        const valid = field.checkValidity() && field.value.trim() !== '';

        if (!valid) {
            field.classList.add('invalid');
            if (errEl) {
                errEl.textContent = errorMsg;
                errEl.classList.add('visible');
            }
        } else {
            field.classList.remove('invalid');
            if (errEl) {
                errEl.textContent = '';
                errEl.classList.remove('visible');
            }
        }
        return valid;
    };

    // Okamžitá validace při opuštění pole
    const jmeno   = form.querySelector('#jmeno');
    const telefon = form.querySelector('#telefon');
    const gdpr    = form.querySelector('[name="gdpr"]');

    jmeno?.addEventListener('blur', () =>
        validateField(jmeno, 'jmeno-error', 'Prosím zadejte Vaše jméno a příjmení.')
    );
    telefon?.addEventListener('blur', () =>
        validateField(telefon, 'telefon-error', 'Prosím zadejte telefonní číslo.')
    );

    // ── Submit ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validace
        const okJmeno   = validateField(jmeno,   'jmeno-error',   'Prosím zadejte Vaše jméno a příjmení.');
        const okTelefon = validateField(telefon, 'telefon-error', 'Prosím zadejte telefonní číslo.');

        if (!okJmeno || !okTelefon) {
            (okJmeno ? telefon : jmeno)?.focus();
            return;
        }

        if (gdpr && !gdpr.checked) {
            const errEl = document.getElementById('gdpr-error');
            if (errEl) { errEl.textContent = 'Souhlas se zpracováním údajů je povinný.'; errEl.classList.add('visible'); }
            gdpr.focus();
            return;
        }

        // UI feedback
        const btnLabel = submitBtn?.querySelector('.btn-label');
        if (submitBtn) {
            submitBtn.disabled = true;
            if (btnLabel) btnLabel.textContent = 'Odesílám…';
        }

        try {
            // Netlify Forms — AJAX odeslání (bez přesměrování na success page)
            const body = new URLSearchParams(new FormData(form)).toString();
            const res  = await fetch('/', {
                method:  'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // Úspěch
            form.reset();
            if (successMsg) {
                successMsg.removeAttribute('hidden');
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Schovat success zprávu po 10s
            setTimeout(() => successMsg?.setAttribute('hidden', ''), 10000);

        } catch (err) {
            console.error('Chyba při odesílání formuláře:', err);
            alert('Odesílání se nezdařilo. Zkuste to prosím znovu.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                if (btnLabel) btnLabel.textContent = 'Odeslat objednávku';
            }
        }
    });
})();


/* ─── SimplyBook Booking (oficiální button widget) ───── */
(function initBooking() {
    var widgetLoaded = false;
    var sbWidget = null;

    function loadWidget() {
        if (widgetLoaded) return;
        var script = document.createElement('script');
        script.src = '//widget.simplybook.me/v2/widget/widget.js';
        script.onload = function() {
            sbWidget = new SimplybookWidget({
                widget_type: 'button',
                url: 'https://forestjh.simplybook.me',
                theme: 'creative',
                theme_settings: {
                    timeline_show_end_time: '0',
                    timeline_modern_display: 'as_slots',
                    timeline_hide_unavailable: '1',
                    hide_past_days: '0',
                    sb_base_color: '#eb5911',
                    display_item_mode: 'block',
                    booking_nav_bg_color: '#eb5911',
                    body_bg_color: '#ffffff',
                    sb_review_image: '',
                    dark_font_color: '#474747',
                    light_font_color: '#ffffff',
                    btn_color_1: '#eb5911',
                    hide_img_mode: '0',
                    show_sidebar: '1',
                    sb_busy: '#c7b3b3',
                    sb_available: '#d6ebff'
                },
                timeline: 'modern',
                datepicker: 'top_calendar',
                is_rtl: false,
                app_config: { clear_session: 0, allow_switch_to_ada: 0, predefined: [] },
                button_title: 'OBJEDNAT SE',
                button_background_color: '#eb5911',
                button_text_color: '#ffffff',
                button_position: 'top',
                button_position_offset: '20%'
            });
            // Po načtení kliknout na SimplyBook tlačítko pro otevření
            setTimeout(function() {
                var sbBtn = document.querySelector('.simplybook-widget-button');
                if (sbBtn) sbBtn.click();
            }, 300);
        };
        document.head.appendChild(script);
        widgetLoaded = true;
    }

    // Všechny [data-booking] elementy otevřou SimplyBook popup
    document.querySelectorAll('[data-booking]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            if (sbWidget && document.querySelector('.simplybook-widget-button')) {
                document.querySelector('.simplybook-widget-button').click();
            } else {
                loadWidget();
            }
        });
    });
})();


/* ─── Galerie — lightbox (připraveno pro reálné fotky) ─ */
(function initGallery() {
    // Placeholder — až klient dodá fotografie, zde bude jednoduchý lightbox.
    // Prozatím žádná interakce s placeholder divy.
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const img = item.querySelector('img');
        if (!img) return; // placeholder bez obrázku

        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Zobrazit fotografii: ${img.alt}`);

        const open = () => {
            // Budoucí lightbox implementace
        };
        item.addEventListener('click', open);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
})();
