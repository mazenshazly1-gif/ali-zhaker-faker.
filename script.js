// ==========================================
// 1. التحكم بالواجهات والـ Tabs
// ==========================================
let currentActiveInterface = 'study'; 
const alarmAudio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
alarmAudio.loop = true;

// Toast System - نظام رسائل منبثقة موحد
const ToastSystem = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            delete: '🗑️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-content">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">✖</button>
        `;
        
        this.container.appendChild(toast);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    },
    
    success(message, duration) { return this.show(message, 'success', duration); },
    error(message, duration) { return this.show(message, 'error', duration); },
    warning(message, duration) { return this.show(message, 'warning', duration); },
    info(message, duration) { return this.show(message, 'info', duration); },
    delete(message, duration) { return this.show(message, 'delete', duration); }
};

// Theme Manager
const ThemeManager = {
    currentTheme: localStorage.getItem('theme') || 'dark',
    
    init() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateUI();
    },
    
    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'deen') {
            document.documentElement.setAttribute('data-interface', 'deen');
        } else {
            document.documentElement.removeAttribute('data-interface');
        }
        
        this.updateUI();
        updateStreakAndChartSystem();
        
        // Update toggle buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        ToastSystem.success(`تم تفعيل المظهر ${theme === 'dark' ? 'الداكن' : theme === 'light' ? 'الفاتح' : 'الإسلامي'} 🎨`);
    },
    
    updateUI() {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.innerHTML = this.currentTheme === 'light' ? '🌙 المظهر الداكن' : '☀️ المظهر الفاتح';
        }
    },
    
    toggle() {
        const themes = ['dark', 'light', 'deen'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.setTheme(nextTheme);
    }
};

function toggleInterface() {
    if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') {
        ToastSystem.error("🚨 قفشتك! وضع الـ Hardcore شغال.. ممنوع التنقل أو تشتيت نفسك لحد ما الجلسة تخلص!");
        return;
    }
    const studyTab = document.getElementById('studyTab');
    const deenTab = document.getElementById('deenTab');
    const switchBtn = document.getElementById('tabSwitchBtn');
    
    if (currentActiveInterface === 'study') {
        studyTab.style.display = 'none'; deenTab.style.display = 'block'; currentActiveInterface = 'deen';
        document.documentElement.setAttribute('data-interface', 'deen');
        switchBtn.innerText = '📚 واجهة المذاكرة'; switchBtn.classList.add('study-mode-active');
        updateZikrDisplay();
    } else {
        deenTab.style.display = 'none'; studyTab.style.display = 'block'; currentActiveInterface = 'study';
        document.documentElement.removeAttribute('data-interface');
        switchBtn.innerText = '🕋 الواحة الدينية'; switchBtn.classList.remove('study-mode-active');
    }
    updateTimerDisplayUI(); checkNextPrayer(); updateStreakAndChartSystem();
}

function setMode(mode) {
    if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') {
        ToastSystem.warning("🔥 إثبت مكانك! وضع الـ Hardcore متفعل.. مش هتعرف تغير المود دلوقتي!"); return;
    }
    clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false');
    currentMode = mode; localStorage.setItem('timer_currentMode', mode);
    localStorage.removeItem('timer_pausedTimeLeft'); localStorage.setItem('timer_freePausedSeconds', '0');
    
    document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
    const targetedBtn = document.getElementById(`mode-${mode}`); if(targetedBtn) targetedBtn.classList.add('active');
    
    if (mode === 'free') window.secondsElapsed = 0; else window.timeLeft = modeDurations[mode];
    if (document.getElementById("timerMessage")) document.getElementById("timerMessage").innerText = modeMessages[mode]; 
    updateTimerDisplayUI();
}

// Timer Sound Toggle
function toggleTimerSound() {
    const toggle = document.getElementById('timerSoundToggle');
    if (!toggle) return;
    const isEnabled = toggle.classList.toggle('on');
    localStorage.setItem('timerSoundEnabled', isEnabled ? 'true' : 'false');

    // Unlock audio on first enable
    if (isEnabled && !audioUnlocked) {
        unlockAudio();
    }

    ToastSystem.info(isEnabled ? '🔊 صوت العد التنازلي مفعل' : '🔇 صوت العد التنازلي معطل');
}

function updatePomoDuration(value) {
    localStorage.setItem('pomoDuration', value);
    modeDurations['pomodoro'] = parseInt(value) * 60;
    const btn = document.getElementById('mode-pomodoro');
    if (btn) btn.textContent = `⏱️ بومودورو (${value}د)`;
    ToastSystem.success(`تم تحديث مدة البومودورو إلى ${value} دقيقة ⏱️`);
}

// Settings Modal
function openSettingsModal() {
    let modal = document.getElementById('settingsModal');

    // Build modal dynamically if it doesn't exist
    if (!modal) {
        buildSettingsModal();
        modal = document.getElementById('settingsModal');
    }

    if (modal) {
        modal.style.display = 'flex';
        // Update toggle state
        const soundEnabled = localStorage.getItem('timerSoundEnabled') === 'true';
        const toggle = document.getElementById('timerSoundToggle');
        if (toggle) toggle.classList.toggle('on', soundEnabled);
    }
}

function buildSettingsModal() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const soundEnabled = localStorage.getItem('timerSoundEnabled') === 'true';
    const timerSound = localStorage.getItem('timerSound') || 'bell';

    const modalHTML = `<div id="settingsModal" class="settings-modal-overlay" style="display:none;" onclick="if(event.target===this)closeSettingsModal()">
        <div class="settings-modal-content">
            <div class="settings-modal-header">
                <h2>⚙️ الإعدادات</h2>
                <button onclick="closeSettingsModal()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:20px;">✖</button>
            </div>
            <div class="settings-body">
                <div class="settings-section">
                    <h3>المظهر</h3>
                    <div class="theme-selector">
                        <button class="theme-btn ${currentTheme==='dark'?'active':''}" data-theme="dark" onclick="setTheme('dark');closeSettingsModal()">
                            <div class="theme-preview dark-preview"></div><span>🌙 داكن</span>
                        </button>
                        <button class="theme-btn ${currentTheme==='light'?'active':''}" data-theme="light" onclick="setTheme('light');closeSettingsModal()">
                            <div class="theme-preview light-preview"></div><span>☀️ فاتح</span>
                        </button>
                        <button class="theme-btn ${currentTheme==='deen'?'active':''}" data-theme="deen" onclick="setTheme('deen');closeSettingsModal()">
                            <div class="theme-preview deen-preview"></div><span>🕌 إسلامي</span>
                        </button>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>🔊 صوت التايمر</h3>
                    <div class="setting-item">
                        <label>تشغيل صوت العد (Ticking)</label>
                        <div class="app-toggle ${soundEnabled?'on':''}" id="timerSoundToggle" onclick="toggleTimerSoundFromModal(this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label>⏱️ سرعة الصوت</label>
                        <select class="app-select" id="timerSoundInterval" onchange="localStorage.setItem('timerSoundInterval',this.value);ToastSystem.info('تم تحديث سرعة الصوت')">
                            <option value="1000" ${(localStorage.getItem('timerSoundInterval')||'5000')==='1000'?'selected':''}>كل ثانية ⚡</option>
                            <option value="5000" ${(localStorage.getItem('timerSoundInterval')||'5000')==='5000'?'selected':''}>كل 5 ثواني</option>
                            <option value="10000" ${(localStorage.getItem('timerSoundInterval')||'5000')==='10000'?'selected':''}>كل 10 ثواني</option>
                            <option value="30000" ${(localStorage.getItem('timerSoundInterval')||'5000')==='30000'?'selected':''}>كل 30 ثانية</option>
                            <option value="60000" ${(localStorage.getItem('timerSoundInterval')||'5000')==='60000'?'selected':''}>كل دقيقة</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>🔔 صوت نهاية الجلسة</label>
                        <select class="app-select" onchange="localStorage.setItem('timerSound',this.value);ToastSystem.info('تم تحديث صوت النهاية')">
                            <option value="bell" ${timerSound==='bell'?'selected':''}>🔔 جرس</option>
                            <option value="chime" ${timerSound==='chime'?'selected':''}>✨ نغمة</option>
                            <option value="digital" ${timerSound==='digital'?'selected':''}>📳 رقمي</option>
                            <option value="none" ${timerSound==='none'?'selected':''}>🔇 صامت</option>
                        </select>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>عام</h3>
                    <div class="setting-item" style="cursor:pointer;" onclick="exportUserData()">
                        <label>📤 تصدير بياناتي</label><span style="color:var(--text-muted);">›</span>
                    </div>
                    <div class="setting-item" style="cursor:pointer;" onclick="resetXpConfirm()">
                        <label>🔄 إعادة تعيين الـ XP</label><span style="color:var(--text-muted);">›</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function toggleTimerSoundFromModal(toggle) {
    toggle.classList.toggle('on');
    const isOn = toggle.classList.contains('on');
    localStorage.setItem('timerSoundEnabled', isOn ? 'true' : 'false');
    if (isOn && !audioUnlocked) unlockAudio();
    ToastSystem.info(isOn ? '🔊 صوت العد مفعل' : '🔇 صوت العد معطل');
}



function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
}

function setTheme(theme) {
    ThemeManager.setTheme(theme);
}

// ==========================================
// 2. المتغيرات ولوجيك الرتب والـ XP
// ==========================================
let timerInterval;

// ===== Web Audio API - صوت نهاية الجلسة =====

// ===== AUDIO UNLOCK SYSTEM =====
// Web Audio API requires user gesture before playing (Chrome/ Safari/ Firefox policy)
let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    // Initialize and resume AudioContext
    AudioEngine.init();
    if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
        AudioEngine.ctx.resume().then(() => {
            console.log('🔓 AudioContext unlocked and running');
        }).catch(e => console.warn('AudioContext resume failed:', e));
    }

    // Remove listeners - only need first interaction
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
}

// Attach to first user gesture (required by browsers)
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);
document.addEventListener('keydown', unlockAudio);

