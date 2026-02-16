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
   IntersectionObserver — секции
----------------------------- */
const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    }
);

$$('.section').forEach(sec => sectionObserver.observe(sec));

/* -----------------------------
   Лоадер + появление header
----------------------------- */
window.addEventListener('load', () => {
    const loader = $('.loader');
    const header = $('header');

    if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => loader.style.display = 'none', 500);
    }

    if (header) {
        setTimeout(() => header.classList.add('visible'), 300);
    }
});

/* -----------------------------
   Кнопка "Вверх"
----------------------------- */
const scrollBtn = $('#scrollTopBtn');
if (scrollBtn) {
    const toggleScrollBtn = () =>
        scrollBtn.classList.toggle('visible', window.scrollY > 600);

    window.addEventListener('scroll', toggleScrollBtn, {
        passive: true
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

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

    const createParticles = (count = PARTICLES_COUNT) => {
        particles.length = 0;
        for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;

        const base = Math.max(60, Math.floor((width * height) / (1920 * 1080) * 120));
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

    const animate = (timestamp) => {
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

    const handleResize = debounce(resizeCanvas, 200);

    window.addEventListener('resize', handleResize);
    resizeCanvas();
    requestAnimationFrame(animate);
})();

/* -----------------------------------------
   Модальное окно описания проекта (исправлено)
----------------------------------------- */
const projectData = {
    "Киносайт + Админка": {
        stack: "HTML, SCSS, JavaScript, Fetch API, LocalStorage",
        contribution: [
            "Разработал каталог фильмов, систему карточек, поиск и фильтры",
            "Реализовал бронирование билетов и модальные окна",
            "Создал личный кабинет и админ-панель для управления контентом"
        ],
        result: "Готовое мини-кино-приложение с функционалом реального сервиса"
    },
    "Адаптивный блог": {
        stack: "HTML, CSS, Flex/Grid, Адаптивная типографика",
        contribution: [
            "Сверстал макет по pixel-perfect",
            "Создал карточки статей, меню, интерактивные элементы",
            "Обеспечил адаптивность и корректное отображение на всех устройствах"
        ],
        result: "Полностью адаптивный интерфейс блога"
    },
    "Агентство недвижимости": {
        stack: "HTML, CSS, JS, Адаптивная верстка",
        contribution: [
            "Реализовал каталог объектов и фильтры",
            "Добавил формы заявок и интеграцию карты",
            "Оптимизировал изображения и SEO-структуру"
        ],
        result: "Современный, быстрый и удобный сайт для клиента"
    },
    "Bakery — Сайт пекарни": {
        stack: "HTML, CSS, JS, Анимации",
        contribution: [
            "Создал адаптивную верстку",
            "Реализовал галерею и плавные анимации",
            "Сделал акцент на фирменной стилистике"
        ],
        result: "Привлекательный промо-сайт с современным UI"
    },
    "ToDo — Планировщик задач": {
        stack: "HTML, CSS, JavaScript, LocalStorage",
        contribution: [
            "Реализовал добавление, редактирование и удаление задач",
            "Сделал фильтры и отметки о выполнении",
            "Сохраняю данные в LocalStorage"
        ],
        result: "Удобный и быстрый планировщик задач"
    },
    "Строительная компания": {
        stack: "HTML, CSS, JS, Адаптивная верстка",
        contribution: [
            "Разработал структуру услуг и галерею работ",
            "Добавил страницу контактов с картой",
            "Настроил формы обратной связи"
        ],
        result: "Коммерческий проект с чистым UI и удобной структурой"
    }

};

// Функция открытия модалки
document.querySelectorAll(".desc-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const projectName = btn.dataset.title;
        const data = projectData[projectName];
        if (!data) return;

        const modalTitle = document.getElementById("modal-title");
        const modalDesc = document.getElementById("modal-desc");

        modalTitle.textContent = projectName;

        // Чистим и создаём список
        modalDesc.innerHTML = '';
        const stackLi = document.createElement('li');
        stackLi.innerHTML = `<strong>Стек:</strong> ${data.stack}`;
        modalDesc.appendChild(stackLi);

        const contributionLi = document.createElement('li');
        contributionLi.innerHTML = `<strong>Моя роль:</strong> ${data.contribution.join('; ')}`;
        modalDesc.appendChild(contributionLi);

        const resultLi = document.createElement('li');
        resultLi.innerHTML = `<strong>Итог:</strong> ${data.result}`;
        modalDesc.appendChild(resultLi);

        document.getElementById("project-modal").classList.add("show");
        document.body.classList.add("modal-open");
    });
});

// Закрытие модалки
const modal = document.getElementById("project-modal");
document.getElementById("modal-close").addEventListener("click", () => {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
});

// Клик по фону
modal.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
    }
});

// Закрытие по ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
    }
});

/* -----------------------------------------
   MagnificPopup (попап большого изображения)
----------------------------------------- */
if (window.jQuery) {
    (function($) {

        $('.gallery-item').magnificPopup({
            delegate: 'a.image-popup',
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

            callbacks: {
                open: function() {
                    // Делаем крестик, если его почему-то нет
                    if (!$('.mfp-close').length) {
                        $('.mfp-wrap').append('<button title="Закрыть" class="mfp-close">×</button>');
                    }
                }
            }
        });

    })(jQuery);
}


/* -----------------------------
   MagnificPopup
----------------------------- */
if (window.jQuery) {
    (function($) {

        $('.popup-gallery, .gallery-item').magnificPopup({
            delegate: 'a.image-popup',
            type: 'image',

            closeBtnInside: false, // Крестик снаружи
            showCloseBtn: true, // Принудительное включение
            enableEscapeKey: true,

            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1]
            },

            zoom: {
                enabled: true,
                duration: 300
            },

            callbacks: {
                open: function() {
                    // Если кнопка не создалась — создаём вручную
                    if (!$('.mfp-close').length) {
                        $('.mfp-wrap').append('<button class="mfp-close">×</button>');
                    }
                }
            }
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const values = Array.from(formData.values()).map(v => (v || '').toString().trim());

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
                    'Accept': 'application/json'
                },
                body: formData
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
                formMessage.textContent = data && data.errors ?
                    data.errors.map(er => er.message).join(', ') :
                    'Ошибка при отправке.';
            }
        } catch (err) {
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