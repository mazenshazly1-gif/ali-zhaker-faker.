// ==========================================
// 🛠️ ملف اللوجيك والتحكم التفاعلي الكامل (script.js) - الّلي ذاكر فاكر V8
// ==========================================

// ==========================================
// 1. الإعدادات العامة والـ DOM Elements
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // تشغيل نظام التصفير وفحص اليوم الجديد أول حاجة قبل أي لود للداتا
    checkAndResetNewDay();
    
    // تهيئة باقي مكونات الصفحة والـ Event Listeners
    displayCurrentDate();
    initAppComponents();
});

function displayCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('ar-EG', options);
    const dateEl = document.getElementById("currentDateText");
    if (dateEl) dateEl.innerText = today;
}

// ==========================================
// 2. المتغيرات، الرتب، وبونص التصفير اليومي
// ==========================================
let timerInterval; 
const modeDurations = { 'heroes': 4 * 60 * 60, 'focus': 2 * 60 * 60, 'pomodoro': 25 * 60, 'free': 0 };
const modeMessages = {
    'heroes': "جلسة الأبطال.. 4 ساعات تركيز وطحن! 🔥", 
    'focus': "ساعتين إنجاز على السريع.. ادخل سخن! ⚡",
    'pomodoro': "25 دقيقة طحن وتركيز فائق. ⏱️", 
    'free': "العداد الحر شغال بيعد وراك تعبك.. 🔄"
};

let currentMode = localStorage.getItem('timer_currentMode') || 'heroes';
let totalHoursStudied = parseFloat(localStorage.getItem('totalHoursStudied')) || 0.0;
let completedTodosCount = parseInt(localStorage.getItem('completedTodosCount')) || 0;
let totalAzkarCount = parseInt(localStorage.getItem('totalAzkarCount')) || 0;
let userXp = parseFloat(localStorage.getItem('userXp')) || 0.0;

// نظام الرتب الخمسة المعتمد يا كنج 🎯
const RANKS = [
    { name: "1. مبتدئ بيسخن 🥶⏳", minXp: 0, maxXp: 150 },
    { name: "2. مقاتل ⚔️🔥", minXp: 150, maxXp: 400 },
    { name: "3. انت كدا كنج 👑⭐", minXp: 400, maxXp: 800 },
    { name: "4. ايقونه يبنى عاش 🏅🚀", minXp: 800, maxXp: 1500 },
    { name: "5. لفل الوحش 🦁💀", minXp: 1500, maxXp: 999999 }
];

function addXp(amount) {
    userXp += amount; 
    if(userXp < 0) userXp = 0;
    localStorage.setItem('userXp', userXp.toFixed(1)); 
    updateRankUI();
}