const AudioEngine = {
    ctx: null,
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch(e) {
            console.warn('Web Audio API not supported');
        }
    },

    playBell() {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t);
        osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        osc.start(t);
        osc.stop(t + 1.5);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, t + 0.2);
        gain2.gain.setValueAtTime(0.2, t + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        osc2.start(t + 0.2);
        osc2.stop(t + 1.5);
    },

    playChime() {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * 0.15);
            gain.gain.setValueAtTime(0.25, t + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 1);
            osc.start(t + i * 0.15);
            osc.stop(t + i * 0.15 + 1);
        });
    },

    playSuccess() {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.1);
            gain.gain.setValueAtTime(0.3, t + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.5);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.5);
        });

        const chord = [523.25, 659.25, 783.99];
        chord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + 0.6);
            gain.gain.setValueAtTime(0.2, t + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 2);
            osc.start(t + 0.6);
            osc.stop(t + 2);
        });
    },

    playDigital() {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, t + i * 0.2);
            gain.gain.setValueAtTime(0.1, t + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.2 + 0.15);
            osc.start(t + i * 0.2);
            osc.stop(t + i * 0.2 + 0.15);
        }
    },

    playXpGain() {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.2);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
    },

    playTick() {
        // Tick sound for timer countdown
        const soundEnabled = localStorage.getItem('timerSoundEnabled') === 'true';
        if (!soundEnabled) return;
        
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
    }
};

function playSessionEndSound() {
    const sound = localStorage.getItem('timerSound') || 'bell';
    if (sound === 'none') return;
    const methodName = 'play' + sound.charAt(0).toUpperCase() + sound.slice(1);
    if (AudioEngine[methodName]) AudioEngine[methodName]();
}

// ===== مدة البومودورو تُقرأ من الإعدادات =====
const _pomoDurMins = parseInt(localStorage.getItem('pomoDuration') || '25');
const modeDurations = { 'heroes': 4 * 60 * 60, 'focus': 2 * 60 * 60, 'pomodoro': _pomoDurMins * 60, 'free': 0 };
const modeMessages = {
    'heroes': "جلسة الأبطال.. 4 ساعات تركيز وطحن! 🔥", 'focus': "ساعتين إنجاز على السريع.. ادخل سخن! ⚡",
    'pomodoro': `${_pomoDurMins} دقيقة طحن وتركيز فائق. ⏱️`, 'free': "العداد الحر شغال بيعد وراك تعبك.. 🔄"
};
let currentMode = localStorage.getItem('timer_currentMode') || 'heroes';
let totalHoursStudied = parseFloat(localStorage.getItem('totalHoursStudied')) || 0.0;
let completedTodosCount = parseInt(localStorage.getItem('completedTodosCount')) || 0;
let totalAzkarCount = parseInt(localStorage.getItem('totalAzkarCount')) || 0;
let userXp = parseFloat(localStorage.getItem('userXp')) || 0.0;

const RANKS = [
    { name: "1. النائم اللي صحي 🥶",      minXp: 0,     maxXp: 150   },
    { name: "2. بيسخن على الماشي ⚡",       minXp: 150,   maxXp: 400   },
    { name: "3. جاد ومركّز 📚",             minXp: 400,   maxXp: 900   },
    { name: "4. مقاوح محترف 🔥",            minXp: 900,   maxXp: 1800  },
    { name: "5. بطل المواجهة ⚔️",           minXp: 1800,  maxXp: 3200  },
    { name: "6. عقل من فئة تانية 🧠",       minXp: 3200,  maxXp: 5000  },
    { name: "7. أيقونة في طريقه 🌟",        minXp: 5000,  maxXp: 8000  },
    { name: "8. ملك المقاوحة 👑",           minXp: 8000,  maxXp: 12000 },
    { name: "9. الأسطورة 🛡️",              minXp: 12000, maxXp: 18000 },
    { name: "10. اللي ذاكر فاكر حقاً ⚡",  minXp: 18000, maxXp: 999999}
];

function addXp(amount) {
    userXp += amount; if(userXp < 0) userXp = 0;
    localStorage.setItem('userXp', userXp.toFixed(1)); updateRankUI();
    
}

function updateRankUI() {
    let currentRank = RANKS[0];
    for (let i = 0; i < RANKS.length; i++) { if (userXp >= RANKS[i].minXp) currentRank = RANKS[i]; }
    if (document.getElementById("rankTitle")) document.getElementById("rankTitle").innerText = currentRank.name;
    if (currentRank.maxXp === 999999) {
        if (document.getElementById("xpText")) document.getElementById("xpText").innerText = `${userXp.toFixed(0)} XP (قـفّلت اللعبة! 🛡️)`;
        if (document.getElementById("xpBarFill")) document.getElementById("xpBarFill").style.width = "100%";
    } else {
        let progress = ((userXp - currentRank.minXp) / (currentRank.maxXp - currentRank.minXp)) * 100;
        if (document.getElementById("xpText")) document.getElementById("xpText").innerText = `${userXp.toFixed(0)} / ${currentRank.maxXp} XP`;
        if (document.getElementById("xpBarFill")) document.getElementById("xpBarFill").style.width = `${progress}%`;
    }
}

// ==========================================
// 3. وضع الـ Hardcore وقفش الغش 🚫
// ==========================================
function toggleHardcoreMode() {
    const checkbox = document.getElementById("hardcoreToggle"); if(!checkbox) return;
    if (localStorage.getItem('timer_isRunning') === 'true') {
        ToastSystem.error("❌ ميبقاش التايمر شغال وتيجي تعدل الوضع!"); checkbox.checked = !checkbox.checked; return;
    }
    localStorage.setItem('hardcoreModeActive', checkbox.checked ? 'true' : 'false'); updateHardcoreUI();
}

window.addEventListener('blur', () => {
    const isRunning = localStorage.getItem('timer_isRunning') === 'true';
    const isHardcore = localStorage.getItem('hardcoreModeActive') === 'true';
    if (isRunning && isHardcore) {
        addXp(-25); alarmAudio.volume = 1.0; alarmAudio.play().catch(e => {});
        if (!document.getElementById('ultimateOverlay')) {
            const overlay = document.createElement('div'); overlay.id = 'ultimateOverlay'; overlay.className = 'hardcore-emergency-ultimate';
            overlay.innerHTML = `<div class="scare-shake" style="text-align:center;"><h1>🚨 قفشتك يا هربان! 🚨</h1><p>اتخصم منك 25 XP فوري.. والإنذار مش هيسكت غير لما ترجع!</p></div>`;
            document.body.appendChild(overlay);
        }
    }
});

window.addEventListener('focus', () => { alarmAudio.pause(); alarmAudio.currentTime = 0; const overlay = document.getElementById('ultimateOverlay'); if (overlay) overlay.remove(); });

document.addEventListener('keydown', (e) => {
    if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') {
        if (e.key === 'F12' || e.key === 'Escape' || (e.ctrlKey && e.shiftKey && e.key === 'I')) { e.preventDefault(); ToastSystem.warning("🔥 وضع الهاردكور قفل عليك الهروب!"); }
    }
});
document.addEventListener('contextmenu', (e) => { if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') e.preventDefault(); });

function updateHardcoreUI() {
    const isHardcore = localStorage.getItem('hardcoreModeActive') === 'true';
    const checkbox = document.getElementById("hardcoreToggle"); if(checkbox) checkbox.checked = isHardcore;
    const pauseBtn = document.getElementById("pauseBtn"); const resetBtn = document.getElementById("resetBtn");
    const isRunning = localStorage.getItem('timer_isRunning') === 'true';
    
    if (isHardcore && isRunning) {
        [pauseBtn, resetBtn].forEach(btn => { if(btn) { btn.disabled = true; btn.style.opacity = "0.2"; btn.style.cursor = "not-allowed"; btn.onclick = () => { btn.style.animation = 'none'; setTimeout(() => btn.style.animation = 'shakeDisabled 0.3s', 10); }; } });
    } else {
        if(pauseBtn) { btnResetOnclick(pauseBtn); } if(resetBtn) { btnResetOnclick(resetBtn); }
    }
}
function btnResetOnclick(btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer"; btn.onclick = null; }

// ==========================================
// 4. الرسوم البيانية والـ Streak وسجل البطولات 📊
// ==========================================
let myChart = null;

function toggleHistoryAccordion() { const content = document.getElementById("historyContent"); if(content) content.style.display = (content.style.display === "none") ? "block" : "none"; }

function saveCurrentDayToHistory() {
    let historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    const todayStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', weekday: 'short' });
    let prayersCount = 0; const completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || {};
    for(let key in completedPrayers) { if(completedPrayers[key]) prayersCount++; }

    const existingIndex = historyLog.findIndex(item => item.date === todayStr);
    const newRecord = { date: todayStr, hours: totalHoursStudied.toFixed(2), todos: completedTodosCount, azkar: totalAzkarCount, prayers: prayersCount };
    if (existingIndex !== -1) historyLog[existingIndex] = newRecord; else historyLog.unshift(newRecord);

    localStorage.setItem('studyHistoryLog', JSON.stringify(historyLog)); renderHistoryLog(); updateStreakAndChartSystem();
}

function renderHistoryLog() {
    const container = document.getElementById("historyLogList"); if(!container) return;
    const historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    if(historyLog.length === 0) { container.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:13px; margin:15px 0;">السجل فاضي.. ابدأ التايمر وسيب الباقي علينا! 🚀</p>`; return; }
    container.innerHTML = historyLog.map(item => `<div class="history-item"><span class="history-date">📅 ${item.date}</span><div class="history-stats"><span>📚 ${item.hours}س</span><span>✅ ${item.todos} مهام</span><span>📿 ${item.azkar} ذكر</span><span>🕋 ${item.prayers}/5 صلوات</span></div></div>`).join('');
}

function clearHistoryLog() { 
    Swal.fire({
        title: '🗑️ مسح سجل البطولات؟',
        text: 'هل أنت متأكد إنك عايز تمسح سجل البطولات بالكامل؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، امسح',
        cancelButtonText: 'إلغاء',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('studyHistoryLog'); 
            renderHistoryLog(); 
            updateStreakAndChartSystem(); 
            ToastSystem.delete("تم مسح سجل البطولات 🗑️");
        }
    });
}

function updateStreakAndChartSystem() {
    const historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    let streak = 0;
    if (historyLog.length > 0) {
        streak = 1;
        for (let i = 0; i < historyLog.length - 1; i++) {
            if (parseFloat(historyLog[i].hours) <= 0) { streak = 0; break; }
            try {
                const d1 = new Date(historyLog[i].date);
                const d2 = new Date(historyLog[i+1].date);
                const diff = Math.round(Math.abs(d2 - d1) / 86400000);
                if (diff === 1 && parseFloat(historyLog[i+1].hours) > 0) streak++;
                else break;
            } catch(e) {
                if (parseFloat(historyLog[i+1].hours) > 0) streak++; else break;
            }
        }
    }
    if(document.getElementById("statStreak")) document.getElementById("statStreak").innerText = `🔥 ${streak}`;

    let labels = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    let dataHours = [0, 0, 0, 0, 0, 0, 0];
    if (historyLog.length > 0) { const last7Days = historyLog.slice(0, 7).reverse(); labels = last7Days.map(item => item.date); dataHours = last7Days.map(item => parseFloat(item.hours)); }

    const ctx = document.getElementById('weeklyChart'); if (!ctx) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || !document.documentElement.getAttribute('data-theme');
    const accentColor = document.documentElement.getAttribute('data-interface') === 'deen' ? '#10b981' : '#a855f7';

    if (myChart) { myChart.destroy(); }
    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ data: dataHours, borderColor: accentColor, backgroundColor: 'rgba(168, 85, 247, 0.06)', borderWidth: 3, tension: 0.3, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: isDark?'#1e293b':'#cbd5e1' }, ticks: { color: isDark?'#94a3b8':'#64748b' }, beginAtZero: true }, x: { grid: { display: false }, ticks: { color: isDark?'#94a3b8':'#64748b' } } } }
    });
}

