// Добавляем плавное появление секций при прокрутке
document.querySelectorAll('.section').forEach(sec => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });
    observer.observe(sec);
});

// Кнопка "вверх" с плавным скроллом
document.getElementById('scrollTopBtn').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Плавное появление header при загрузке
window.addEventListener('load', () => {
    const header = document.querySelector('header');
    setTimeout(() => {
        header.classList.add('visible');
    }, 200);
});

// Настройка canvas для интерактивного фона
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

let width, height;
const particlesCount = 180; // Кол-во частиц
const particles = [];

// Класс частицы
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
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

// Функция создания частиц
function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particlesCount; i++) {
        particles.push(new Particle());
    }
}

// Изменение размера canvas и пересоздание частиц
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
    createParticles();
}

// Вешаем обработчики для resize и load,
// вызываем resize при загрузке и при изменении размера
window.addEventListener('load', resize);
window.addEventListener('resize', resize);
resize();

// Функция соединения частиц линиями
function connectParticles() {
    for (let a = 0; a < particlesCount; a++) {
        for (let b = a + 1; b < particlesCount; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 120) {
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

// Основной цикл анимации
function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
}

// Запуск анимации
animate();

// Подсветка слов в тексте
const words = ["JavaScript", "HTML", "CSS", "API"];
let index = 0;

function highlightNextWord() {
    const textContainer = document.getElementById('text');
    let html = textContainer.innerHTML;

    // Удаляем старые выделения
    html = html.replace(/<span class="highlight">\s*(\w+)\s*<\/span>/gi, '$1');

    // Выделяем слово
    const regex = new RegExp(`\\b(${words[index]})\\b`, 'gi');
    html = html.replace(regex, '<span class="highlight">$1</span>');
    textContainer.innerHTML = html;

    index = (index + 1) % words.length;
}

// Выделяем слова каждые 1.2 секунды
setInterval(highlightNextWord, 1200);

// Инициализация Magnific Popup для галереи изображений
$(document).ready(function() {
    $('.popup-gallery').magnificPopup({
        delegate: 'a.image-popup',
        type: 'image',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
        },
        zoom: {
            enabled: true,
            duration: 300
        },
        image: {
            titleSrc: 'title'
        }
    });
});

// Валидация и отправка формы с сообщениями через Formspree
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const formMessage = form.querySelector('.form-message');
    const formData = new FormData(form);

    // Проверка пустых полей
    for (let [key, value] of formData.entries()) {
        if (!value.trim()) {
            formMessage.style.color = 'red';
            formMessage.textContent = 'Пожалуйста, заполните все поля.';
            return;
        }
    }
    // Проверка email
    const email = formData.get('email');
    if (!email.includes('@')) {
        formMessage.style.color = 'red';
        formMessage.textContent = 'Введите корректный email.';
        return;
    }

    // Отправляем запрос
    fetch(form.action, {
        method: form.method,
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    }).then(response => {
        if (response.ok) {
            formMessage.style.color = 'green';
            formMessage.textContent = 'Спасибо за ваше сообщение!';
            form.reset();
        } else {
            response.json().then(data => {
                if (data.errors) {
                    formMessage.style.color = 'red';
                    formMessage.textContent = data.errors.map(e => e.message).join(', ');
                } else {
                    formMessage.style.color = 'red';
                    formMessage.textContent = 'Произошла ошибка при отправке.';
                }
            });
        }
    }).catch(() => {
        formMessage.style.color = 'red';
        formMessage.textContent = 'Ошибка сети, попробуйте позже.';
    });
});