function updateRankUI() {
    let currentRank = RANKS[0];
    for (let i = 0; i < RANKS.length; i++) { 
        if (userXp >= RANKS[i].minXp) currentRank = RANKS[i]; 
    }
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

// سيستم التصفير التلقائي مع بداية اليوم الجديد (Midnight Reset التلقائي)
function checkAndResetNewDay() {
    const todayDateStr = new Date().toDateString();
    const lastSavedDate = localStorage.getItem('last_visited_date');

    if (lastSavedDate && lastSavedDate !== todayDateStr) {
        // 1. حساب تاريخ امبارح بدقة وحفظ الإنجاز في السجل والـ Chart قبل التصفير لحفظ الحقوق
        const yesterday = new Date(); 
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', weekday: 'short' });
        
        saveCurrentDayToHistory(yesterdayStr);

        // 💡 فكرة صندوق المكافأة: فحص لو الطالب قفل صلواته وورده وخلص مهمتين امبارح
        let lastPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || {};
        let prayerDoneCount = Object.values(lastPrayers).filter(Boolean).length;
        let lastQuran = localStorage.getItem('quran_completed_date') === lastSavedDate;
        
        if (prayerDoneCount === 5 && lastQuran && completedTodosCount >= 2) {
            alert("🎁 صندوق مكافأة الالتزام! بما إنك قفلت صلواتك ووردك ومهامك امبارح، ليك +100 XP بونص لبداية يومك الجديد! عاش يا بطل 👑");
            userXp = 100.0; 
        } else {
            userXp = 0.0; 
        }

        // 2. تصفير العدادات اليومية في الـ LocalStorage والداتا الحالية
        totalAzkarCount = 0;
        completedTodosCount = 0;
        totalHoursStudied = 0.0; 
        
        localStorage.setItem('userXp', userXp.toFixed(1));
        localStorage.setItem('totalAzkarCount', '0');
        localStorage.setItem('completedTodosCount', '0');
        localStorage.setItem('totalHoursStudied', '0');
        localStorage.removeItem('savedTodos'); 
        
        // تصفير الصلوات
        const freshPrayers = { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
        localStorage.setItem('completedPrayers', JSON.stringify(freshPrayers));
        window.completedPrayers = freshPrayers;

        // تحديث الـ UI ليعكس التصفير فوراً
        if (document.getElementById("statHours")) document.getElementById("statHours").innerText = "0.00";
        if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = "0";
        if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = "0";
        const todoList = document.getElementById("todoList"); if(todoList) todoList.innerHTML = "";
        
        updateRankUI();
        if(typeof updatePrayersAnalyticsUI === "function") updatePrayersAnalyticsUI();
    }
    
    localStorage.setItem('last_visited_date', todayDateStr);
}

// ==========================================
// 3. نظام التايمر، جلسات المذاكرة والـ Hardcore Mode
// ==========================================
let timeLeft = 0;
let isTimerRunning = false;
let elapsedFreeSeconds = 0;
const alarmAudio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
alarmAudio.loop = true;

function setupTimerMode(mode) {
    if (isTimerRunning) return;
    currentMode = mode;
    localStorage.setItem('timer_currentMode', mode);
    
    const msgEl = document.getElementById("modeMessage");
    if (msgEl) msgEl.innerText = modeMessages[mode];
    
    if (mode === 'free') {
        elapsedFreeSeconds = 0;
        updateTimerDisplay(0);
    } else {
        timeLeft = modeDurations[mode];
        updateTimerDisplay(timeLeft);
    }
}

function updateTimerDisplay(secondsInput) {
    const hours = Math.floor(secondsInput / 3600);
    const minutes = Math.floor((secondsInput % 3600) / 60);
    const seconds = secondsInput % 60;
    
    const displayStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (document.getElementById("timerDisplay")) document.getElementById("timerDisplay").innerText = displayStr;
}

function toggleTimer() {
    const btn = document.getElementById("btnToggleTimer");
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if(btn) btn.innerHTML = "<span>ابدأ الجلسة</span> 🚀";
        alarmAudio.pause(); alarmAudio.currentTime = 0;
    } else {
        isTimerRunning = true;
        if(btn) btn.innerHTML = "<span>إيقاف مؤقت</span> ⏸️";
        
        timerInterval = setInterval(() => {
            if (currentMode === 'free') {
                elapsedFreeSeconds++;
                updateTimerDisplay(elapsedFreeSeconds);
                totalHoursStudied += (1 / 3600);
                addXp(1 / 60); // زيادة الـ XP بمعدل متزن أثناء المذاكرة الحرّة
            } else {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay(timeLeft);
                    totalHoursStudied += (1 / 3600);
                    addXp(1 / 60);
                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    if(btn) btn.innerHTML = "<span>ابدأ الجلسة</span> 🚀";
                    alarmAudio.play();
                    alert("عاش يا بطل! قفّلت الجلسة بنجاح وعملت اللي عليك 👑");
                }
            }
            localStorage.setItem('totalHoursStudied', totalHoursStudied.toFixed(2));
            if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
        }, 1000);
    }
}