// ==========================================
// 5. سيستم التايمر المطور والـ Loops
// ==========================================
function updateTimerDisplayUI() {
    const timerDisplay = document.getElementById("timerDisplay"); if (!timerDisplay) return;
    let currentSeconds = (currentMode === 'free') ? (window.secondsElapsed || 0) : (window.timeLeft || modeDurations[currentMode]);
    let h = Math.floor(currentSeconds / 3600); let m = Math.floor((currentSeconds % 3600) / 60); let s = currentSeconds % 60;
    timerDisplay.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    
    // Play tick sound every second if enabled
    if (currentSeconds > 0 && currentSeconds % 60 === 0) { 
        saveCurrentDayToHistory(); 
    }
    if (currentSeconds > 0 && currentSeconds % 1 === 0) {
        AudioEngine.playTick();
    }
}

function handleTimerFinishedComplete() {
    clearInterval(timerInterval);
    localStorage.setItem('timer_isRunning', 'false');
    localStorage.removeItem('timer_pausedTimeLeft');
    localStorage.removeItem('timer_endTime');
    // إعادة ضبط الوقت للمود الحالي عشان التايمر يبدأ من الصح المرة الجاية
    const freshDuration = parseInt(localStorage.getItem('pomoDuration') || '25');
    modeDurations['pomodoro'] = freshDuration * 60;
    window.timeLeft = modeDurations[currentMode];
    updateHardcoreUI();
    updateTimerDisplayUI();
    // تشغيل صوت نهاية الجلسة من الإعدادات
    playSessionEndSound();
    if (localStorage.getItem('hardcoreModeActive') === 'true') { 
        addXp(50); 
        ToastSystem.success("👑 عاااش! خلصت جلسة الـ Hardcore كاملة وأخدت +50 XP بونص!");
    } else { 
        addXp(20); 
    }
    document.body.style.transform = 'scale(1.02)'; setTimeout(() => document.body.style.transform = 'scale(1)', 500);
    saveCurrentDayToHistory();
    if (document.getElementById("timerMessage")) document.getElementById("timerMessage").innerText = "🎉 كفووو! خلصت الجلسة بنجاح، أنت بطل!";
    
    // Show session end modal
    if (typeof showSessionEndModal === 'function') {
        const isHardcore = localStorage.getItem('hardcoreModeActive') === 'true';
        const xp = isHardcore ? 50 : 20;
        setTimeout(() => showSessionEndModal(xp, isHardcore), 300);
    }
}

function startCountdownLoop() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let remaining = parseInt(localStorage.getItem('timer_endTime')) - Math.floor(Date.now() / 1000);
        if (remaining > 0) {
            window.timeLeft = remaining; totalHoursStudied += (1 / 3600); localStorage.setItem('totalHoursStudied', totalHoursStudied.toString());
            if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
            addXp(1 / 60); updateTimerDisplayUI();
        } else { handleTimerFinishedComplete(); }
    }, 1000);
}

function startFreeTimerLoop() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        window.secondsElapsed = Math.floor(Date.now() / 1000) - parseInt(localStorage.getItem('timer_freeStartTime'));
        totalHoursStudied += (1 / 3600); localStorage.setItem('totalHoursStudied', totalHoursStudied.toString());
        if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
        addXp(1 / 60); updateTimerDisplayUI();
    }, 1000);
}

function initTimerSystem() {
    // تحديث مدة البومودورو من الإعدادات عند كل تحميل
    const savedPomoDur = parseInt(localStorage.getItem('pomoDuration') || '25');
    modeDurations['pomodoro'] = savedPomoDur * 60;
    const pomoBtn = document.getElementById('mode-pomodoro');
    if (pomoBtn) pomoBtn.textContent = `⏱️ بومودورو (${savedPomoDur}د)`;

    document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
    const targetedBtn = document.getElementById(`mode-${currentMode}`);
    if (targetedBtn) targetedBtn.classList.add('active');

    const isRunning = localStorage.getItem('timer_isRunning') === 'true';

    if (isRunning) {
        if (currentMode === 'free') {
            const freeStart = parseInt(localStorage.getItem('timer_freeStartTime'));
            if (!isNaN(freeStart)) {
                window.secondsElapsed = Math.floor(Date.now() / 1000) - freeStart;
                startFreeTimerLoop();
            } else {
                // بيانات تالفة — نصفر ونبدأ من أول
                localStorage.setItem('timer_isRunning', 'false');
                window.secondsElapsed = 0;
                updateTimerDisplayUI();
            }
        } else {
            const endTime = parseInt(localStorage.getItem('timer_endTime'));
            const remaining = endTime - Math.floor(Date.now() / 1000);
            if (!isNaN(endTime) && remaining > 0) {
                window.timeLeft = remaining;
                startCountdownLoop();
            } else {
                // الوقت خلص أو البيانات تالفة
                handleTimerFinishedComplete();
            }
        }
    } else {
        if (currentMode === 'free') {
            window.secondsElapsed = parseInt(localStorage.getItem('timer_freePausedSeconds')) || 0;
        } else {
            // الأولوية: وقت موقف → وقت المود الأصلي
            const pausedTime = localStorage.getItem('timer_pausedTimeLeft');
            window.timeLeft = (pausedTime && parseInt(pausedTime) > 0)
                ? parseInt(pausedTime)
                : modeDurations[currentMode];
        }
        updateTimerDisplayUI();
    }
    updateHardcoreUI();
}

// ==========================================
// 6. مواقيت الصلاة والواحة الدينية (يدعم العمل بدون إنترنت Offline)
// ==========================================
let prayerTimesData = JSON.parse(localStorage.getItem('cachedPrayerTimes')) || {};
const prayerNamesArabic = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
let completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };

function convertTo12HourFormat(timeStr) { 
    if(!timeStr) return "--:--"; 
    let [hours, minutes] = timeStr.split(':').map(Number); 
    let ampm = hours >= 12 ? 'م' : 'ص'; 
    hours = hours % 12 || 12; 
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`; 
}

function updatePrayersAnalyticsUI() {
    for (const key in completedPrayers) {
        const checkbox = document.getElementById(`check-${key}`); 
        const row = document.getElementById(`p-${key}`);
        if(checkbox && row) { 
            checkbox.checked = completedPrayers[key]; 
            if(completedPrayers[key]) row.classList.add("completed-prayer"); else row.classList.remove("completed-prayer"); 
        }
    }
}

function togglePrayerDone(prayerKey) {
    const checkbox = document.getElementById(`check-${prayerKey}`); 
    if (!checkbox || checkbox.disabled) return;
    completedPrayers[prayerKey] = checkbox.checked; 
    localStorage.setItem('completedPrayers', JSON.stringify(completedPrayers));
    updatePrayersAnalyticsUI(); 
    saveCurrentDayToHistory();
    
    if (checkbox.checked) {
        ToastSystem.success(`تم تسجيل صلاة ${prayerNamesArabic[prayerKey]} ✅`);
    }
}

function checkNextPrayer() {
    if (!prayerTimesData || Object.keys(prayerTimesData).length === 0) {
        if (document.getElementById("nextPrayerCountdown")) {
            document.getElementById("nextPrayerCountdown").innerText = "برجاء الاتصال بالنت لمرة واحدة لتحديث المواقيت 🌐";
        }
        return;
    }
    
    const now = new Date(); 
    let minDiff = Infinity; 
    let nextPrayerKey = "";
    
    document.querySelectorAll('.prayer-row').forEach(row => { 
        if (!row.classList.contains('completed-prayer')) row.classList.remove('next-active', 'prayer-available'); 
    });
    
    for (const [key, val] of Object.entries(prayerTimesData)) {
        if(document.getElementById(`time-${key}`)) document.getElementById(`time-${key}`).innerText = convertTo12HourFormat(val);
    }
    
    for (const [key, timeStr] of Object.entries(prayerTimesData)) {
        const [hours, minutes] = timeStr.split(':').map(Number); 
        const prayerTime = new Date(); 
        prayerTime.setHours(hours, minutes, 0, 0);
        let diff = prayerTime - now; 
        const checkbox = document.getElementById(`check-${key}`); 
        const row = document.getElementById(`p-${key}`);
        
        if (now >= prayerTime) { 
            if (checkbox) checkbox.disabled = false; 
            if (row && !completedPrayers[key]) row.classList.add('prayer-available'); 
        } else { 
            if (checkbox) { checkbox.disabled = true; checkbox.checked = false; } 
            completedPrayers[key] = false; 
        }
        
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextPrayerKey = key; }
    }
    
    updatePrayersAnalyticsUI();
    
    if (nextPrayerKey === "") { 
        nextPrayerKey = "Fajr"; 
        const [hours, minutes] = prayerTimesData.Fajr.split(':').map(Number); 
        const prayerTime = new Date(); 
        prayerTime.setDate(prayerTime.getDate() + 1); 
        prayerTime.setHours(hours, minutes, 0, 0); 
        minDiff = prayerTime - now; 
    }
    
    const activeRow = document.getElementById(`p-${nextPrayerKey}`); 
    if (activeRow && !completedPrayers[nextPrayerKey]) activeRow.classList.add('next-active');
    
    let totalSeconds = Math.floor(minDiff / 1000); 
    let h = Math.floor(totalSeconds / 3600); 
    let m = Math.floor((totalSeconds % 3600) / 60);
    
    if (document.getElementById("nextPrayerCountdown")) document.getElementById("nextPrayerCountdown").innerText = `متبقي على ${prayerNamesArabic[nextPrayerKey]}: ${h}س و ${m}د`;
    const _pBadge = `🕋 ${prayerNamesArabic[nextPrayerKey]}: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const _hb = document.getElementById("headerPrayerCountdown"); if(_hb) _hb.innerText = _pBadge;
    const _ab = document.getElementById("appPrayerBadge"); if(_ab) _ab.textContent = _pBadge;
}

