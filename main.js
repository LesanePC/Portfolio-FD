/* -----------------------------
   Утилиты
----------------------------- */
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const isVisible = el => !!(el && el.offsetParent !== null);

const debounce = (fn, wait = 150) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
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

window.addEventListener('load', initHeader);

/* -----------------------------
   IntersectionObserver — секции
----------------------------- */
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

/* -----------------------------
   Кнопка "Вверх"
----------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (!scrollBtn) return;

    // Функция показа/скрытия
    const toggleButton = () => {
        // На мобильных показываем раньше
        const threshold = window.innerWidth < 768 ? 150 : 300;

        if (window.scrollY > threshold) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    };

    // Проверяем сразу
    toggleButton();

    // Следим за прокруткой
    window.addEventListener('scroll', toggleButton, {
        passive: true
    });

    // При изменении размера окна пересчитываем порог
    window.addEventListener('resize', toggleButton);

    // Обработчик клика
    scrollBtn.addEventListener('click', function(e) {
        e.preventDefault();

        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } catch (error) {
            // Если smooth не поддерживается
            window.scrollTo(0, 0);
        }
    });
});
/* -----------------------------
   Тема (тёмная / светлая)
----------------------------- */
const themeToggle = $('#theme-toggle');
if (themeToggle) {
    if (!localStorage.getItem('theme')) {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light-theme');
        }
    } else if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        if (isLight) localStorage.setItem('theme', 'light');
        else localStorage.removeItem('theme');
    });
}

/* -----------------------------
   Canvas фон
----------------------------- */
(() => {
    const canvas = $('#backgroundCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const particles = [];
    let PARTICLES_COUNT = 100;
    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 50;

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
            ctx.fillStyle = 'rgba(25,25,112,0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const createParticles = count => {
        particles.length = 0;
        for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;

        const base = Math.max(
            60,
            Math.floor(((width * height) / (1920 * 1080)) * 120)
        );
        PARTICLES_COUNT = Math.min(180, base);
        createParticles(PARTICLES_COUNT);
    };

    const connectParticles = () => {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = dx * dx + dy * dy;
                const maxDist = (width + height) * 0.18;
                if (dist < maxDist * maxDist) {
                    ctx.strokeStyle = 'rgba(100,200,250,0.18)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = timestamp => {
        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;
        if (elapsed < FPS_INTERVAL) {
            requestAnimationFrame(animate);
            return;
        }
        lastTime = timestamp;

        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', debounce(resizeCanvas, 200));
    resizeCanvas();
    requestAnimationFrame(animate);
})();

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
        result: 'По отзывам заказчика, удобный интерфейс и фильтрация объектов увеличили количество заявок через сайт. Положительные отзывы клиентов о работе сайта.'
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

document.querySelectorAll('.desc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const projectName = btn.dataset.title;
        const data = projectData[projectName];
        if (!data) return;

        const modal = $('#project-modal');
        const modalTitle = $('#modal-title');
        const modalDesc = $('#modal-desc');

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

const modal = $('#project-modal');
$('#modal-close').addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
});
modal.addEventListener('click', e => {
    if (e.target === e.currentTarget) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
});

/* -----------------------------
   MagnificPopup
----------------------------- */
if (window.jQuery) {
    (function($) {
        $('.gallery-item a.image-popup').magnificPopup({
            type: 'image',
            closeBtnInside: false,
            showCloseBtn: true,
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1]
            },
            zoom: {
                enabled: true,
                duration: 300
            },
        });
    })(jQuery);
}

/* -----------------------------
   Отправка формы + email валидация
----------------------------- */
(() => {
    const form = $('#contactForm');
    if (!form) return;

    const formMessage = form.querySelector('.form-message');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(form);
        const values = Array.from(formData.values()).map(v =>
            (v || '').toString().trim()
        );

        if (values.some(v => v === '')) {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Пожалуйста, заполните все поля.';
            return;
        }

        const email = formData.get('email') || '';
        if (!emailRegex.test(email)) {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Введите корректный email.';
            return;
        }

        try {
            const res = await fetch(form.action, {
                method: form.method || 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: formData,
            });
            if (res.ok) {
                formMessage.style.color = 'green';
                formMessage.textContent = 'Спасибо за ваше сообщение!';
                form.reset();
            } else {
                let data;
                try {
                    data = await res.json();
                } catch {
                    data = null;
                }
                formMessage.style.color = 'red';
                formMessage.textContent =
                    data && data.errors ?
                    data.errors.map(er => er.message).join(', ') :
                    'Ошибка при отправке.';
            }
        } catch {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Ошибка сети, попробуйте позже.';
        }
    });
})();

/* -----------------------------
   Год в футере
----------------------------- */
(() => {
    const yearSpan = $('#year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
})();