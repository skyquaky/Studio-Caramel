const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0KvHrRAIZx0Vif93bG8oX2l54Vas0zyWAMEf_qHHFP8os4CYxjmVFmeRZEEfT35o2ig/exec';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Звездная пыль на фоне
    const canvas = document.getElementById('sparkle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 45; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.8 + 0.5,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.6 + 0.2
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 94, 255, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // 2. Вкладки прайса
    const tabBtns = document.querySelectorAll('.tab-btn');
    const pricePanels = document.querySelectorAll('.price-panel');
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach((b) => b.classList.remove('active'));
            pricePanels.forEach((p) => p.classList.remove('active'));
            btn.classList.add('active');
            const activePanel = document.getElementById(`cat-${target}`);
            if (activePanel) activePanel.classList.add('active');
        });
    });

    // 3. Подстановка услуги в форму записи
    const serviceSelect = document.getElementById('service-select');
    document.querySelectorAll('.book-trigger').forEach((btn) => {
        btn.addEventListener('click', () => {
            const serviceName = btn.getAttribute('data-service');
            if (serviceSelect && serviceName) {
                let exists = Array.from(serviceSelect.options).some((opt) => opt.value === serviceName);
                if (!exists) {
                    const newOpt = new Option(serviceName, serviceName);
                    serviceSelect.add(newOpt);
                }
                serviceSelect.value = serviceName;
            }
        });
    });

    // 4. Интерактивная длина ногтей
    const lenPills = document.querySelectorAll('.len-pill');
    const nailZones = document.querySelectorAll('.nail-zone');
    function setActiveLength(len) {
        lenPills.forEach((p) => p.classList.toggle('active', p.getAttribute('data-len') === len));
        nailZones.forEach((z) => z.classList.toggle('active', z.getAttribute('data-len') === len));
    }
    lenPills.forEach((pill) => pill.addEventListener('click', () => setActiveLength(pill.getAttribute('data-len'))));
    nailZones.forEach((zone) => zone.addEventListener('click', () => setActiveLength(zone.getAttribute('data-len'))));

    // 5. Галерея и лайтбокс
    const gTabs = document.querySelectorAll('.g-tab');
    const galleryCards = document.querySelectorAll('.gallery-card');
    gTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-type');
            gTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            galleryCards.forEach((card) => {
                card.style.display = (type === 'all' || card.getAttribute('data-media') === type) ? 'block' : 'none';
            });
        });
    });

    const mediaLightbox = document.getElementById('media-lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const closeLightbox = document.getElementById('close-lightbox');
    galleryCards.forEach((card) => {
        card.addEventListener('click', () => {
            if (!mediaLightbox || !lightboxContent) return;
            const innerVideo = card.querySelector('video');
            const innerImg = card.querySelector('img');
            if (innerVideo) {
                lightboxContent.innerHTML = `<video src="${innerVideo.getAttribute('src')}" controls autoplay playsinline></video>`;
            } else if (innerImg) {
                lightboxContent.innerHTML = `<img src="${innerImg.getAttribute('src')}" alt="Работа студии">`;
            }
            mediaLightbox.classList.add('open');
        });
    });
    if (closeLightbox && mediaLightbox) {
        closeLightbox.addEventListener('click', () => {
            mediaLightbox.classList.remove('open');
            if (lightboxContent) lightboxContent.innerHTML = '';
        });
        mediaLightbox.addEventListener('click', (e) => {
            if (e.target === mediaLightbox) {
                mediaLightbox.classList.remove('open');
                if (lightboxContent) lightboxContent.innerHTML = '';
            }
        });
    }

    // 6. Окно памятки
    const openMemoBtn = document.getElementById('open-memo-btn');
    const memoModal = document.getElementById('memo-modal');
    const closeMemoX = document.getElementById('close-memo-x');
    const memoBookBtn = document.getElementById('memo-book-btn');
    if (openMemoBtn && memoModal) {
        openMemoBtn.addEventListener('click', () => memoModal.classList.add('open'));
        if (closeMemoX) closeMemoX.addEventListener('click', () => memoModal.classList.remove('open'));
        if (memoBookBtn) memoBookBtn.addEventListener('click', () => memoModal.classList.remove('open'));
        memoModal.addEventListener('click', (e) => { if (e.target === memoModal) memoModal.classList.remove('open'); });
    }

    // 7. Прогресс прокрутки
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = `${docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0}%`;
        });
    }

// 8. Мгновенная отправка пуша (совместимо с iPhone/iOS, Android и ПК)
const NTFY_TOPIC = "caramel_5278461551612652435435618765432hgfdrfefdfghghj"; // Впишите ваше точное название темы
const ADMIN_URL = "https://github.io";
const successModal = document.getElementById('success-modal');

document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectEl = form.querySelector('select');
        const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])'));
        const firstInput = inputs.at(0);
        const secondInput = inputs.at(1);

        const name = firstInput ? firstInput.value.trim() : '';
        const phone = secondInput ? secondInput.value.trim() : '';
        const service = selectEl ? selectEl.value : 'Запись с сайта';

        if (!name || !phone) {
            alert('Пожалуйста, заполните имя и телефон');
            return;
        }

        const timeTag = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        // 1. Мгновенный Push в ntfy.sh (Title строго латиницей для 100% доставки на iPhone)
        fetch(`https://ntfy.sh{NTFY_TOPIC}`, {
            method: 'POST',
            headers: {
                'Title': `Studio Caramel (${timeTag})`,
                'Click': ADMIN_URL,
                'Priority': 'max'
            },
            body: `Новая заявка: ${service}\nКлиент: ${name}\nТел: ${phone}`,
            keepalive: true
        }).catch(() => {});

        // 2. Сохранение в базу админки (Google Apps Script)
        const params = new URLSearchParams({
            service: service,
            name: name,
            phone: phone,
            t: Date.now()
        });
        fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, { mode: 'no-cors', keepalive: true }).catch(() => {});

        form.reset();
        if (successModal) {
            successModal.classList.add('open');
        } else {
            alert('Спасибо! Ваша заявка успешно отправлена.');
        }
    });
});

    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => successModal.classList.remove('open'));
    }
});

// Закрытие окна по кнопке «Отлично» (#close-modal-btn) или клику мимо окна
const caramelCloseBtn = document.getElementById('close-modal-btn');
const caramelSuccessModal = document.getElementById('success-modal');

if (caramelCloseBtn && caramelSuccessModal) {
    caramelCloseBtn.addEventListener('click', () => {
        caramelSuccessModal.classList.remove('open');
    });
}
if (caramelSuccessModal) {
    caramelSuccessModal.addEventListener('click', (e) => {
        if (e.target === caramelSuccessModal) {
            caramelSuccessModal.classList.remove('open');
        }
    });
}