async function fetchPrayerTimes(city) {
    const selectEl = document.getElementById("citySelect");
    if(selectEl) selectEl.value = city;

    try { 
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Egypt&method=5`); 
        const data = await response.json(); 
        if (data.code === 200) { 
            prayerTimesData = { 
                Fajr: data.data.timings.Fajr, 
                Dhuhr: data.data.timings.Dhuhr, 
                Asr: data.data.timings.Asr, 
                Maghrib: data.data.timings.Maghrib, 
                Isha: data.data.timings.Isha 
            }; 
            localStorage.setItem('cachedPrayerTimes', JSON.stringify(prayerTimesData));
            checkNextPrayer(); 
            ToastSystem.success("تم تحديث مواقيت الصلاة بنجاح 🕌");
        } 
    } catch (e) {
        console.log("تعذر الاتصال بالـ API، جاري العمل بالبيانات المحفوظة أوفلاين...");
        ToastSystem.info("تعذر الاتصال بالإنترنت - جاري العمل بالبيانات المحفوظة 📴");
        checkNextPrayer();
    }
}

function changeCity() { 
    const city = document.getElementById("citySelect").value; 
    localStorage.setItem("savedCity", city); 
    fetchPrayerTimes(city); 
}

function requestNotificationPermission() { 
    if ("Notification" in window) { 
        Notification.requestPermission().then(perm => { 
            if (perm === "granted") { 
                const btn = document.getElementById("notifBtn"); 
                if(btn) { 
                    btn.innerText = "تم تفعيل الإشعارات بنجاح 🟢"; 
                    btn.classList.add("activated"); 
                }
                ToastSystem.success("تم تفعيل إشعارات الأذان بنجاح 🔔");
            } else {
                ToastSystem.warning("تم رفض الإشعارات - يمكنك تفعيلها لاحقاً من الإعدادات ⚠️");
            }
        }); 
    } 
}

// ==========================================
// 7. الأذكار والسبحة الإلكترونية
// ==========================================
let currentSection = 'sabah'; let currentZikrIndex = 0; let zikrCounter = 0; let currentRotation = 0;
const azkarData = {
    sabah: ["أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", "اللّهُ لاَ إِلَـهَ إِلاَّ هو الْحَيُّ الْقَيُّومُ", "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ"],
    maseh: ["أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ"],
    free: ["سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", "لَا إِلَهَ إِلَّا اللَّه وَحْدَهُ لَا شَرِيكَ لَهُ"]
};

function switchAzkarSection(secName) {
    currentSection = secName; currentZikrIndex = 0; zikrCounter = 0;
    document.querySelectorAll('.btn-azkar-section').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`sec-${secName}`); if(activeBtn) activeBtn.classList.add('active');
    if(document.getElementById("freeZikrSelectorContainer")) document.getElementById("freeZikrSelectorContainer").style.display = secName === 'free' ? 'block' : 'none';
    updateZikrDisplay();
}

function changeFreeZikr() { currentZikrIndex = parseInt(document.getElementById("freeZikrSelect").value); zikrCounter = 0; updateZikrDisplay(); }

function countZikr() {
    zikrCounter++; totalAzkarCount++; if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter;
    localStorage.setItem('totalAzkarCount', totalAzkarCount); if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    addXp(0.5); saveCurrentDayToHistory();
    const circle = document.getElementById("beadsCircle"); if(circle) { currentRotation += 25; circle.style.transform = `rotate(${currentRotation}deg)`; circle.classList.add("pulsing"); setTimeout(() => circle.classList.remove("pulsing"), 150); }
    
    
    // Toast every 10 counts
    if (zikrCounter % 10 === 0) {
        ToastSystem.info(`📿 ${zikrCounter} تسبيحات! استمر يا بطل`);
    }
}

function updateZikrDisplay() { if(document.getElementById("azkarDisplay")) document.getElementById("azkarDisplay").innerText = azkarData[currentSection][currentZikrIndex]; if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter; }

function nextZikr() { 
    currentZikrIndex = (currentZikrIndex + 1) % azkarData[currentSection].length; 
    zikrCounter = 0; 
    updateZikrDisplay(); 
    ToastSystem.info("الذكر التالي ↩️");
}

function resetZikrCounter() { 
    zikrCounter = 0; 
    if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter; 
    ToastSystem.delete("تم تصفير السبحة 🔄");
}

// ==========================================
// 8. الورد القرآني اليومي وقائمة المهام
// ==========================================
let globalStartPage = 1;

function generateQuranPlan() {
    const targetPages = parseInt(document.getElementById("quranTargetSelect")?.value || 2); const dayOfMonth = new Date().getDate();
    globalStartPage = ((dayOfMonth * 7) % 580) + 1; let endPage = globalStartPage + targetPages - 1;
    if(document.getElementById("quranSuggestionBox")) document.getElementById("quranSuggestionBox").innerHTML = `<h3>وردك للنهاردة بركة يومك ✨</h3><p>قراءة من صفحة ${globalStartPage} إلى صفحة ${endPage}</p>`;
    const btn = document.getElementById("btnCompleteQuran"); const card = document.querySelector(".quran-card");
    if (localStorage.getItem('quran_completed_date') === new Date().toDateString()) { if(card) card.classList.add("completed"); if(btn) btn.innerText = "أنجزت ورد اليوم! 🟢"; }
    else { if(card) card.classList.remove("completed"); if(btn) btn.innerText = "تم قراءة ورد اليوم بنجاح 🎉"; }
}

function openQuranModal() { const modal = document.getElementById("quranModal"); const iframe = document.getElementById("quranIframe"); if(modal && iframe) { iframe.src = `https://quran.com/page/${globalStartPage}`; modal.style.display = "flex"; } }

function closeQuranModal() { if(document.getElementById("quranModal")) document.getElementById("quranModal").style.display = "none"; }

function toggleQuranDone() {
    const todayStr = new Date().toDateString(); const btn = document.getElementById("btnCompleteQuran"); const card = document.querySelector(".quran-card");
    if (localStorage.getItem('quran_completed_date') !== todayStr) { 
        localStorage.setItem('quran_completed_date', todayStr); 
        card?.classList.add("completed"); 
        if(btn) btn.innerText = "أنجزت ورد اليوم! 🟢"; 
        addXp(30); 
        ToastSystem.success("تم إنجاز ورد اليوم بنجاح! +30 XP 🎉");
    }
    else { 
        localStorage.removeItem('quran_completed_date'); 
        card?.classList.remove("completed"); 
        if(btn) btn.innerText = "تم قراءة ورد اليوم بنجاح 🎉"; 
        addXp(-30); 
        ToastSystem.warning("تم إلغاء إنجاز ورد اليوم ⚠️");
    }
    saveCurrentDayToHistory();
}

// ==========================================
// 9. إدارة المهام (To-Do List)
// ==========================================
function saveTodos() {
    const todos = []; completedTodosCount = 0;
    document.querySelectorAll('.todo-item').forEach(item => { const isDone = item.classList.contains('completed'); todos.push({ text: item.querySelector('.todo-text').innerText, completed: isDone }); if (isDone) completedTodosCount++; });
    localStorage.setItem('savedTodos', JSON.stringify(todos)); localStorage.setItem('completedTodosCount', completedTodosCount);
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    saveCurrentDayToHistory();
}

function createTodoElement(text, isCompleted) {
    const todoList = document.getElementById("todoList"); if (!todoList) return; const li = document.createElement("li"); li.className = `todo-item ${isCompleted ? 'completed' : ''}`;
    li.innerHTML = `<span class="todo-text">${text}</span><div style="display:flex; gap:8px;"><button class="btn-done-todo" onclick="toggleTodo(this)">${isCompleted ? 'أنجزت 🎉' : 'إنجاز ✓'}</button><button onclick="deleteTodo(this)" style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#ef4444; padding:8px 12px; border-radius:6px; cursor:pointer;">حذف 🗑️</button></div>`;
    todoList.appendChild(li);
}

function toggleTodo(btn) { 
    const item = btn.parentElement.parentElement; 
    const wasCompleted = item.classList.contains("completed"); 
    item.classList.toggle("completed"); 
    addXp(wasCompleted ? -10 : 10); 
    btn.innerText = item.classList.contains("completed") ? "أنجزت 🎉" : "إنجاز ✓"; 
    saveTodos(); 
    
    if (!wasCompleted) {
        ToastSystem.success("تم إنجاز المهمة! +10 XP ✅");
    }
}

function deleteTodo(btn) {
    const item = btn.parentElement.parentElement;
    item.remove();
    saveTodos();
    ToastSystem.delete("تم حذف المهمة 🗑️");
}

// ==========================================
// 10. التهيئة الشاملة والأكواد العشوائية
// ==========================================
const quotes = [
    "«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ».. اعمل اللي عليك وسيب الباقي على الله. ✨",
    "طلب العلم صراع نَفَس طويل وجَلد. عافر عشان فرحة النجاح! 👑",
    "«إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا».. كل ساعة سهر وتعب محسوبة ومكتوبة. 📈",
    "الـ Code مش بيشتغل من أول مرة، وكذلك أحلامنا محتاجة Debugging ومحاولة تانية! 💻⚡",
    "خطوة صغيرة كل يوم بتعمل إنجاز مرعب بعد فترة.. استمر يا بطل. 🚀",
    "مفيش حلم بييجي بالساهل، اتعب النهاردة عشان ترتاح وتفرح بكرة. 🎓✨",
    "افتكر دايماً إنت بدأت ليه.. ومتقفش في نص الطريق وأنت خلاص قربت! 🏁",
    "الذكاء لوحده مش كفاية، الاستمرارية هي اللي بتصنع المهندسين المحترفين. 🛠️",
    "كل سطر كود بتكتبه، وكل صفحة بتذاكرها هي طوبة في جدار مستقبلك الكبير. 🧱💡",
    "ركز في ورقتك وفي هدفك، متقارنش نفسك بغيرك.. رحلتك ملكك لوحدك. 🌟",
    "تعب السعي هيروح، بس شرف الوصول وفرحته هيفضلوا عايشين معاك العمر كله. 🔥",
    "الخوف مش هيحميك من الفشل، بس السعي والتوكل هما السلاح اللي هيوصلك. ⚔️",
    "امسح الـ Error وكمل.. مفيش مشكلة ملهاش حل، لا في البرمجة ولا في المذاكرة! 🛠️",
    "الحلم اللي بتتمناه وبتدعي بيه يستاهل تضحي عشانه بنوم أو بـ تشتيت. 🕋👑",
    "اليوم اللي بيعدي من غير إنجاز هو فرصة ضاعت.. املأ يومك بالبطولات. 🏆"
];

function displayCurrentDate() { if(document.getElementById("dateBar")) document.getElementById("dateBar").innerHTML = `اليوم: <span>${new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>`; }

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Toast System
    ToastSystem.init();
    
    // Initialize Theme Manager
    ThemeManager.init();
    
    // ===== Daily Reset =====
    const todayKey = new Date().toDateString();
    if (localStorage.getItem('lastOpenDate') !== todayKey) {
        const savedTodos = JSON.parse(localStorage.getItem('savedTodos')) || [];
        localStorage.setItem('savedTodos', JSON.stringify(savedTodos.filter(t => !t.completed)));
        localStorage.setItem('completedPrayers', JSON.stringify({Fajr:false,Dhuhr:false,Asr:false,Maghrib:false,Isha:false}));
        completedPrayers = {Fajr:false,Dhuhr:false,Asr:false,Maghrib:false,Isha:false};
        localStorage.removeItem('sfLastDecision');
        localStorage.removeItem('sfLastDecisionPrayer');
        localStorage.setItem('completedTodosCount', '0');
        completedTodosCount = 0;
        localStorage.setItem('lastOpenDate', todayKey);
        
        ToastSystem.info("تم تحديث يوم جديد! 🌅");
    }
    // ===== نهاية Daily Reset =====
    displayCurrentDate(); if(document.getElementById("quoteDisplay")) document.getElementById("quoteDisplay").innerText = quotes[Math.floor(Math.random() * quotes.length)]; updateRankUI(); renderHistoryLog();
    document.querySelectorAll('.prayer-row').forEach(row => { row.addEventListener('click', (e) => { if(e.target.type !== 'checkbox') { const chk = row.querySelector('input[type="checkbox"]'); if(chk && !chk.disabled) { chk.checked = !chk.checked; togglePrayerDone(chk.id.replace('check-', '')); } } }); });
    
    // ربط زرار كمل يا بطل الذكي لمنع تكرار نفس العبارة ورا بعض 🚀
    document.getElementById("quoteBtn")?.addEventListener("click", () => {
        const displayEl = document.getElementById("quoteDisplay");
        if (displayEl) {
            const currentQuote = displayEl.innerText;
            let nextQuote = currentQuote;
            
            // حلقة تكرار تضمن عدم اختيار نفس العبارة الحالية مطلقاً
            while (nextQuote === currentQuote) {
                nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
            }
            displayEl.innerText = nextQuote;
        }
    });

    document.getElementById("startBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') === 'true') return;
        if (localStorage.getItem('hardcoreModeActive') === 'true') { const de = document.documentElement; if (de.requestFullscreen) de.requestFullscreen(); else if (de.webkitRequestFullscreen) de.webkitRequestFullscreen(); }
        localStorage.setItem('timer_isRunning', 'true'); const now = Math.floor(Date.now() / 1000);
        if (currentMode === 'free') { localStorage.setItem('timer_freeStartTime', (now - (window.secondsElapsed || 0)).toString()); startFreeTimerLoop(); }
        else { if (!window.timeLeft) window.timeLeft = modeDurations[currentMode]; localStorage.setItem('timer_endTime', (now + window.timeLeft).toString()); localStorage.removeItem('timer_pausedTimeLeft'); startCountdownLoop(); }
        updateHardcoreUI();
        ToastSystem.success("ابدأت الجلسة! ركز وتوكل على الله 🎯");
    });
    
    document.getElementById("pauseBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') !== 'true' || localStorage.getItem('hardcoreModeActive') === 'true') return;
        clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false');
        if (currentMode === 'free') localStorage.setItem('timer_freePausedSeconds', window.secondsElapsed.toString()); else localStorage.setItem('timer_pausedTimeLeft', window.timeLeft.toString());
        ToastSystem.info("تم إيقاف الجلسة مؤقتاً ⏸️");
    });
    
    document.getElementById("resetBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') return;
        clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false'); localStorage.removeItem('timer_pausedTimeLeft'); localStorage.setItem('timer_freePausedSeconds', '0');
        if (currentMode === 'free') window.secondsElapsed = 0; else window.timeLeft = modeDurations[currentMode];
        updateTimerDisplayUI();
        ToastSystem.warning("تم إعادة ضبط التايمر 🔄");
    });
    
    document.getElementById("todoBtn")?.addEventListener("click", () => { 
        const inp = document.getElementById("todoInput"); 
        if(inp && inp.value.trim() !== "") { 
            createTodoElement(inp.value.trim(), false); 
            inp.value = ""; 
            saveTodos(); 
            ToastSystem.success("تم إضافة المهمة بنجاح ✅");
        } 
    });
    
    const saved = JSON.parse(localStorage.getItem('savedTodos')) || []; saved.forEach(t => createTodoElement(t.text, t.completed));
    if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
    if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    
    switchAzkarSection('sabah'); generateQuranPlan(); fetchPrayerTimes(localStorage.getItem("savedCity") || "Cairo"); initTimerSystem();
    
    setInterval(checkNextPrayer, 60000);
    
    // Show welcome toast
    const userName = localStorage.getItem('app_username') || 'بطل';
    setTimeout(() => {
        ToastSystem.success(`أهلاً بيك يا ${userName}! جاهز للمقاوحة؟ 🚀`);
    }, 1000);
});

