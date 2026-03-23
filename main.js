/* -----------------------------
   Утилиты
----------------------------- */
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const debounce = (fn, delay = 150) => {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

/* -----------------------------
   Инициализация: отступ и появление шапки
----------------------------- */
const initHeader = () => {
    const header = $('header');
    if (!header) return;

    const updatePadding = () => {
        document.body.style.paddingTop = header.offsetHeight + 'px';
    };

    setTimeout(() => {
        header.classList.add('visible');
        updatePadding();
    }, 300);

    window.addEventListener('resize', debounce(updatePadding, 100));

    const observer = new MutationObserver(updatePadding);
    observer.observe(header, {
        attributes: true,
        attributeFilter: ['class']
    });
};

/* -----------------------------
   Кнопка "Вверх"
----------------------------- */
const initScrollButton = () => {
    const scrollBtn = $('#scrollTopBtn');
    if (!scrollBtn) return;

    const toggleButton = () => {
        const threshold = window.innerWidth < 768 ? 150 : 300;
        if (window.scrollY > threshold) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    };

    toggleButton();
    window.addEventListener('scroll', toggleButton, {
        passive: true
    });
    window.addEventListener('resize', toggleButton);

    scrollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } catch {
            window.scrollTo(0, 0);
        }
    });
};

/* -----------------------------
   IntersectionObserver — секции
----------------------------- */
const initSectionObserver = () => {
    const sectionObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px',
        }
    );
    $$('.section').forEach(sec => sectionObserver.observe(sec));
};

/* -----------------------------
   Тема (тёмная / светлая)
----------------------------- */
const initTheme = () => {
    const themeToggle = $('#theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        document.body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        if (isLight) {
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-pressed', 'true');
        } else {
            localStorage.removeItem('theme');
            themeToggle.setAttribute('aria-pressed', 'false');
        }
    });

    themeToggle.setAttribute('aria-pressed', document.body.classList.contains('light-theme'));
};

