const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0KvHrRAIZx0Vif93bG8oX2l54Vas0zyWAMEf_qHHFP8os4CYxjmVFmeRZEEfT35o2ig/exec';

let savedPass = localStorage.getItem('caramel_admin_pass') || '';
let knownOrderIds = new Set();
let isFirstLoad = true;
let pollTimer = null;

// Запрос к Google Script в обход ограничений браузера (JSONP)
function requestScript(paramsObj) {
    return new Promise((resolve, reject) => {
        const cbName = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const script = document.createElement('script');

        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Таймаут соединения'));
        }, 12000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[cbName] = function(data) {
            cleanup();
            resolve(data);
        };

        const query = Object.keys(paramsObj)
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(paramsObj[k])}`)
            .join('&');

        script.src = `${SCRIPT_URL}?${query}&callback=${cbName}&t=${Date.now()}`;
        script.onerror = () => {
            cleanup();
            reject(new Error('Ошибка загрузки скрипта'));
        };

        document.body.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const adminScreen = document.getElementById('admin-screen');
    const passInput = document.getElementById('pass-input');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const enableNotifyBtn = document.getElementById('enable-notify-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (savedPass) {
        tryLogin(savedPass);
    }

    loginBtn.addEventListener('click', () => {
        const val = passInput.value.trim();
        if (!val) return;
        tryLogin(val);
    });

    passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });

    enableNotifyBtn.addEventListener('click', () => {
        playDingSound();
        if ('Notification' in window) {
            Notification.requestPermission().then((perm) => {
                if (perm === 'granted') {
                    enableNotifyBtn.textContent = '🔔 Уведомления включены';
                    new Notification('Studio Caramel', {
                        body: 'Уведомления о новых заявках успешно включены!'
                    });
                } else {
                    alert('Разрешите уведомления в настройках браузера для этого сайта.');
                }
            });
        }
    });

    refreshBtn.addEventListener('click', () => fetchOrders());

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('caramel_admin_pass');
        savedPass = '';
        clearInterval(pollTimer);
        adminScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    });

    async function tryLogin(password) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Проверяем...';
        loginError.textContent = '';

        try {
            const data = await requestScript({ action: 'list', pass: password });

            if (data.ok) {
                savedPass = password;
                localStorage.setItem('caramel_admin_pass', password);
                loginScreen.style.display = 'none';
                adminScreen.style.display = 'block';
                renderOrders(data.orders || []);

                if ('Notification' in window && Notification.permission === 'granted') {
                    enableNotifyBtn.textContent = '🔔 Уведомления включены';
                }

                clearInterval(pollTimer);
                pollTimer = setInterval(fetchOrders, 10000);
            } else {
                loginError.textContent = data.error || 'Неверный пароль';
                localStorage.removeItem('caramel_admin_pass');
            }
        } catch (err) {
            loginError.textContent = 'Не удалось подключиться. Проверьте, что в Google Script выпущена Новая версия с доступом «Все».';
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Войти';
        }
    }
});

async function fetchOrders() {
    if (!savedPass) return;
    try {
        const data = await requestScript({ action: 'list', pass: savedPass });
        if (data.ok) {
            renderOrders(data.orders || []);
        }
    } catch (e) {
        console.warn('Ошибка автообновления:', e);
    }
}

function renderOrders(orders) {
    const listEl = document.getElementById('orders-list');
    if (!listEl) return;

    orders.forEach((order) => {
        if (!isFirstLoad && !knownOrderIds.has(order.id)) {
            triggerNewOrderAlert(order);
        }
        knownOrderIds.add(order.id);
    });
    isFirstLoad = false;

    if (orders.length === 0) {
        listEl.innerHTML = '<div class="empty-msg">📭 Пока нет ни одной заявки. Как только клиент запишется на сайте, запись сразу появится здесь.</div>';
        return;
    }

    listEl.innerHTML = orders.map((o) => {
        let cardClass = 'status-new';
        let badgeClass = 'b-new';
        if (o.status === 'В работе') { cardClass = 'status-work'; badgeClass = 'b-work'; }
        if (o.status === 'Выполнена') { cardClass = 'status-done'; badgeClass = 'b-done'; }

        return `
            <div class="order-card ${cardClass}">
                <div>
                    <div class="o-meta">Заявка #${o.id} • ${o.date} <span class="badge ${badgeClass}">${o.status}</span></div>
                    <div class="o-service">${escapeHtml(o.service)}</div>
                    <div class="o-client">👤 ${escapeHtml(o.name)} • 📞 <a href="tel:${escapeHtml(o.phone)}">${escapeHtml(o.phone)}</a></div>
                </div>
                <div class="o-actions">
                    ${o.status !== 'В работе' ? `<button class="btn btn-sm btn-accept" onclick="changeOrderStatus('${o.id}', 'В работе')">✅ Принять</button>` : ''}
                    ${o.status !== 'Выполнена' ? `<button class="btn btn-sm btn-done" onclick="changeOrderStatus('${o.id}', 'Выполнена')">🏁 Завершить</button>` : ''}
                    <button class="btn btn-sm btn-del" onclick="changeOrderStatus('${o.id}', 'delete')">🗑 Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

async function changeOrderStatus(id, newStatus) {
    if (newStatus === 'delete' && !confirm('Удалить эту заявку из списка?')) return;

    try {
        await requestScript({ action: 'status', pass: savedPass, id: id, status: newStatus });
        fetchOrders();
    } catch (e) {
        alert('Не удалось обновить статус. Попробуйте еще раз.');
    }
}

function triggerNewOrderAlert(order) {
    playDingSound();
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💅 Новая заявка — Studio Caramel', {
            body: `${order.service}\nКлиент: ${order.name} (${order.phone})`
        });
    }
}

function playDingSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
