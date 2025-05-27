document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica do Slider existente ---
    const sliderItems = document.querySelectorAll('.slider-item');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        if (sliderItems.length === 0 || dots.length === 0) return; // Proteção

        sliderItems.forEach((item, i) => {
            item.classList.remove('active');
            if (item.querySelector('.slide-text')) {
                item.querySelector('.slide-text').style.opacity = '0';
                item.querySelector('.slide-text').style.transform = 'translateY(20px)';
            }
        });
        dots.forEach(dot => dot.classList.remove('active'));

        sliderItems[index].classList.add('active');
        if (sliderItems[index].querySelector('.slide-text')) {
            setTimeout(() => { // Adiciona um pequeno delay para a transição ser visível
                sliderItems[index].querySelector('.slide-text').style.opacity = '1';
                sliderItems[index].querySelector('.slide-text').style.transform = 'translateY(0)';
            }, 50);
        }
        dots[index].classList.add('active');
    }

    function nextSlide() {
        if (sliderItems.length === 0) return;
        currentSlide = (currentSlide + 1) % sliderItems.length;
        showSlide(currentSlide);
    }

    function startSlider() {
        if (sliderItems.length > 1) { // Só inicia o intervalo se houver mais de um slide
            slideInterval = setInterval(nextSlide, 7000); // Aumentei o tempo para 7s
        }
    }

    function resetSlider() {
        clearInterval(slideInterval);
        startSlider();
    }

    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                resetSlider();
            });
        });
    }

    if (sliderItems.length > 0) {
        showSlide(currentSlide);
        startSlider();
    }

    // --- Lógica do Dropdown de Idioma existente ---
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const selectedFlag = document.getElementById('selected-flag');
    const selectedLangCode = document.getElementById('selected-lang-code');

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (event) => {
            dropdownMenu.classList.toggle('show');
            dropdownToggle.classList.toggle('active');
            event.stopPropagation();
        });

        dropdownMenu.addEventListener('click', (event) => {
            const selectedOption = event.target.closest('a');
            if (selectedOption) {
                const newFlagSrc = selectedOption.querySelector('img').src;
                const newLangCode = selectedOption.dataset.code;

                if(selectedFlag) selectedFlag.src = newFlagSrc;
                if(selectedLangCode) selectedLangCode.textContent = newLangCode;

                dropdownMenu.classList.remove('show');
                dropdownToggle.classList.remove('active');
                // Aqui você poderia adicionar lógica para traduzir a página
            }
        });

        document.addEventListener('click', (event) => {
            if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove('show');
                dropdownToggle.classList.remove('active');
            }
        });
    }

    // --- Lógica dos Botões de Filtro (reutilizável) ---
    const filterButtonContainers = document.querySelectorAll('.filter-buttons'); // Use uma classe container se tiver múltiplos
    filterButtonContainers.forEach(container => {
        const filterButtons = container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                // Adicionar lógica de filtragem aqui se necessário
                // const filterValue = button.dataset.filter;
                // console.log('Filtrar por:', filterValue);
            });
        });
    });


    // --- NOVO: Efeito de Fade-in ao Rolar ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% do elemento visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Para animar apenas uma vez
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- NOVO: Efeito de Parallax Sutil no Header ao rolar ---
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Rolando para baixo e passou da altura do header
            header.style.transform = 'translateY(-100%)'; // Esconde o header
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        } else {
            // Rolando para cima ou no topo
            header.style.transform = 'translateY(0)';
            if (scrollTop === 0) {
                 header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)'; // Sombra original
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Evita valores negativos
    }, false);


    // --- NOVO: Efeito de texto digitado para títulos de seção ---
    // Esta função é um exemplo, você pode adaptá-la ou usar uma biblioteca
    function typeWriterEffect(element, text, speed = 70) {
        let i = 0;
        element.innerHTML = ""; // Limpa o conteúdo original
        const originalText = text || element.dataset.textToType || element.textContent;
        if (!originalText) return;

        function type() {
            if (i < originalText.length) {
                element.innerHTML += originalText.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        // Inicia o efeito quando o elemento fica visível (usando o mesmo observer)
        const typeObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    type();
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        typeObserver.observe(element);
    }

    document.querySelectorAll('.section-title.typewriter').forEach(title => {
        typeWriterEffect(title);
    });


});