/* -----------------------------
   Canvas фон
----------------------------- */
const initCanvas = () => {
    const canvas = $('#backgroundCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationId = null;

    const PARTICLE_OPACITY = 0.45;
    const LINE_OPACITY = 0.18;
    const BASE_PARTICLE_COUNT = 100;
    const MAX_PARTICLES = 180;
    const MOBILE_MAX_PARTICLES = 80;

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.8;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(25,25,112,${PARTICLE_OPACITY})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const createParticles = (count) => {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    const connectParticles = () => {
        if (particles.length > 200) return;

        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distSq = dx * dx + dy * dy;
                const maxDist = (width + height) * 0.18;
                const maxDistSq = maxDist * maxDist;

                if (distSq < maxDistSq) {
                    ctx.strokeStyle = `rgba(100,200,250,${LINE_OPACITY})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;

        const isMobile = window.innerWidth < 768;
        const maxParticles = isMobile ? MOBILE_MAX_PARTICLES : MAX_PARTICLES;

        const base = Math.max(
            60,
            Math.floor(((width * height) / (1920 * 1080)) * BASE_PARTICLE_COUNT)
        );
        const particleCount = Math.min(maxParticles, base);
        createParticles(particleCount);
    };

    const animate = () => {
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        for (const particle of particles) {
            particle.update();
            particle.draw();
        }

        connectParticles();

        animationId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            if (!animationId) {
                animate();
            }
        }
    };

    window.addEventListener('resize', debounce(resizeCanvas, 200));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeCanvas();
    animate();
};

/* -----------------------------
   Фильтрация проектов с подсчетом
----------------------------- */
const initProjectFilters = () => {
    const filterBtns = $$('.filter-btn');
    const projects = $$('.gallery-item');

    if (!filterBtns.length || !projects.length) return;

    const updateCounters = () => {
        const total = projects.filter(p => !p.classList.contains('coming-soon') || p.dataset.category === 'react').length;
        const htmlCssCount = projects.filter(p => p.dataset.category === 'html-css' && !p.classList.contains('coming-soon')).length;
        const jsCount = projects.filter(p => p.dataset.category === 'javascript' && !p.classList.contains('coming-soon')).length;
        const reactCount = projects.filter(p => p.dataset.category === 'react' || p.classList.contains('coming-soon')).length;

        filterBtns.forEach(btn => {
            const filter = btn.dataset.filter;
            if (filter === 'all') {
                btn.textContent = `Все проекты (${total})`;
            } else if (filter === 'html-css') {
                btn.textContent = `HTML/CSS (${htmlCssCount})`;
            } else if (filter === 'javascript') {
                btn.textContent = `JavaScript (${jsCount})`;
            } else if (filter === 'react') {
                btn.textContent = `React (${reactCount})`;
            }
        });
    };

    const filterProjects = (filterValue) => {
        projects.forEach(project => {
            if (filterValue === 'all') {
                project.style.display = 'flex';
                setTimeout(() => {
                    project.style.opacity = '1';
                    project.style.transform = 'translateY(0)';
                }, 10);
            } else {
                const category = project.dataset.category;
                if (category === filterValue) {
                    project.style.display = 'flex';
                    setTimeout(() => {
                        project.style.opacity = '1';
                        project.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    project.style.opacity = '0';
                    project.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        project.style.display = 'none';
                    }, 300);
                }
            }
        });
    };

    updateCounters();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.dataset.filter;
            filterProjects(filterValue);
        });
    });
};

/* -----------------------------
   Модальное окно проектов
----------------------------- */
const projectData = {
    'Киносайт + Админка': {
        stack: 'HTML, SCSS, JavaScript, Fetch API, LocalStorage',
        contribution: [
            'Дипломный проект на курсе: полноценный кино-портал с админ-панелью',
            'Работа с динамическими данными через Fetch API, хранение состояния в LocalStorage',
            'Реализовал каталог фильмов, карточки, поиск и фильтры',
            'Разработал личный кабинет и админку для управления контентом',
        ],
        result: 'Функциональное приложение с клиентской и административной частями',
    },
    'Адаптивный блог': {
        stack: 'HTML, CSS, Flex/Grid, Адаптивная типографика',
        contribution: [
            'Сверстал макет с pixel-perfect точностью',
            'Реализовал карточки статей, меню, интерактивные элементы',
            'Настроил адаптивность под все устройства',
        ],
        result: 'Чистый и отзывчивый блог',
    },
    'Альтаир Недвижимость - Корпоративный сайт': {
        stack: 'HTML5, CSS3, JavaScript ES6+, RWD, SEO, WebP',
        contribution: [
            'Разработал полноценный корпоративный сайт (6 страниц) для агентства недвижимости',
            'Реализовал динамическую фильтрацию объектов (6 категорий), галерею изображений с навигацией',
            'Создал слайдер отзывов на чистом JS (без библиотек) с автопрокруткой и точками',
            'Добавил формы обратной связи с валидацией, маской телефона и копированием номера',
            'Обеспечил SEO-оптимизацию: мета-теги, Open Graph, микроразметка Schema.org',
            'Реализовал полную адаптивность (mobile-first), поддержку тёмной темы и стили для печати',
            'Оптимизировал изображения (WebP) и разделил JS по страницам (модульная архитектура)'
        ],
        result: 'По отзывам заказчика, удобный интерфейс и фильтрация объектов увеличили количество заявок через сайт.',
    },
    'Bakery — Сайт пекарни': {
        stack: 'HTML, CSS, JavaScript, Анимации',
        contribution: [
            'Разработал адаптивный промо-сайт для пекарни',
            'Добавил галерею и плавные анимации для привлечения внимания',
            'Соблюдал фирменный стиль и визуальные эффекты',
        ],
        result: 'Привлекательный и запоминающийся сайт',
    },
    'ToDo — Планировщик задач': {
        stack: 'HTML, CSS, JavaScript, LocalStorage',
        contribution: [
            'Реализовал полный функционал: добавление, редактирование, удаление задач',
            'Добавил фильтры и отметки выполнения',
            'Настроил сохранение данных в LocalStorage',
        ],
        result: 'Удобный и быстрый планировщик задач',
    },
    'Строительная компания': {
        stack: 'HTML, CSS, JavaScript',
        contribution: [
            'Разработал корпоративный сайт для строительной компании (3 страницы)',
            'Реализовал кнопку «наверх» с динамическим отображением и плавный скролл по якорям',
            'Настроил автоматическое обновление активного состояния меню при скролле',
            'Оптимизировал обработку событий прокрутки для плавной работы на всех устройствах',
        ],
        result: 'Проект поддерживался в течение года, вносились правки и обновления',
    },
};

const initProjectModal = () => {
    const modal = $('#project-modal');
    const modalTitle = $('#modal-title');
    const modalDesc = $('#modal-desc');
    const closeBtn = $('#modal-close');

    if (!modal || !modalTitle || !modalDesc || !closeBtn) return;

    $$('.desc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectName = btn.dataset.title;
            const data = projectData[projectName];
            if (!data) return;

            modalTitle.textContent = projectName;
            modalDesc.innerHTML = `
                <ul>
                    <li><strong>Стек:</strong> ${data.stack}</li>
                    <li><strong>Моя роль:</strong> ${data.contribution.join('; ')}</li>
                    <li><strong>Итог:</strong> ${data.result}</li>
                </ul>
            `;

            modal.classList.add('show');
            document.body.classList.add('modal-open');
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });
};

/* -----------------------------
   Просмотр изображений
----------------------------- */
const initImageViewer = () => {
    const imageLinks = $$('.gallery-item a.image-popup');
    if (!imageLinks.length) return;

    imageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const imgSrc = link.href;
            const imgElement = link.querySelector('img');
            const imgAlt = imgElement ? imgElement.alt : 'Изображение проекта';

            const imageModal = document.createElement('div');
            imageModal.className = 'modal image-modal';
            imageModal.setAttribute('role', 'dialog');
            imageModal.setAttribute('aria-modal', 'true');
            imageModal.setAttribute('aria-label', 'Просмотр изображения');

            imageModal.innerHTML = `
                <div class="modal-content image-modal-content">
                    <button class="modal-close" aria-label="Закрыть">&times;</button>
                    <img src="${imgSrc}" alt="${imgAlt}" style="max-width: 90vw; max-height: 90vh; object-fit: contain;">
                </div>
            `;

            document.body.appendChild(imageModal);
            document.body.classList.add('modal-open');

            const closeBtn = imageModal.querySelector('.modal-close');

            const closeModal = () => {
                imageModal.remove();
                document.body.classList.remove('modal-open');
                document.removeEventListener('keydown', escapeHandler);
            };

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            };

            closeBtn.addEventListener('click', closeModal);
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) closeModal();
            });
            document.addEventListener('keydown', escapeHandler);

            imageModal.classList.add('show');
        });
    });
};

/* -----------------------------
   Отправка формы
----------------------------- */
const initContactForm = () => {
    const form = $('#contactForm');
    if (!form) return;

    const formMessage = form.querySelector('.form-message');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', async(e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const name = (formData.get('name') || '').trim();
        const email = (formData.get('email') || '').trim();
        const message = (formData.get('message') || '').trim();

        if (!name || !email || !message) {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Пожалуйста, заполните все поля.';
            return;
        }

        if (!emailRegex.test(email)) {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Введите корректный email.';
            return;
        }

        try {
            const response = await fetch(form.action, {
                method: form.method || 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData,
            });

            if (response.ok) {
                formMessage.style.color = 'green';
                formMessage.textContent = 'Спасибо за ваше сообщение!';
                form.reset();
            } else {
                let errorMessage = 'Ошибка при отправке. Попробуйте позже.';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        if (data.errors && data.errors.length) {
                            errorMessage = data.errors.map(err => err.message).join(', ');
                        }
                    }
                } catch {
                    // Оставляем стандартное сообщение
                }
                formMessage.style.color = 'red';
                formMessage.textContent = errorMessage;
            }
        } catch (error) {
            console.error('Network error:', error);
            formMessage.style.color = 'red';
            formMessage.textContent = 'Ошибка сети, проверьте подключение и попробуйте позже.';
        }
    });
};

/* -----------------------------
   Копирование email
----------------------------- */
const initCopyEmail = () => {
    const copyBtn = $('.copy-email-btn');
    if (!copyBtn) return;

    const email = $('.email-address') ?.textContent || 'evgen94@bk.ru';
    const copyMessage = $('.copy-message');

    copyBtn.addEventListener('click', async() => {
        try {
            await navigator.clipboard.writeText(email);

            if (copyMessage) {
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 2000);
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
            const textarea = document.createElement('textarea');
            textarea.value = email;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            if (copyMessage) {
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 2000);
            }
        }
    });
};

/* -----------------------------
   Год в футере
----------------------------- */
const initYearFooter = () => {
    const yearSpan = $('#year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
};

/* -----------------------------
   Эффект шапки при скролле
----------------------------- */
const initHeaderScroll = () => {
    const header = $('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    }, {
        passive: true
    });
};

/* -----------------------------
   Инициализация при загрузке DOM
----------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initScrollButton();
    initSectionObserver();
    initTheme();
    initCanvas();
    initProjectFilters();
    initProjectModal();
    initImageViewer();
    initContactForm();
    initCopyEmail();
    initYearFooter();
    initHeaderScroll();

});