const savedTheme = localStorage.getItem('theme') || 'dark'; 
document.documentElement.setAttribute('data-theme', savedTheme);
const initialBtnText = savedTheme === 'light' ? '🌙 المظهر الداكن' : '☀️ المظهر الفاتح';
if(document.getElementById('themeToggleBtn')) document.getElementById('themeToggleBtn').innerHTML = initialBtnText;

function toggleTheme() {
    ThemeManager.toggle();
}

window.addEventListener('beforeunload', (e) => {
    if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') {
        e.preventDefault();
        e.returnValue = '🔥 جلسة Hardcore شغالة! لو خرجت هتخسر تقدمك.';
        return e.returnValue;
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker Registered بنجاح! 🚀', reg.scope);
                ToastSystem.success("تم تسجيل Service Worker بنجاح! 📱");
            })
            .catch(err => {
                console.log('فشل تسجيل الـ SW:', err);
                ToastSystem.error("فشل تسجيل Service Worker ⚠️");
            });
    });
}

// ==========================================
// 11. Picasso Notes - تطوير كامل
// ==========================================

// PDF Export for Picasso Notes
function exportPicassoAsPDF(noteId) {
    const note = picassoNotesList.find(n => n.id === noteId);
    if (!note) {
        ToastSystem.error("لم يتم العثور على الملاحظة ❌");
        return;
    }
    
    // Create a temporary canvas to combine text and drawing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set canvas size
    tempCanvas.width = 800;
    tempCanvas.height = 1000;
    
    // Fill background
    tempCtx.fillStyle = '#f7f4eb';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Add title
    tempCtx.fillStyle = '#1e293b';
    tempCtx.font = 'bold 24px Cairo, sans-serif';
    tempCtx.textAlign = 'right';
    tempCtx.fillText(note.title || 'ملاحظة بدون عنوان', tempCanvas.width - 40, 50);
    
    // Add date
    tempCtx.font = '14px Cairo, sans-serif';
    tempCtx.fillStyle = '#94a3b8';
    tempCtx.fillText(note.date || new Date().toLocaleDateString('ar-EG'), tempCanvas.width - 40, 80);
    
    // Add text content
    tempCtx.fillStyle = '#1e293b';
    tempCtx.font = '16px Cairo, sans-serif';
    const textLines = (note.textContent || '').split('\n');
    let y = 120;
    textLines.forEach(line => {
        if (y < tempCanvas.height - 40) {
            tempCtx.fillText(line, tempCanvas.width - 40, y);
            y += 25;
        }
    });
    
    // Add drawing if exists
    if (note.canvasDrawing) {
        const img = new Image();
        img.onload = function() {
            tempCtx.drawImage(img, 40, y + 20, tempCanvas.width - 80, 400);
            
            // Convert to PDF using jsPDF
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(tempCanvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 250);
                pdf.save(`picasso-note-${noteId}.pdf`);
                ToastSystem.success("تم تصدير الملاحظة كـ PDF بنجاح 📄");
            } catch (e) {
                // Fallback: download as image
                const link = document.createElement('a');
                link.download = `picasso-note-${noteId}.png`;
                link.href = tempCanvas.toDataURL();
                link.click();
                ToastSystem.success("تم تصدير الملاحظة كـ صورة بنجاح 🖼️");
            }
        };
        img.src = note.canvasDrawing;
    } else {
        // No drawing, just text
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(tempCanvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 250);
            pdf.save(`picasso-note-${noteId}.pdf`);
            ToastSystem.success("تم تصدير الملاحظة كـ PDF بنجاح 📄");
        } catch (e) {
            const link = document.createElement('a');
            link.download = `picasso-note-${noteId}.png`;
            link.href = tempCanvas.toDataURL();
            link.click();
            ToastSystem.success("تم تصدير الملاحظة كـ صورة بنجاح 🖼️");
        }
    }
}