// لوجيك الـ Hardcore قفش الهروب والتشتيت 🚨
window.addEventListener('blur', () => {
    const hardcoreChecked = document.getElementById("chkHardcore")?.checked;
    if (isTimerRunning && hardcoreChecked) {
        addXp(-15); // خصم 15 XP فوري عقاباً على الهروب والتشتيت
        alarmAudio.play();
        document.body.classList.add("hardcore-alarm-active");
        alert("🚨 قفشناااااك! بتهرب من المذاكرة وتروح لتابس تانية؟ تم خصم 15 XP وتشغيل صفارة الإنذار! ارجع ركز فوراً!");
    }
});

window.addEventListener('focus', () => {
    alarmAudio.pause();
    document.body.classList.remove("hardcore-alarm-active");
});

// ==========================================
// 4. الـ UI Modes (التبديل بين المذاكرة والواحة الدينية)
// ==========================================
function switchAppMode(uiMode) {
    const studySection = document.getElementById("studySection");
    const deenSection = document.getElementById("deenSection");
    const btnStudy = document.getElementById("btnModeStudy");
    const btnDeen = document.getElementById("btnModeDeen");
    
    if (uiMode === 'deen') {
        studySection?.classList.add("hidden-mode");
        deenSection?.classList.remove("hidden-mode");
        btnDeen?.classList.add("active-nav-btn");
        btnStudy?.classList.remove("active-nav-btn");
    } else {
        deenSection?.classList.add("hidden-mode");
        studySection?.classList.remove("hidden-mode");
        btnStudy?.classList.add("active-nav-btn");
        btnDeen?.classList.remove("active-nav-btn");
    }
}

// ==========================================
// 5. الـ Todo List (قائمة المهام اليومية)
// ==========================================
function addTodoItem() {
    const input = document.getElementById("todoInput");
    if (!input || input.value.trim() === "") return;
    
    const todoText = input.value.trim();
    let savedTodos = JSON.parse(localStorage.getItem('savedTodos')) || [];
    savedTodos.push({ text: todoText, completed: false });
    localStorage.setItem('savedTodos', JSON.stringify(savedTodos));
    
    input.value = "";
    renderTodoList();
}

