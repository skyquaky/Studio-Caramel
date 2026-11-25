        const params = new URLSearchParams({
            service: service,
            name: name,
            phone: phone,
            t: Date.now()
        });

        const fullUrl = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

        // Отправка через no-cors (Android Chrome пропускает всегда)
        fetch(fullUrl, { mode: 'no-cors', keepalive: true }).catch(() => {});

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOyojMhww9kUrbwbo1mn9o-EQL_v6Uf6JQJ-FYZ0Un1_7aXZSfgG66-JS5Q-hPYrqdYg/exec';

document.addEventListener('DOMContentLoaded', () => {
    const serviceSelect = document.getElementById('service-select');
    const masterSelect = document.getElementById('master-select');
    const selectServiceBtns = document.querySelectorAll('.select-service-btn');
    const selectMasterBtns = document.querySelectorAll('.select-master-btn');
    const bookingForm = document.getElementById('booking-form');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // 1. Автовыбор услуги при клике в прайсе
    selectServiceBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const serviceName = btn.getAttribute('data-service');
            if (!serviceName || !serviceSelect) return;

            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].value === serviceName) {
                    serviceSelect.selectedIndex = i;
                    break;
                }
            }
        });
    });

    // 2. Автовыбор мастера при клике в карточке мастера
    selectMasterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const masterName = btn.getAttribute('data-master');
            if (!masterName || !masterSelect) return;

            for (let i = 0; i < masterSelect.options.length; i++) {
                if (masterSelect.options[i].value === masterName) {
                    masterSelect.selectedIndex = i;
                    break;
                }
            }
        });
    });

    // 3. Закрытие модального окна
    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('open');
        });
        successModal.addEventListener('click', (event) => {
            if (event.target === successModal) {
                successModal.classList.remove('open');
            }
        });
    }

    // 4. Отправка заявки в Telegram-бота (с учетом выбранного мастера)
    if (bookingForm) {
        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправляем...';

            const master = masterSelect ? masterSelect.value : 'Не выбран';
            const service = encodeURIComponent(`${serviceSelect.value} (Мастер: ${master})`);
            const name = encodeURIComponent(document.getElementById('client-name').value.trim());
            const phone = encodeURIComponent(document.getElementById('client-phone').value.trim());

            const fullUrl = `${GOOGLE_SCRIPT_URL}?service=${service}&name=${name}&phone=${phone}&t=${Date.now()}`;

            const sender = new Image();
            sender.src = fullUrl;

            setTimeout(() => {
                if (successModal) successModal.classList.add('open');
                bookingForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }, 700);
        });
    }

    // 5. Плавное появление блоков при прокрутке
    const animatedItems = document.querySelectorAll(
        '.service-card, .gallery-card, .master-profile-card, .contact-grid, .section-header'
    );
    animatedItems.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    animatedItems.forEach((el) => observer.observe(el));
});
    // 6. Фильтрация галереи (Фото / Видео) и открытие на весь экран
    const gTabs = document.querySelectorAll('.g-tab');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const mediaLightbox = document.getElementById('media-lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');

    gTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            gTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-type');
            galleryCards.forEach((card) => {
                if (filter === 'all' || card.getAttribute('data-media') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    galleryCards.forEach((card) => {
        card.addEventListener('click', () => {
            if (!mediaLightbox || !lightboxContent) return;

            const innerVideo = card.querySelector('video');
            const innerImg = card.querySelector('img');
            const videoSrc = innerVideo ? innerVideo.getAttribute('src') : null;
            const imgSrc = innerImg ? innerImg.getAttribute('src') : null;

            if (videoSrc) {
                lightboxContent.innerHTML = `<video src="${videoSrc}" controls autoplay playsinline></video>`;
            } else if (imgSrc) {
                lightboxContent.innerHTML = `<img src="${imgSrc}" alt="Работа студии" onerror="this.outerHTML='<div style=\\'padding:50px 20px;text-align:center;color:#95869e;\\'>Файл фото еще не загружен в папку images</div>'">`;
            }

            mediaLightbox.classList.add('open');
        });
    });

    function closeLightbox() {
        if (!mediaLightbox || !lightboxContent) return;
        mediaLightbox.classList.remove('open');
        lightboxContent.innerHTML = ''; // Останавливаем видео при закрытии
    }

    if (closeLightboxBtn) {
        closeLightboxBtn.addEventListener('click', closeLightbox);
    }

    if (mediaLightbox) {
        mediaLightbox.addEventListener('click', (e) => {
            if (e.target === mediaLightbox) closeLightbox();
        });
    }
        // 3. Переключение вкладок прайс-листа (с правильной подсветкой активной кнопки)
    const pTabs = document.querySelectorAll('.p-tab');
    const pPanels = document.querySelectorAll('.price-panel');

    pTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            // Убираем фиолетовую подсветку со всех кнопок и скрываем все панели
            pTabs.forEach((t) => t.classList.remove('active'));
            pPanels.forEach((p) => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            // Подсвечиваем нажатую кнопку и показываем нужную панель
            tab.classList.add('active');
            const targetPanel = document.getElementById('cat-' + tab.getAttribute('data-cat'));
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';
            }
        });
    });

    // 8. Неоновая подсветка карточек, следующая за курсором (Spotlight)
    const interactiveCards = document.querySelectorAll('.p-row, .depil-group, .master-profile-card, .hero-card');
    interactiveCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });

    // 9. Атмосферные мерцающие частицы на фоне (пурпурно-золотистая пыльца)
    const canvas = document.getElementById('sparkle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const count = window.innerWidth < 768 ? 22 : 42; // Оптимально для телефона и ПК

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.8 + 0.6,
                dx: (Math.random() - 0.5) * 0.35,
                dy: -Math.random() * 0.45 - 0.15,
                alpha: Math.random() * 0.6 + 0.2,
                color: Math.random() > 0.3 ? '196, 77, 240' : '243, 210, 153' // Фиолетовый и теплый карамельный отблеск
            });
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.dx;
                p.y += p.dy;

                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
    // 10. Управление окном «Памятка перед визитом»
    const openMemoBtn = document.getElementById('open-memo-btn');
    const memoModal = document.getElementById('memo-modal');
    const closeMemoX = document.getElementById('close-memo-x');
    const memoBookBtn = document.getElementById('memo-book-btn');

    if (openMemoBtn && memoModal) {
        openMemoBtn.addEventListener('click', () => {
            memoModal.classList.add('open');
        });

        if (closeMemoX) {
            closeMemoX.addEventListener('click', () => memoModal.classList.remove('open'));
        }

        if (memoBookBtn) {
            memoBookBtn.addEventListener('click', () => memoModal.classList.remove('open'));
        }

        memoModal.addEventListener('click', (e) => {
            if (e.target === memoModal) memoModal.classList.remove('open');
        });
    }
    // 11. Интерактивная подсветка длины ногтей (S, M, L, XL, XXL)
    const lenPills = document.querySelectorAll('.len-pill');
    const nailZones = document.querySelectorAll('.nail-zone');

    function setActiveLength(len) {
        lenPills.forEach((p) => p.classList.toggle('active', p.getAttribute('data-len') === len));
        nailZones.forEach((z) => z.classList.toggle('active', z.getAttribute('data-len') === len));
    }

    lenPills.forEach((pill) => {
        pill.addEventListener('click', () => setActiveLength(pill.getAttribute('data-len')));
    });

    nailZones.forEach((zone) => {
        zone.addEventListener('click', () => setActiveLength(zone.getAttribute('data-len')));
    });
    // 12. Неоновая полоска прогресса прокрутки в шапке
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${percent}%`;
        });
    }