// Enhanced Picasso Auto-save
function startAutoSaveTimer() {
    stopAutoSaveTimer();
    autoSaveInterval = setInterval(() => {
        if (!activePicassoId) return;
        const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
        if (index === -1) return;

        picassoNotesList[index].title = document.getElementById('picassoTitleInput').value.trim() || 'ملخص بدون عنوان';
        picassoNotesList[index].textContent = pTextArea.innerHTML; 
        picassoNotesList[index].isRuled = pTextArea.classList.contains('ruled-paper');

        if (picassoNotesList[index].isPdf) {
            pdfPagesRenderedStates[`page_${currentPdfPageNum}`] = pCanvas.toDataURL();
            picassoNotesList[index].pdfStates = pdfPagesRenderedStates;
        } else {
            picassoNotesList[index].canvasDrawing = pCanvas.toDataURL();
        }

        try {
            saveToLocalStorage();
            // Silent save - no toast to avoid distraction
            console.log('📌 تم الحفظ التلقائي الصامت...');
        } catch (e) {
            console.warn('⚠️ الذاكرة ممتلئة، يتم حفظ الهيكل الأساسي والنص بنجاح.');
            ToastSystem.warning("الذاكرة ممتلئة - جاري حفظ النص فقط ⚠️");
        }
    }, 4000); 
}

// Enhanced Save with Toast
function savePicassoNote() {
    if (!activePicassoId) return;
    const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
    if (index === -1) return;

    picassoNotesList[index].title = document.getElementById('picassoTitleInput').value.trim() || 'ملاحظة بدون عنوان';
    picassoNotesList[index].textContent = pTextArea.innerHTML;
    picassoNotesList[index].isRuled = pTextArea.classList.contains('ruled-paper');
    
    if (picassoNotesList[index].isPdf) {
        pdfPagesRenderedStates[`page_${currentPdfPageNum}`] = pCanvas.toDataURL();
        picassoNotesList[index].pdfStates = pdfPagesRenderedStates;
    } else {
        picassoNotesList[index].canvasDrawing = pCanvas.toDataURL();
    }
    
    try {
        saveToLocalStorage();
        if (typeof addXp === 'function') { addXp(15); } 
        ToastSystem.success("تم حفظ الملاحظة بنجاح! +15 XP 💾");
        backToPicassoGallery();
    } catch (error) {
        ToastSystem.warning("⚠️ تنبيه: مساحة التخزين ممتلئة بالملفات! تم حفظ النصوص والتنسيقات بنجاح، يفضل مسح النوتس القديمة جداً لتوفير مساحة للرسوم الكبيرة.");
    }
}

// Enhanced Delete with Toast
function deletePicassoNote() {
    if (!activePicassoId) return;
    if (confirm('هل تريد مسح هذا الملخص وملاحظاته نهائياً؟ 🗑️')) {
        stopAutoSaveTimer();
        picassoNotesList = picassoNotesList.filter(n => n.id !== activePicassoId);
        saveToLocalStorage();
        ToastSystem.delete("تم حذف الملاحظة نهائياً 🗑️");
        backToPicassoGallery();
    }
}

// ==========================================
// 12. SyncFlow - Toast Integration
// ==========================================

function sfCalibrateTimer() {
    const prayers = sfGetPrayerTimes();
    const currentMin = sfGetCurrentMinutes();
    let minDistance = 1440;
    let targetPrayer = "";

    for (const [name, time] of Object.entries(prayers)) {
        const pMin = sfTimeToMinutes(time);
        if (pMin > currentMin && (pMin - currentMin) < minDistance) {
            minDistance = pMin - currentMin;
            targetPrayer = name;
        }
    }

    if (minDistance > 0 && minDistance < 1440) {
        // إيقاف أي تايمر شغال
        if (window.timerInterval) clearInterval(window.timerInterval);
        clearInterval(window.timerInterval);

        // حساب الثواني الكلية للجلسة المتوافقة
        const calibratedSeconds = minDistance * 60;

        // ===== الإصلاح الجوهري =====
        // نحفظ الوقت في window.timeLeft + localStorage
        // عشان زرار "ابدأ" في script.js يلاقيه ويشتغل صح
        window.timeLeft = calibratedSeconds;
        localStorage.setItem('timer_pausedTimeLeft', calibratedSeconds.toString());
        localStorage.setItem('timer_isRunning', 'false');
        localStorage.removeItem('timer_endTime');
        // =========================

        // تحديث الـ display
        const display = document.getElementById("timerDisplay");
        if (display) {
            const hrs = Math.floor(minDistance / 60);
            const mins = minDistance % 60;
            display.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
        }

        const timerMsg = document.getElementById("timerMessage");
        if (timerMsg) timerMsg.innerText = `🚀 تم تفعيل الجلسة المتوافقة! التايمر هيفصل مع الأذان بالظبط. دوس ابدأ وانطلق!`;

        // تخزين القرار لمنع تكرار التحذير لنفس الصلاة
        localStorage.setItem("sfLastDecision", "calibrated");
        localStorage.setItem("sfLastDecisionPrayer", targetPrayer);

        document.getElementById("sfWarningCard").style.display = "none";
        
        ToastSystem.success("تم تفعيل الجلسة المتوافقة مع الأذان ⏱️");
    }
}

function sfPostponeSession() {
    const prayers = sfGetPrayerTimes();
    const currentMin = sfGetCurrentMinutes();
    let minDistance = 1440;
    let targetPrayer = "";

    for (const [name, time] of Object.entries(prayers)) {
        const pMin = sfTimeToMinutes(time);
        if (pMin > currentMin && (pMin - currentMin) < minDistance) {
            minDistance = pMin - currentMin;
            targetPrayer = name;
        }
    }

    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.click();

    const timerMsg = document.getElementById("timerMessage");
    if (timerMsg) timerMsg.innerText = `صناعة العظماء تبدأ من المسجد! 🕋 اذهب للصلاة، والمحرك بانتظارك.`;

    localStorage.setItem("sfLastDecision", "postponed");
    localStorage.setItem("sfLastDecisionPrayer", targetPrayer);

    const conflictView = document.getElementById("sfConflictView");
    const recallView = document.getElementById("sfRecallView");
    
    if (conflictView) conflictView.style.display = "none";
    if (recallView) recallView.style.display = "block";
    
    const recallInput = document.getElementById("sfRecallInput");
    if (recallInput) {
        recallInput.value = "";
        recallInput.focus();
    }
    
    ToastSystem.info("تم إرجاء الجلسة - الصلاة أولاً 🕌");
}

function submitActiveRecall() {
    const recallInput = document.getElementById("sfRecallInput");
    if (!recallInput || recallInput.value.trim() === "") {
        ToastSystem.warning("اكتب سطر واحد سريع يا هندسة عشان نثبته في الذاكرة ونقفل الكارت! 🎯");
        return;
    }

    const userSummary = recallInput.value.trim();
    console.log("SyncFlow [Active Recall Saved]:", userSummary);

    if (typeof window.addXP === "function") {
        window.addXP(25); 
    } else {
        const xpText = document.getElementById("xpText");
        if (xpText) xpText.innerText = parseInt(xpText.innerText) + 25 + " / 120 XP";
    }

    let streak = parseInt(localStorage.getItem("sfPrayerStreak") || "0");
    streak += 1;
    localStorage.setItem("sfPrayerStreak", streak);
    sfUpdatePrayerStreakUI();

    // تفريغ سجل القرارات لتجهيز المحرك بشكل كامل للصلاة التالية
    localStorage.removeItem("sfLastDecision");
    localStorage.removeItem("sfLastDecisionPrayer");

    ToastSystem.success(`عاش يا بطل! 🧠 تم تثبيت المعلومة بنجاح في الذاكرة طويلة المدى، وكسبت +25 XP مكافأة التثبيت النشط.`);
    
    // تصحيح خطأ الحفظ المطبعي القاتل (.style.style)
    document.getElementById("sfWarningCard").style.display = "none";
    document.getElementById("sfRecallView").style.display = "none";
}

// ==========================================
// 13. Deen Time Challenges - Toast Integration
// ==========================================

function completeCurrentDeenPeriod() {
    // تحديد أي فترة نحن فيها الآن لإغلاقها
    let cachedTimes = null;
    try { cachedTimes = JSON.parse(localStorage.getItem('cachedPrayerTimes')); } catch(e){}
    
    let shrooqTime = "06:00", dhuhrTime = "12:00", asrTime = "15:30", maghribTime = "18:45", ishaTime = "20:15";
    if (cachedTimes && cachedTimes.data && cachedTimes.data.timings) {
        const t = cachedTimes.data.timings;
        shrooqTime = t.Sunrise || shrooqTime;
        dhuhrTime = t.Dhuhr || dhuhrTime;
        asrTime = t.Asr || asrTime;
        maghribTime = t.Maghrib || maghribTime;
        ishaTime = t.Isha || ishaTime;
    }
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timeToMin = (tStr) => { const s = tStr.split(':'); return parseInt(s[0]) * 60 + parseInt(s[1]); };

    let activePeriodKey = "witr";
    if (currentMinutes >= timeToMin(shrooqTime) && currentMinutes < timeToMin(dhuhrTime)) activePeriodKey = "dhaha";
    else if (currentMinutes >= timeToMin(dhuhrTime) && currentMinutes < timeToMin(asrTime)) activePeriodKey = "rawatib";
    else if (currentMinutes >= timeToMin(asrTime) && currentMinutes < timeToMin(maghribTime)) activePeriodKey = "sakina";
    else if (currentMinutes >= timeToMin(maghribTime) && currentMinutes < timeToMin(ishaTime)) activePeriodKey = "bashair";

    // تحديث الحالة وحفظها أوفلاين
    dtStates[activePeriodKey] = true;
    localStorage.setItem("dt_challenges_states", JSON.stringify(dtStates));

    // تأثير اهتزاز خفيف للموبايل والتابلت (Haptic Feedback) بدون التداخل مع الـ XP
    

    // إعادة رندرة الواجهة فوراً لقفل الزرار وتحويل المظهر
    renderCurrentChallengeUI(activePeriodKey);

    // فحص شرط الـ Streak المرن: هل وصل لـ فترتين منجزتين اليوم لزيادة الستريك أو الحفاظ عليه؟
    checkFlexibleStreakProgression();
    
    ToastSystem.success("تم إحياء السنة بنجاح! بارك الله فيك 🕌");
}

