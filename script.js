// -----------------------------
// Анимации секций 
// -----------------------------
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.2 });

document.querySelectorAll('.section').forEach(sec => observer.observe(sec));


// -----------------------------
// Лоадер + появление header
// -----------------------------
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    const header = document.querySelector('header');

    if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';

        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }

    if (header) {
        setTimeout(() => header.classList.add('visible'), 300);
    }
});


// -----------------------------
// Кнопка "Вверх"
// -----------------------------
const scrollBtn = document.getElementById('scrollTopBtn');
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// -----------------------------
// Тема (тёмная / светлая)
// -----------------------------
const toggleButton = document.getElementById('theme-toggle');
if (toggleButton) {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.contains('light-theme')
            ? localStorage.setItem('theme', 'light')
            : localStorage.removeItem('theme');
    });
}


// -----------------------------
// Canvas — оптимизированный фон
// -----------------------------
const canvas = document.getElementById('backgroundCanvas');
let ctx, width, height;
const particles = [];
let PARTICLES_COUNT = 120; // Оптимальное количество

if (canvas) {
    ctx = canvas.getContext('2d');

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5);
            this.speedY = (Math.random() - 0.5);
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = 'rgba(25, 25, 112, 0.50)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        particles.length = 0;
        for (let i = 0; i < PARTICLES_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
        createParticles();
    }

    window.addEventListener('resize', resize);
    resize();

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = dx * dx + dy * dy;

                if (dist < 11000) {
                    ctx.strokeStyle = 'rgba(100,200,250,0.25)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    }

    animate();
}


// -----------------------------
// Модальное окно для проектов
// -----------------------------
document.querySelectorAll('.desc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = document.getElementById('project-modal');
        if (!modal) return;

        document.getElementById('modal-img').src = btn.dataset.img;
        document.getElementById('modal-title').textContent = btn.dataset.title;
        document.getElementById('modal-desc').textContent = btn.dataset.desc;

        modal.classList.add('active');
    });
});

const modalClose = document.getElementById('modal-close');
const modalWindow = document.getElementById('project-modal');

if (modalClose && modalWindow) {
    modalClose.onclick = () => modalWindow.classList.remove('active');
    modalWindow.onclick = e => {
        if (e.target === modalWindow) modalWindow.classList.remove('active');
    };
}


// -----------------------------
// MagnificPopup (с проверкой jQuery)
// -----------------------------
if (window.jQuery) {
    $('.popup-gallery').magnificPopup({
        delegate: 'a.image-popup',
        type: 'image',
        gallery: { enabled: true, navigateByImgClick: true, preload: [0, 1] },
        zoom: { enabled: true, duration: 300 },
        image: { titleSrc: 'title' }
    });
}


// -----------------------------
// Отправка формы + валидация email
// -----------------------------
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const formMessage = form.querySelector('.form-message');
        const formData = new FormData(form);

        // Проверка пустых полей
        for (let [_, value] of formData.entries()) {
            if (!value.trim()) {
                formMessage.style.color = 'red';
                formMessage.textContent = 'Пожалуйста, заполните все поля.';
                return;
            }
        }

        // Email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Введите корректный email.';
            return;
        }

        // Отправка
        try {
            const res = await fetch(form.action, {
                method: form.method,
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            if (res.ok) {
                formMessage.style.color = 'green';
                formMessage.textContent = 'Спасибо за ваше сообщение!';
                form.reset();
            } else {
                const data = await res.json();
                formMessage.style.color = 'red';
                formMessage.textContent = data.errors
                    ? data.errors.map(e => e.message).join(', ')
                    : 'Ошибка при отправке.';
            }
        } catch {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Ошибка сети, попробуйте позже.';
        }
    });
}


// -----------------------------
// Год в футере
// -----------------------------
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
