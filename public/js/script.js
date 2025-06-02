// script.js - Mantido sem alterações para as requisições atuais

document.addEventListener('DOMContentLoaded', () => {
    const dropdownToggle = document.querySelector('.language-dropdown .dropdown-toggle');
    const dropdownMenu = document.querySelector('.language-dropdown .dropdown-menu');
    const selectedFlagImg = document.getElementById('selected-flag');
    const selectedLangCodeSpan = document.getElementById('selected-lang-code');

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (event) => {
            dropdownMenu.classList.toggle('show');
            dropdownToggle.classList.toggle('active');
            event.stopPropagation();
        });

        dropdownMenu.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', (event) => {
                event.preventDefault();
                const newFlagSrc = option.querySelector('img')?.src;
                const newLangCode = option.dataset.code;

                if (selectedFlagImg && newFlagSrc) {
                    selectedFlagImg.src = newFlagSrc;
                }
                if (selectedLangCodeSpan && newLangCode) {
                    selectedLangCodeSpan.textContent = newLangCode;
                }

                dropdownMenu.classList.remove('show');
                dropdownToggle.classList.remove('active');

                console.log(`Idioma selecionado: ${newLangCode}`);
            });
        });

        document.addEventListener('click', (event) => {
            if (dropdownMenu.classList.contains('show') && !dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove('show');
                dropdownToggle.classList.remove('active');
            }
        });
    }

    const filterButtonContainers = document.querySelectorAll('.filter-buttons');
    filterButtonContainers.forEach(container => {
        const filterButtons = container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    if (header) {
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 0) {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.6)';
            } else {
                header.style.boxShadow = 'var(--shadow-subtle)';
            }
        }, false);
    }

    function typeWriterEffect(element, text, speed = 50) {
        if (!element || !text) return;

         // Prevent re-typing if already visible or already typed
        if (element.classList.contains('is-visible') && element.textContent === text.trim()) {
             return;
         }

        element.textContent = ''; // Clear existing text
        const typeObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let i = 0;
                    function type() {
                        if (i < text.length) {
                            // Only add character if element content hasn't been externally modified
                            if (element.textContent.length === i) {
                                element.textContent += text.charAt(i);
                                i++;
                                setTimeout(type, speed);
                            } else {
                                // If content was modified (e.g. rapid scroll), restart or stop
                                // For simplicity, let's just stop and leave the current content
                                console.warn('Typewriter interrupted.');
                            }
                        }
                    }
                    type();
                    obs.unobserve(entry.target); // Stop observing once typing starts
                }
            });
        }, { threshold: 0.5 }); // Start typing when 50% visible

        typeObserver.observe(element); // Start observing the element
    }

    document.querySelectorAll('.section-title.typewriter').forEach(title => {
        const fullText = title.dataset.text;
        if (fullText) {
            typeWriterEffect(title, fullText.trim());
        } else {
             // If data-text is missing, just set the text immediately
             title.textContent = title.textContent.trim();
        }
    });
});