function checkFlexibleStreakProgression() {
    const periods = ["dhaha", "rawatib", "sakina", "bashair", "witr"];
    let completedCount = 0;
    periods.forEach(p => { if (dtStates[p] === true) completedCount++; });

    const todayStr = new Date().toDateString();
    const lastStreakDate = localStorage.getItem("dt_streak_earned_date") || "";

    // إذا حقق فترتين اليوم ولم يأخذ الستريك لليوم الحالي بعد
    if (completedCount === 2 && lastStreakDate !== todayStr) {
        dtStreak += 1;
        localStorage.setItem("dt_challenges_streak", dtStreak);
        localStorage.setItem("dt_streak_earned_date", todayStr);
        updateDtStreakUI();
        
        // تأثير alert تشجيعي لطيف ومستقل
        ToastSystem.success(`✨ أدركتَ البركة! أنجزتَ مقامين من السنن اليوم، تم حماية وزيادة الـ Streak الديني الخاص بك بنجاح: ${dtStreak} أيام.`);
    }
}

// ==========================================
// 14. Info Card - Toast Integration
// ==========================================

function initHelemCard() {
    if (helemDatabase.length === 0) return;

    // الحصول على تاريخ اليوم الحالي كـ String صافي بدون الساعات
    const todayStr = new Date().toDateString();
    
    // تحميل الحالات المخزنة محلياً من المتصفح
    let savedDate = localStorage.getItem("hl_info_date") || "";
    let savedIndex = parseInt(localStorage.getItem("hl_info_index"));

    // ميكانيكية اليوم الجديد الصارمة: لو التاريخ اتغير أو مفيش إندكس
    if (savedDate !== todayStr || isNaN(savedIndex) || savedIndex >= helemDatabase.length) {
        if (savedDate === "") {
            // أول دخلة للتطبيق في التاريخ
            savedIndex = 0;
        } else {
            // الانتقال للمعلومة التالية تتابعيًا (+1) لضمان عدم التكرار نهائيًا
            savedIndex = (savedIndex + 1) % helemDatabase.length;
        }
        
        // قفل الكاش والتاريخ الجديد لليوم
        localStorage.setItem("hl_info_date", todayStr);
        localStorage.setItem("hl_info_index", savedIndex.toString());
        
        ToastSystem.info("تم تحديث معلومة اليوم الجديدة 📖");
    }

    // رندرة وبث المعلومة بداخل الكارت الحقيقي
    renderHelemUI(savedIndex);
}

// ==========================================
// 15. Shell Integration - Toast & Settings
// ==========================================

// Export User Data with Toast
function exportUserData() {
    const data = {
        name:           localStorage.getItem('app_username'),
        goal:           localStorage.getItem('userGoal'),
        avatar:         localStorage.getItem('userAvatar'),
        xp:             localStorage.getItem('userXp'),
        totalHours:     localStorage.getItem('totalHoursStudied'),
        completedTodos: localStorage.getItem('completedTodosCount'),
        totalAzkar:     localStorage.getItem('totalAzkarCount'),
        historyLog:     JSON.parse(localStorage.getItem('studyHistoryLog') || '[]'),
        exportedAt:     new Date().toLocaleString('ar-EG')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `lazaker-fakir-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    ToastSystem.success("تم تصدير بياناتك بنجاح 📤");
}

// Reset XP with Toast
function resetXpConfirm() {
    if (confirm('⚠️ هتتمسح كل نقاط الـ XP والرتبة وتبدأ من الصفر. مش هيتأثر أي حاجة تانية. متأكد؟')) {
        localStorage.setItem('userXp', '0');
        if (typeof updateRankUI === 'function') updateRankUI();
        const badge = document.getElementById('profileRankBadge');
        if (badge) badge.textContent = 'النائم اللي صحي 🥶';
        ToastSystem.success("تم! بداية جديدة يا بطل 💪");
    }
}

// Preview Timer Sound with Toast
function previewTimerSound() {
    const sel = document.getElementById('timerSoundSelect');
    const sound = sel ? sel.value : (localStorage.getItem('timerSound') || 'bell');
    const SOUND_URLS = {
        bell:    'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
        chime:   'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
        success: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
        digital: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
        none:    null
    };
    if (!SOUND_URLS[sound]) {
        ToastSystem.info("🔇 لا يوجد صوت للمعاينة");
        return;
    }
    const audio = new Audio(SOUND_URLS[sound]);
    audio.volume = 0.8;
    audio.play().catch(() => {
        ToastSystem.error("فشل تشغيل الصوت - تأكد من اتصال الإنترنت ⚠️");
    });
    ToastSystem.success("جاري تشغيل المعاينة 🔊");
}

// Goal Editor with Toast
function saveGoal() {
    const val = document.getElementById('goalInput')?.value?.trim();
    if (!val) {
        ToastSystem.warning("اكتب هدفك الأول 🎯");
        return;
    }
    localStorage.setItem('userGoal', val);
    const goalDisplay = document.getElementById('profileGoalDisplay');
    if (goalDisplay) { goalDisplay.textContent = '🎯 ' + val; goalDisplay.style.color = ''; }
    const goalSub = document.getElementById('profileGoalSub');
    if (goalSub) goalSub.textContent = val;
    document.getElementById('goalModalOverlay')?.remove();
    ToastSystem.success("تم حفظ هدفك بنجاح! استمر يا بطل 🎯");
}

// Avatar Selection with Toast
function selectAvatar(em) {
    localStorage.setItem('userAvatar', em);
    const display = document.getElementById('profileAvatarDisplay');
    if (display) display.textContent = em;
    const drawerAvatar = document.querySelector('.app-drawer-avatar');
    if (drawerAvatar) drawerAvatar.textContent = em;
    const card = document.getElementById('avatarPickerCard');
    if (card) card.style.display = 'none';
    document.querySelectorAll('#avatarGrid button').forEach(btn => {
        const isSelected = btn.textContent.trim() === em;
        btn.style.background = isSelected ? 'var(--accent-color,#3b82f6)' : 'var(--btn-mode-bg,#1e293b)';
        btn.style.borderColor = isSelected ? 'var(--accent-color,#3b82f6)' : 'var(--border-color,#334155)';
    });
    ToastSystem.success("تم تغيير الأيقونة بنجاح 🎨");
}

// Name Save with Toast
function saveNameFromModal() {
    const inp = document.getElementById('appNameModalInput');
    const newName = inp ? inp.value.trim() : '';
    const nameToSave = newName || 'مستقبل جديد ✨';

    localStorage.setItem('app_username', nameToSave);
    refreshShellUserInfo(nameToSave);
    closeNameModal();
    ToastSystem.success(`تم تحديث الاسم إلى ${nameToSave} 👤`);
}

// Delete Account with Toast
function deleteAccount() {
    if (confirm('🚨 تحذير: سيتم مسح كافة إحصائياتك وإعداداتك المحلية تماماً من هذا المتصفح. هل تريد الاستمرار؟')) {
        localStorage.clear();
        ToastSystem.delete("تم مسح كل البيانات - إعادة تحميل... 🗑️");
        setTimeout(() => location.reload(), 1500);
    }
}

// Session End Modal with Toast
function showSessionEndModal(xpEarned, isHardcore) {
    const existing = document.getElementById('appSessionEndModal');
    if (existing) existing.remove();

    const hours = parseFloat(localStorage.getItem('totalHoursStudied') || 0).toFixed(2);
    const todos = parseInt(localStorage.getItem('completedTodosCount') || 0);
    const azkar = parseInt(localStorage.getItem('totalAzkarCount') || 0);
    const name = localStorage.getItem('app_username') || 'بطل';

    const completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || {};
    let prayersCount = Object.values(completedPrayers).filter(Boolean).length;

    const modal = document.createElement('div');
    modal.id = 'appSessionEndModal';
    modal.style.cssText = `
        position:fixed; inset:0; z-index:8500;
        background:rgba(0,0,0,0.7);
        display:flex; align-items:center; justify-content:center;
        direction:rtl; padding:20px;
        backdrop-filter:blur(6px);
        animation: fadeInModal 0.3s ease;
    `;

    const hardcoreBadge = isHardcore
        ? `<div style="background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-size:12px; font-weight:800; padding:5px 14px; border-radius:20px; display:inline-block; margin-bottom:12px;">🔥 جلسة Hardcore مكتملة!</div>`
        : '';

    modal.innerHTML = `
        <div style="
            background:var(--card-bg, #1e293b);
            border:1px solid var(--border-color, #334155);
            border-radius:24px;
            padding:32px 24px;
            width:100%; max-width:380px;
            text-align:center;
            box-shadow:0 24px 60px rgba(0,0,0,0.6);
            animation: slideUpModal 0.35s cubic-bezier(0.34,1.56,0.64,1);
        ">
            <div style="font-size:52px; margin-bottom:8px;">🏆</div>
            ${hardcoreBadge}
            <div style="font-size:21px; font-weight:800; color:var(--text-main,#f1f5f9); margin-bottom:6px;">
                عاش يا ${name}!
            </div>
            <div style="font-size:13px; color:var(--text-muted,#94a3b8); margin-bottom:24px; line-height:1.6;">
                خلصت جلستك بنجاح 💪 مستمر على الطريق الصح!
            </div>

            <!-- XP Badge -->
            <div style="
                background:linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15));
                border:1px solid rgba(168,85,247,0.3);
                border-radius:16px;
                padding:16px 20px;
                margin-bottom:20px;
                display:flex; align-items:center; justify-content:center; gap:10px;
            ">
                <span style="font-size:28px;">⚡</span>
                <div>
                    <div style="font-size:22px; font-weight:800; color:#a855f7;">+${xpEarned} XP</div>
                    <div style="font-size:11px; color:var(--text-muted,#94a3b8);">كسبتهم من جلستك دي</div>
                </div>
            </div>

            <!-- ملخص الإحصائيات -->
            <div style="
                display:grid; grid-template-columns:1fr 1fr;
                gap:10px; margin-bottom:24px;
            ">
                <div style="background:var(--btn-mode-bg,#0f172a); border:1px solid var(--border-color,#334155); border-radius:14px; padding:14px 10px;">
                    <div style="font-size:20px; font-weight:800; color:#3b82f6;">${hours}</div>
                    <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;">ساعات المذاكرة 📚</div>
                </div>
                <div style="background:var(--btn-mode-bg,#0f172a); border:1px solid var(--border-color,#334155); border-radius:14px; padding:14px 10px;">
                    <div style="font-size:20px; font-weight:800; color:#10b981;">${todos}</div>
                    <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;">مهام منجزة ✅</div>
                </div>
                <div style="background:var(--btn-mode-bg,#0f172a); border:1px solid var(--border-color,#334155); border-radius:14px; padding:14px 10px;">
                    <div style="font-size:20px; font-weight:800; color:#f59e0b;">${prayersCount}/5</div>
                    <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;">صلوات اليوم 🕋</div>
                </div>
                <div style="background:var(--btn-mode-bg,#0f172a); border:1px solid var(--border-color,#334155); border-radius:14px; padding:14px 10px;">
                    <div style="font-size:20px; font-weight:800; color:#06b6d4;">${azkar}</div>
                    <div style="font-size:11px; color:var(--text-muted,#94a3b8); margin-top:2px;">أذكار وتسبيح 📿</div>
                </div>
            </div>

            <button id="appSessionEndClose" style="
                width:100%; padding:15px; border-radius:14px;
                background:linear-gradient(135deg,#a855f7,#7c3aed);
                border:none; color:#fff;
                font-family:inherit; font-size:15px; font-weight:800;
                cursor:pointer;
                box-shadow:0 4px 20px rgba(168,85,247,0.4);
                transition: transform 0.15s;
            "
                onmouseover="this.style.transform='scale(1.02)'"
                onmouseout="this.style.transform='scale(1)'"
            >
                استمر في الإنجاز 🚀
            </button>
        </div>
    `;

    if (!document.getElementById('appModalKeyframes')) {
        const style = document.createElement('style');
        style.id = 'appModalKeyframes';
        style.textContent = `
            @keyframes fadeInModal { from { opacity:0; } to { opacity:1; } }
            @keyframes slideUpModal { from { transform:translateY(40px) scale(0.95); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    if (typeof AudioEngine !== 'undefined' && AudioEngine.playSuccess) {
        AudioEngine.playSuccess();
    }

    document.getElementById('appSessionEndClose').addEventListener('click', () => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    ToastSystem.success(`+${xpEarned} XP من جلستك! استمر يا بطل 🏆`);
}
                          
                          
                          // ==========================================
// 16. Enhanced Event Listeners & Initialization
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Initialize all systems
    ToastSystem.init();
    ThemeManager.init();
    
    // ... (Previous initialization code from Part 1) ...
    
    // Enhanced event listeners with Toast feedback
    document.getElementById("startBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') === 'true') {
            ToastSystem.warning("التايمر شغال بالفعل! ⏱️");
            return;
        }
        if (localStorage.getItem('hardcoreModeActive') === 'true') { 
            const de = document.documentElement; 
            if (de.requestFullscreen) de.requestFullscreen(); 
            else if (de.webkitRequestFullscreen) de.webkitRequestFullscreen(); 
        }
        localStorage.setItem('timer_isRunning', 'true'); 
        const now = Math.floor(Date.now() / 1000);
        if (currentMode === 'free') { 
            localStorage.setItem('timer_freeStartTime', (now - (window.secondsElapsed || 0)).toString()); 
            startFreeTimerLoop(); 
        } else { 
            if (!window.timeLeft) window.timeLeft = modeDurations[currentMode]; 
            localStorage.setItem('timer_endTime', (now + window.timeLeft).toString()); 
            localStorage.removeItem('timer_pausedTimeLeft'); 
            startCountdownLoop(); 
        }
        updateHardcoreUI();
        ToastSystem.success("ابدأت الجلسة! ركز وتوكل على الله 🎯");
    });
    
    // ... (Other event listeners from Part 1) ...
    
    // Settings button
    document.getElementById('settingsBtn')?.addEventListener('click', openSettingsModal);
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSettingsModal();
            closeQuranModal();
            closePicassoModal();
        }
    });
});