function renderTodoList() {
    const listEl = document.getElementById("todoList");
    if (!listEl) return;
    listEl.innerHTML = "";
    
    let savedTodos = JSON.parse(localStorage.getItem('savedTodos')) || [];
    savedTodos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span onclick="toggleTodoComplete(${index})">${todo.text}</span>
            <button class="btn-delete-todo" onclick="deleteTodoItem(${index})">🗑️</button>
        `;
        listEl.appendChild(li);
    });
}

function toggleTodoComplete(index) {
    let savedTodos = JSON.parse(localStorage.getItem('savedTodos')) || [];
    savedTodos[index].completed = !savedTodos[index].completed;
    localStorage.setItem('savedTodos', JSON.stringify(savedTodos));
    
    if (savedTodos[index].completed) {
        completedTodosCount++; addXp(20); // مكافأة إنجاز مهمة
    } else {
        completedTodosCount--; addXp(-20);
        if(completedTodosCount < 0) completedTodosCount = 0;
    }
    localStorage.setItem('completedTodosCount', completedTodosCount);
    if(document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    
    renderTodoList();
}

function deleteTodoItem(index) {
    let savedTodos = JSON.parse(localStorage.getItem('savedTodos')) || [];
    if(savedTodos[index].completed) {
        completedTodosCount--;
        if(completedTodosCount < 0) completedTodosCount = 0;
        localStorage.setItem('completedTodosCount', completedTodosCount);
        if(document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    }
    savedTodos.splice(index, 1);
    localStorage.setItem('savedTodos', JSON.stringify(savedTodos));
    renderTodoList();
}

// ==========================================
// 6. الواحة الدينية (الأذكار، السبحة، وورد القرآن)
// ==========================================
let tasbihCount = 0;
function handleTasbihClick() {
    tasbihCount++;
    totalAzkarCount++;
    
    if (document.getElementById("tasbihCounter")) document.getElementById("tasbihCounter").innerText = tasbihCount;
    if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    localStorage.setItem('totalAzkarCount', totalAzkarCount);
    
    // تفعيل اهتزاز الموبايل مع التسبيح لزيادة التفاعل والدقة
    if (navigator.vibrate) navigator.vibrate(40);
    if (tasbihCount % 33 === 0) { addXp(5); }
}

function resetTasbihCounter() {
    tasbihCount = 0;
    if (document.getElementById("tasbihCounter")) document.getElementById("tasbihCounter").innerText = "0";
}

function completeQuranWird() {
    const todayStr = new Date().toDateString();
    localStorage.setItem('quran_completed_date', todayStr);
    addXp(40); // مكافأة قراءة الورد اليومي للقرآن
    alert("عاش يا بطل! تم تسجيل ورد القرآن الكريم اليوم بنجاح وأخذت +40 XP 🌸");
}

// ==========================================
// 7. الـ API ومواقيت الصلاة الفورية والأوفلاين
// ==========================================
window.completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };

async function fetchPrayerTimes() {
    try {
        const res = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5");
        const data = await res.json();
        if(data && data.data && data.data.timings) {
            const t = data.data.timings;
            const targetPrayers = { Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha };
            localStorage.setItem('cachedPrayerTimes', JSON.stringify(targetPrayers));
            renderPrayerTimesUI(targetPrayers);
        }
    } catch (err) {
        console.log("الإنترنت غير متاح.. جاري تحميل مواقيت الصلاة من الكاش (Offline mode).");
        const cached = JSON.parse(localStorage.getItem('cachedPrayerTimes'));
        if(cached) renderPrayerTimesUI(cached);
    }
}

function renderPrayerTimesUI(timings) {
    const container = document.getElementById("prayerTimesContainer");
    if (!container) return;
    container.innerHTML = "";
    
    const arabicNames = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
    
    for (let key in timings) {
        const isDone = window.completedPrayers[key];
        const card = document.createElement("div");
        card.className = `prayer-card ${isDone ? 'checked-prayer' : ''}`;
        card.innerHTML = `
            <div class="prayer-info">
                <span class="prayer-name">${arabicNames[key]}</span>
                <span class="prayer-time">${timings[key]}</span>
            </div>
            <input type="checkbox" class="prayer-checkbox" ${isDone ? 'checked' : ''} onchange="togglePrayerStatus('${key}')">
        `;
        container.appendChild(card);
    }
    updatePrayersAnalyticsUI();
}

function togglePrayerStatus(prayerKey) {
    window.completedPrayers[prayerKey] = !window.completedPrayers[prayerKey];
    localStorage.setItem('completedPrayers', JSON.stringify(window.completedPrayers));
    
    if (window.completedPrayers[prayerKey]) addXp(15); else addXp(-15);
    
    fetchPrayerTimes(); // إعادة التوجيه لتحديث الألوان والتنسيق الخاص بالكروت
}

function updatePrayersAnalyticsUI() {
    let doneCount = 0;
    for(let key in window.completedPrayers) { if(window.completedPrayers[key]) doneCount++; }
    if(document.getElementById("prayerCompletedCount")) document.getElementById("prayerCompletedCount").innerText = doneCount;
}

// ==========================================
// 8. سجل الإنجازات الأسبوعي ونظام الـ Chart والأيام (Streak)
// ==========================================
function saveCurrentDayToHistory(overrideDateStr = null) {
    let historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    
    // لو باعتين تاريخ معين (تاريخ امبارح وقت التصفير) نستخدمه، غير كدا نستخدم النهاردة
    const dateToSave = overrideDateStr || new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', weekday: 'short' });
    
    let prayersCount = 0; 
    const completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || {};
    for(let key in completedPrayers) { if(completedPrayers[key]) prayersCount++; }

    const existingIndex = historyLog.findIndex(item => item.date === dateToSave);
    const newRecord = { 
        date: dateToSave, 
        hours: totalHoursStudied.toFixed(2), 
        todos: completedTodosCount, 
        azkar: totalAzkarCount, 
        prayers: prayersCount 
    };
    
    if (existingIndex !== -1) historyLog[existingIndex] = newRecord; 
    else historyLog.unshift(newRecord);

    localStorage.setItem('studyHistoryLog', JSON.stringify(historyLog)); 
    renderHistoryLog(); 
    updateStreakAndChartSystem();
}

function renderHistoryLog() {
    const listEl = document.getElementById("historyLogList");
    if (!listEl) return;
    listEl.innerHTML = "";
    
    let historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    if(historyLog.length === 0) {
        listEl.innerHTML = "<p style='text-align:center; color:#94a3b8;'>لا يوجد إنجازات مسجلة بعد، ابدأ المذاكرة الآن لتصنع تاريخك! ⚔️</p>";
        return;
    }
    
    historyLog.slice(0, 7).forEach(item => {
        const div = document.createElement("div");
        div.className = "history-log-item";
        div.innerHTML = `
            <span class="log-date">${item.date}</span>
            <span class="log-stat">⏱️ ${item.hours} س</span>
            <span class="log-stat">✅ ${item.todos} مهام</span>
            <span class="log-stat">📿 ${item.azkar} ذكر</span>
            <span class="log-stat">🕌 ${item.prayers}/5 صلاة</span>
        `;
        listEl.appendChild(div);
    });
}

let studyChartInstance = null;
function updateStreakAndChartSystem() {
    let historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    
    // حساب الـ Streak الحالية
    let currentStreak = 0;
    for(let i=0; i<historyLog.length; i++) {
        if(parseFloat(historyLog[i].hours) > 0) currentStreak++; else break;
    }
    if(document.getElementById("statStreak")) document.getElementById("statStreak").innerText = currentStreak;
    
    // تحديث رسمة الـ Chart.js الأسبوعية
    const ctx = document.getElementById("weeklyStudyChart")?.getContext("2d");
    if (!ctx) return;
    
    const last7Days = historyLog.slice(0, 7).reverse();
    const labels = last7Days.map(item => item.date);
    const dataHours = last7Days.map(item => parseFloat(item.hours));
    
    if (studyChartInstance) studyChartInstance.destroy();
    
    // بناء الشارت بشكل جمالي احترافي ومتناسق مع الألوان الداكنة والـ Neon
    studyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ["لم تبدأ بعد"],
            datasets: [{
                label: 'ساعات المذاكرة اليومية',
                data: dataHours.length > 0 ? dataHours : [0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#60a5fa',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// ==========================================
// 9. تهيئة المكونات وتحميل الداتا عند الفتح (Initialization)
// ==========================================
function initAppComponents() {
    // عرض الإحصائيات الفورية من الـ LocalStorage في الـ UI
    if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    
    updateRankUI();
    setupTimerMode(currentMode);
    renderTodoList();
    fetchPrayerTimes();
    renderHistoryLog();
    updateStreakAndChartSystem();
    
    // ربط ميكانيزم زرار الإنتر لإضافة المهام بسهولة
    document.getElementById("todoInput")?.addEventListener("keypress", (e) => {
        if(e.key === "Enter") addTodoItem();
    });
}

// ==========================================
// 10. تسجيل الـ Service Worker لتفعيل الـ PWA والأوفلاين
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('تم تسجيل الـ Service Worker بنجاح والـ PWA جاهز للعمل أوفلاين! 🚀', reg.scope))
            .catch(err => console.log('فشل تسجيل الـ Service Worker:', err));
    });
}
