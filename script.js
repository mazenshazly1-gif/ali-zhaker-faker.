// ==========================================
// 1. التحكم بالواجهات والـ Tabs
// ==========================================
let currentActiveInterface = 'study'; 
const alarmAudio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
alarmAudio.loop = true;

function toggleInterface() {
    if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') {
        alert("🚨 قفشتك! وضع الـ Hardcore شغال.. ممنوع التنقل أو تشتيت نفسك لحد ما الجلسة تخلص!");
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
        alert("🔥 إثبت مكانك! وضع الـ Hardcore متفعل.. مش هتعرف تغير المود دلوقتي!"); return;
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

// ==========================================
// 2. المتغيرات ولوجيك الرتب والـ XP
// ==========================================
let timerInterval; 
const modeDurations = { 'heroes': 4 * 60 * 60, 'focus': 2 * 60 * 60, 'pomodoro': 25 * 60, 'free': 0 };
const modeMessages = {
    'heroes': "جلسة الأبطال.. 4 ساعات تركيز وطحن! 🔥", 'focus': "ساعتين إنجاز على السريع.. ادخل سخن! ⚡",
    'pomodoro': "25 دقيقة طحن وتركيز فائق. ⏱️", 'free': "العداد الحر شغال بيعد وراك تعبك.. 🔄"
};
let currentMode = localStorage.getItem('timer_currentMode') || 'heroes';
let totalHoursStudied = parseFloat(localStorage.getItem('totalHoursStudied')) || 0.0;
let completedTodosCount = parseInt(localStorage.getItem('completedTodosCount')) || 0;
let totalAzkarCount = parseInt(localStorage.getItem('totalAzkarCount')) || 0;
let userXp = parseFloat(localStorage.getItem('userXp')) || 0.0;

const RANKS = [
    { name: "1. مبتدئ بيسخن 🥶⏳", minXp: 0, maxXp: 120 },
    { name: "2. بطل المواجهة 🔥⚔️", minXp: 120, maxXp: 500 },
    { name: "3. إنت كدا أيقونة 👑⭐", minXp: 500, maxXp: 999999 }
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
        alert("❌ ميبقاش التايمر شغال وتيجي تعدل الوضع!"); checkbox.checked = !checkbox.checked; return;
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
        if (e.key === 'F12' || e.key === 'Escape' || (e.ctrlKey && e.shiftKey && e.key === 'I')) { e.preventDefault(); alert("🔥 وضع الهاردكور قفل عليك الهروب!"); }
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

function clearHistoryLog() { if(confirm("هل أنت متأكد إنك عايز تمسح سجل البطولات بالكامل؟")) { localStorage.removeItem('studyHistoryLog'); renderHistoryLog(); updateStreakAndChartSystem(); } }

function updateStreakAndChartSystem() {
    const historyLog = JSON.parse(localStorage.getItem('studyHistoryLog')) || [];
    let streak = historyLog.length > 0 ? 1 : 0;
    for (let i = 0; i < historyLog.length - 1; i++) { if (parseFloat(historyLog[i].hours) > 0 && parseFloat(historyLog[i+1].hours) > 0) streak++; else break; }
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
    if(currentSeconds > 0 && currentSeconds % 60 === 0) { saveCurrentDayToHistory(); }
}

function handleTimerFinishedComplete() {
    clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false'); localStorage.removeItem('timer_pausedTimeLeft');
    window.timeLeft = modeDurations[currentMode]; updateHardcoreUI(); updateTimerDisplayUI();
    if (localStorage.getItem('hardcoreModeActive') === 'true') { addXp(50); alert("👑 عاااش! خلصت جلسة الـ Hardcore كاملة وأخدت +50 XP بونص!"); } else { addXp(20); }
    document.body.style.transform = 'scale(1.02)'; setTimeout(() => document.body.style.transform = 'scale(1)', 500);
    saveCurrentDayToHistory();
    if (document.getElementById("timerMessage")) document.getElementById("timerMessage").innerText = "🎉 كفووو! خلصت الجلسة بنجاح، أنت بطل!";
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
    document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
    const targetedBtn = document.getElementById(`mode-${currentMode}`); if(targetedBtn) targetedBtn.classList.add('active');
    const isRunning = localStorage.getItem('timer_isRunning') === 'true';
    if (isRunning) {
        if (currentMode === 'free') { window.secondsElapsed = (Math.floor(Date.now() / 1000) - parseInt(localStorage.getItem('timer_freeStartTime'))); startFreeTimerLoop(); }
        else { let remaining = parseInt(localStorage.getItem('timer_endTime')) - Math.floor(Date.now() / 1000); if (remaining > 0) { window.timeLeft = remaining; startCountdownLoop(); } else { handleTimerFinishedComplete(); } }
    } else {
        if (currentMode === 'free') { window.secondsElapsed = parseInt(localStorage.getItem('timer_freePausedSeconds')) || 0; }
        else { const hasPausedTime = localStorage.getItem('timer_pausedTimeLeft'); window.timeLeft = hasPausedTime ? parseInt(hasPausedTime) : modeDurations[currentMode]; }
        updateTimerDisplayUI();
    }
    updateHardcoreUI();
}

// ==========================================
// 6. مواقيت الصلاة والواحة الدينية
// ==========================================
let prayerTimesData = {};
const prayerNamesArabic = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
let completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };

function convertTo12HourFormat(timeStr) { if(!timeStr) return "--:--"; let [hours, minutes] = timeStr.split(':').map(Number); let ampm = hours >= 12 ? 'م' : 'ص'; hours = hours % 12 || 12; return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`; }
function updatePrayersAnalyticsUI() {
    for (const key in completedPrayers) {
        const checkbox = document.getElementById(`check-${key}`); const row = document.getElementById(`p-${key}`);
        if(checkbox && row) { checkbox.checked = completedPrayers[key]; if(completedPrayers[key]) row.classList.add("completed-prayer"); else row.classList.remove("completed-prayer"); }
    }
}
function togglePrayerDone(prayerKey) {
    const checkbox = document.getElementById(`check-${prayerKey}`); if (!checkbox || checkbox.disabled) return;
    completedPrayers[prayerKey] = checkbox.checked; localStorage.setItem('completedPrayers', JSON.stringify(completedPrayers));
    updatePrayersAnalyticsUI(); saveCurrentDayToHistory();
}
function checkNextPrayer() {
    if (!prayerTimesData || Object.keys(prayerTimesData).length === 0) return;
    const now = new Date(); let minDiff = Infinity; let nextPrayerKey = "";
    document.querySelectorAll('.prayer-row').forEach(row => { if (!row.classList.contains('completed-prayer')) row.classList.remove('next-active', 'prayer-available'); });
    
    for (const [key, timeStr] of Object.entries(prayerTimesData)) {
        const [hours, minutes] = timeStr.split(':').map(Number); const prayerTime = new Date(); prayerTime.setHours(hours, minutes, 0, 0);
        let diff = prayerTime - now; const checkbox = document.getElementById(`check-${key}`); const row = document.getElementById(`p-${key}`);
        if (now >= prayerTime) { if (checkbox) checkbox.disabled = false; if (row && !completedPrayers[key]) row.classList.add('prayer-available'); }
        else { if (checkbox) { checkbox.disabled = true; checkbox.checked = false; } completedPrayers[key] = false; }
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextPrayerKey = key; }
    }
    updatePrayersAnalyticsUI();
    if (nextPrayerKey === "") { nextPrayerKey = "Fajr"; const [hours, minutes] = prayerTimesData.Fajr.split(':').map(Number); const prayerTime = new Date(); prayerTime.setDate(prayerTime.getDate() + 1); prayerTime.setHours(hours, minutes, 0, 0); minDiff = prayerTime - now; }
    const activeRow = document.getElementById(`p-${nextPrayerKey}`); if (activeRow && !completedPrayers[nextPrayerKey]) activeRow.classList.add('next-active');
    
    let totalSeconds = Math.floor(minDiff / 1000); let h = Math.floor(totalSeconds / 3600); let m = Math.floor((totalSeconds % 3600) / 60);
    if (document.getElementById("nextPrayerCountdown")) document.getElementById("nextPrayerCountdown").innerText = `متبقي على ${prayerNamesArabic[nextPrayerKey]}: ${h}س و ${m}د`;
    if (document.getElementById("headerPrayerCountdown")) document.getElementById("headerPrayerCountdown").innerText = `🕋 ${prayerNamesArabic[nextPrayerKey]}: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
async function fetchPrayerTimes(city) {
    try { const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Egypt&method=5`); const data = await response.json(); if (data.code === 200) { prayerTimesData = { Fajr: data.data.timings.Fajr, Dhuhr: data.data.timings.Dhuhr, Asr: data.data.timings.Asr, Maghrib: data.data.timings.Maghrib, Isha: data.data.timings.Isha }; for (const [key, val] of Object.entries(prayerTimesData)) { if(document.getElementById(`time-${key}`)) document.getElementById(`time-${key}`).innerText = convertTo12HourFormat(val); } checkNextPrayer(); } } catch (e) {}
}
function changeCity() { const city = document.getElementById("citySelect").value; localStorage.setItem("savedCity", city); fetchPrayerTimes(city); }
function requestNotificationPermission() { if ("Notification" in window) { Notification.requestPermission().then(perm => { if (perm === "granted") { const btn = document.getElementById("notifBtn"); if(btn) { btn.innerText = "تم تفعيل الإشعارات بنجاح 🟢"; btn.classList.add("activated"); } } }); } }

// ==========================================
// 7. الأذكار والسبحة الإلكترونية
// ==========================================
let currentSection = 'sabah'; let currentZikrIndex = 0; let zikrCounter = 0; let currentRotation = 0;
const azkarData = {
    sabah: ["أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", "اللّهُ لاَ إِلَـهَ إِلاَّ هو الْحَيُّ الْقَيُّومُ", "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ"],
    maseh: ["أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ"],
    free: ["سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", "لَا إِلَهَ إِلَّا اللَّه وَحْدَهُ لَا شَرِيكَ لَهُ"]
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
    if ("vibrate" in navigator) { navigator.vibrate(40); }
}
function updateZikrDisplay() { if(document.getElementById("azkarDisplay")) document.getElementById("azkarDisplay").innerText = azkarData[currentSection][currentZikrIndex]; if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter; }
function nextZikr() { currentZikrIndex = (currentZikrIndex + 1) % azkarData[currentSection].length; zikrCounter = 0; updateZikrDisplay(); }
function resetZikrCounter() { zikrCounter = 0; if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter; }

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
    if (localStorage.getItem('quran_completed_date') !== todayStr) { localStorage.setItem('quran_completed_date', todayStr); card?.classList.add("completed"); if(btn) btn.innerText = "أنجزت ورد اليوم! 🟢"; addXp(30); }
    else { localStorage.removeItem('quran_completed_date'); card?.classList.remove("completed"); if(btn) btn.innerText = "تم قراءة ورد اليوم بنجاح 🎉"; addXp(-30); }
    saveCurrentDayToHistory();
}

function saveTodos() {
    const todos = []; completedTodosCount = 0;
    document.querySelectorAll('.todo-item').forEach(item => { const isDone = item.classList.contains('completed'); todos.push({ text: item.querySelector('.todo-text').innerText, completed: isDone }); if (isDone) completedTodosCount++; });
    localStorage.setItem('savedTodos', JSON.stringify(todos)); localStorage.setItem('completedTodosCount', completedTodosCount);
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    saveCurrentDayToHistory();
}
function createTodoElement(text, isCompleted) {
    const todoList = document.getElementById("todoList"); if (!todoList) return; const li = document.createElement("li"); li.className = `todo-item ${isCompleted ? 'completed' : ''}`;
    li.innerHTML = `<span class="todo-text">${text}</span><div style="display:flex; gap:8px;"><button class="btn-done-todo" onclick="toggleTodo(this)">${isCompleted ? 'أنجزت 🎉' : 'إنجاز ✓'}</button><button onclick="this.parentElement.parentElement.remove(); saveTodos();" style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#ef4444; padding:8px 12px; border-radius:6px; cursor:pointer;">حذف 🗑️</button></div>`;
    todoList.appendChild(li);
}
function toggleTodo(btn) { const item = btn.parentElement.parentElement; const wasCompleted = item.classList.contains("completed"); item.classList.toggle("completed"); addXp(wasCompleted ? -10 : 10); btn.innerText = item.classList.contains("completed") ? "أنجزت 🎉" : "إنجاز ✓"; saveTodos(); }

// ==========================================
// 9. التهيئة الشاملة والأكواد العشوائية
// ==========================================
const quotes = ["«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ».. اعمل اللي عليك وسيب الباقي على الله. ✨", "طلب العلم صراع نَفَس طويل وجَلد. عافر عشان فرحة النجاح! 👑", "«إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا».. كل ساعة سهر محسوبة. 📈"];
function displayCurrentDate() { if(document.getElementById("dateBar")) document.getElementById("dateBar").innerHTML = `اليوم: <span>${new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>`; }

document.addEventListener("DOMContentLoaded", () => {
    displayCurrentDate(); if(document.getElementById("quoteDisplay")) document.getElementById("quoteDisplay").innerText = quotes[Math.floor(Math.random() * quotes.length)]; updateRankUI(); renderHistoryLog();
    document.querySelectorAll('.prayer-row').forEach(row => { row.addEventListener('click', (e) => { if(e.target.type !== 'checkbox') { const chk = row.querySelector('input[type="checkbox"]'); if(chk && !chk.disabled) { chk.checked = !chk.checked; togglePrayerDone(chk.id.replace('check-', '')); } } }); });
    
    document.getElementById("startBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') === 'true') return;
        if (localStorage.getItem('hardcoreModeActive') === 'true') { const de = document.documentElement; if (de.requestFullscreen) de.requestFullscreen(); else if (de.webkitRequestFullscreen) de.webkitRequestFullscreen(); }
        localStorage.setItem('timer_isRunning', 'true'); const now = Math.floor(Date.now() / 1000);
        if (currentMode === 'free') { localStorage.setItem('timer_freeStartTime', (now - (window.secondsElapsed || 0)).toString()); startFreeTimerLoop(); }
        else { if (!window.timeLeft) window.timeLeft = modeDurations[currentMode]; localStorage.setItem('timer_endTime', (now + window.timeLeft).toString()); localStorage.removeItem('timer_pausedTimeLeft'); startCountdownLoop(); }
        updateHardcoreUI();
    });
    
    document.getElementById("pauseBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') !== 'true' || localStorage.getItem('hardcoreModeActive') === 'true') return;
        clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false');
        if (currentMode === 'free') localStorage.setItem('timer_freePausedSeconds', window.secondsElapsed.toString()); else localStorage.setItem('timer_pausedTimeLeft', window.timeLeft.toString());
    });
    
    document.getElementById("resetBtn")?.addEventListener("click", () => {
        if (localStorage.getItem('timer_isRunning') === 'true' && localStorage.getItem('hardcoreModeActive') === 'true') return;
        clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false'); localStorage.removeItem('timer_pausedTimeLeft'); localStorage.setItem('timer_freePausedSeconds', '0');
        if (currentMode === 'free') window.secondsElapsed = 0; else window.timeLeft = modeDurations[currentMode];
        updateTimerDisplayUI();
    });
    
    document.getElementById("todoBtn")?.addEventListener("click", () => { const inp = document.getElementById("todoInput"); if(inp && inp.value.trim() !== "") { createTodoElement(inp.value.trim(), false); inp.value = ""; saveTodos(); } });
    
    const saved = JSON.parse(localStorage.getItem('savedTodos')) || []; saved.forEach(t => createTodoElement(t.text, t.completed));
    if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
    if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
    
    switchAzkarSection('sabah'); generateQuranPlan(); fetchPrayerTimes(localStorage.getItem("savedCity") || "Cairo"); initTimerSystem();
});

const savedTheme = localStorage.getItem('theme') || 'dark'; document.documentElement.setAttribute('data-theme', savedTheme);
function toggleTheme() { let nt = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); localStorage.setItem('theme', nt); document.getElementById('themeToggleBtn').innerHTML = nt === 'light' ? '☀️ المظهر الفاتح' : '🌙 المظهر الداكن'; updateStreakAndChartSystem(); }

// تسجيل الـ Service Worker لربطه كـ PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered بنجاح يا هندسة! 🚀', reg.scope))
            .catch(err => console.log('فشل تسجيل الـ SW:', err));
    });
}