// ==========================================
// 17. Service Worker with Toast
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker Registered بنجاح! 🚀', reg.scope);
                ToastSystem.success("تم تسجيل Service Worker بنجاح! 📱");
            })
            .catch(err => {
                console.log('فشل تسجيل الـ SW:', err);
                ToastSystem.error("فشل تسجيل Service Worker ⚠️");
            });
    });
}

// ==========================================
// 18. Global Error Handler with Toast
// ==========================================

window.addEventListener('error', (e) => {
    console.error('Global Error:', e.error);
    ToastSystem.error("حدث خطأ غير متوقع - جاري الإصلاح ⚠️");
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    ToastSystem.error("حدث خطأ في الاتصال - تحقق من الإنترنت 📴");
});

// ==========================================
// 19. Performance Optimizations
// ==========================================

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized search for Picasso
const debouncedSearch = debounce((query) => {
    renderPicassoGallery(query);
}, 300);

// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

// ==========================================
// 20. Accessibility Improvements
// ==========================================

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        const modal = document.querySelector('.settings-modal-overlay[style*="flex"]');
        if (modal) {
            const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// ARIA labels for dynamic content
function updateAriaLabels() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.setAttribute('aria-live', 'polite');
        timerDisplay.setAttribute('aria-atomic', 'true');
    }
}

// ==========================================
// 21. Analytics & Tracking (Privacy Friendly)
// ==========================================

const Analytics = {
    track(event, data = {}) {
        // Store locally only - no external tracking
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        events.push({
            event,
            data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100
    },
    
    getStats() {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        return {
            totalSessions: events.filter(e => e.event === 'session_complete').length,
            totalHours: events.filter(e => e.event === 'session_complete').reduce((acc, e) => acc + (e.data.hours || 0), 0),
            favoriteMode: this.getFavoriteMode(events)
        };
    },
    
    getFavoriteMode(events) {
        const modes = events.filter(e => e.event === 'mode_select').map(e => e.data.mode);
        if (modes.length === 0) return 'heroes';
        return modes.sort((a,b) => 
            modes.filter(v => v === a).length - modes.filter(v => v === b).length
        ).pop();
    }
};

// Track session completion
function trackSessionComplete() {
    Analytics.track('session_complete', {
        mode: currentMode,
        hours: totalHoursStudied,
        xp: userXp,
        isHardcore: localStorage.getItem('hardcoreModeActive') === 'true'
    });
}

// ==========================================
// 22. Backup & Restore System
// ==========================================

function createBackup() {
    const backup = {
        version: '3.0',
        timestamp: new Date().toISOString(),
        data: {
            userXp: localStorage.getItem('userXp'),
            totalHoursStudied: localStorage.getItem('totalHoursStudied'),
            completedTodosCount: localStorage.getItem('completedTodosCount'),
            totalAzkarCount: localStorage.getItem('totalAzkarCount'),
            studyHistoryLog: localStorage.getItem('studyHistoryLog'),
            completedPrayers: localStorage.getItem('completedPrayers'),
            savedTodos: localStorage.getItem('savedTodos'),
            picasso_master_list: localStorage.getItem('picasso_master_list'),
            app_username: localStorage.getItem('app_username'),
            userGoal: localStorage.getItem('userGoal'),
            userAvatar: localStorage.getItem('userAvatar'),
            theme: localStorage.getItem('theme'),
            pomoDuration: localStorage.getItem('pomoDuration'),
            timerSound: localStorage.getItem('timerSound'),
            savedCity: localStorage.getItem('savedCity')
        }
    };
    return backup;
}

function restoreBackup(backup) {
    if (!backup || !backup.data) {
        ToastSystem.error("ملف النسخة الاحتياطية تالف ❌");
        return false;
    }
    
    try {
        Object.entries(backup.data).forEach(([key, value]) => {
            if (value !== null) localStorage.setItem(key, value);
        });
        ToastSystem.success("تم استعادة النسخة الاحتياطية بنجاح ✅");
        location.reload();
        return true;
    } catch (e) {
        ToastSystem.error("فشل استعادة النسخة الاحتياطية ⚠️");
        return false;
    }
}

// Auto-backup every hour
setInterval(() => {
    const backup = createBackup();
    localStorage.setItem('auto_backup', JSON.stringify(backup));
    console.log('Auto-backup created at', new Date().toLocaleString());
}, 3600000);

// ==========================================
// 23. Enhanced Picasso Notes - PDF Export
// ==========================================



function fallbackExport(note, noteId) {
    // Fallback: Create a canvas and download as image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;
    
    // Background
    ctx.fillStyle = '#f7f4eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(note.title || 'ملاحظة بدون عنوان', canvas.width - 40, 50);
    
    // Date
    ctx.font = '14px Cairo, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(note.date || new Date().toLocaleDateString('ar-EG'), canvas.width - 40, 80);
    
    // Content
    ctx.fillStyle = '#1e293b';
    ctx.font = '16px Cairo, sans-serif';
    const textContent = (note.textContent || '').replace(/<<[^>]*>/g, '');
    const lines = textContent.split('\n');
    let y = 120;
    lines.forEach(line => {
        if (y < canvas.height - 40) {
            ctx.fillText(line, canvas.width - 40, y);
            y += 25;
        }
    });
    
    // Drawing
    if (note.canvasDrawing) {
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 40, y + 20, canvas.width - 80, 400);
            downloadCanvas(canvas, `picasso-note-${noteId}.png`);
        };
        img.src = note.canvasDrawing;
    } else {
        downloadCanvas(canvas, `picasso-note-${noteId}.png`);
    }
}

function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    ToastSystem.success("تم تصدير الملاحظة كـ صورة بنجاح 🖼️");
}

// ==========================================
// 24. Final Initialization
// ==========================================

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Show welcome message
    setTimeout(() => {
        const userName = localStorage.getItem('app_username') || 'بطل';
        ToastSystem.success(`أهلاً بيك يا ${userName}! جاهز للمقاوحة؟ 🚀`);
    }, 1000);
    
    // Check for updates
    const lastVersion = localStorage.getItem('app_version');
    const currentVersion = '3.0';
    if (lastVersion !== currentVersion) {
        localStorage.setItem('app_version', currentVersion);
        if (lastVersion) {
            ToastSystem.info(`تم التحديث إلى الإصدار ${currentVersion} ✨`);
        }
    }
    
    console.log('🚀 اللي ذاكر فاكر v3.0 - Loaded Successfully!');
    console.log('📊 Toast System: Active');
    console.log('🎨 Theme Manager: Active');
    console.log('⏱️ Timer Sound: ' + (localStorage.getItem('timerSoundEnabled') === 'true' ? 'Enabled' : 'Disabled'));
});