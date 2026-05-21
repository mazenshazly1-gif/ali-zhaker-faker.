// ==========================================
// 1. الدوال الأساسية لواجهة التحكم (أول حاجة يشوفها المتصفح)
// ==========================================
let currentActiveInterface = 'study'; 

function toggleInterface() {
    const studyTab = document.getElementById('studyTab');
    const deenTab = document.getElementById('deenTab');
    const switchBtn = document.getElementById('tabSwitchBtn');
    
    if (!studyTab || !deenTab || !switchBtn) return;

    if (currentActiveInterface === 'study') {
        studyTab.style.display = 'none';
        deenTab.style.display = 'block';
        currentActiveInterface = 'deen';
        document.documentElement.setAttribute('data-interface', 'deen');
        switchBtn.innerText = '📚 واجهة المذاكرة';
        switchBtn.classList.add('study-mode-active');
        
        if(document.getElementById("analyticsTitle")) document.getElementById("analyticsTitle").style.color = "#10b981";
        if(document.getElementById("totalAzkarBox")) document.getElementById("totalAzkarBox").style.background = "rgba(16, 185, 129, 0.05)";
        
        updateZikrDisplay();
    } else {
        deenTab.style.display = 'none';
        studyTab.style.display = 'block';
        currentActiveInterface = 'study';
        document.documentElement.removeAttribute('data-interface');
        switchBtn.innerText = '🕋 الواحة الدينية';
        switchBtn.classList.remove('study-mode-active');
        
        if(document.getElementById("analyticsTitle")) document.getElementById("analyticsTitle").style.color = "#f59e0b";
        if(document.getElementById("totalAzkarBox")) document.getElementById("totalAzkarBox").style.background = "rgba(139, 92, 246, 0.05)";
    }
    
    updateTimerDisplayUI();
    checkNextPrayer();
}

function setMode(mode) {
    clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false');
    currentMode = mode; localStorage.setItem('timer_currentMode', mode);
    localStorage.removeItem('timer_pausedTimeLeft'); localStorage.setItem('timer_freePausedSeconds', '0');
    document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
    
    if (window.event && window.event.currentTarget) { window.event.currentTarget.classList.add('active'); }
    if (mode === 'free') window.secondsElapsed = 0; else window.timeLeft = modeDurations[mode];
    const timerMessage = document.getElementById("timerMessage");
    if (timerMessage) timerMessage.innerText = modeMessages[mode]; updateTimerDisplayUI();
}

// ==========================================
// 2. المتغيرات والبيانات (Global Setup) + سيستم الرتب والـ XP
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

// إعدادات الـ XP والرتب الجديدة بتاعت ميزو
let userXp = parseFloat(localStorage.getItem('userXp')) || 0.0;
const RANKS = [
    { name: "1. مبتدئ بيسخن 🥶⏳", minXp: 0, maxXp: 120 },
    { name: "2. بطل المواجهة 🔥⚔️", minXp: 120, maxXp: 500 },
    { name: "3. إنت كدا أيقونة 👑⭐", minXp: 500, maxXp: 999999 }
];

function addXp(amount) {
    userXp += amount;
    localStorage.setItem('userXp', userXp.toFixed(1));
    updateRankUI();
}

function updateRankUI() {
    let currentRank = RANKS[0];
    for (let i = 0; i < RANKS.length; i++) {
        if (userXp >= RANKS[i].minXp) {
            currentRank = RANKS[i];
        }
    }
    
    const rankTitleEl = document.getElementById("rankTitle");
    const xpTextEl = document.getElementById("xpText");
    const xpBarFillEl = document.getElementById("xpBarFill");
    
    if (rankTitleEl) rankTitleEl.innerText = currentRank.name;
    
    if (currentRank.maxXp === 999999) {
        if (xpTextEl) xpTextEl.innerText = `${userXp.toFixed(0)} XP (قـفّلت اللعبة! 🛡️)`;
        if (xpBarFillEl) xpBarFillEl.style.width = "100%";
    } else {
        let progress = ((userXp - currentRank.minXp) / (currentRank.maxXp - currentRank.minXp)) * 100;
        if (xpTextEl) xpTextEl.innerText = `${userXp.toFixed(0)} / ${currentRank.maxXp} XP`;
        if (xpBarFillEl) xpBarFillEl.style.width = `${progress}%`;
    }
}

let prayerTimesData = {};
const prayerNamesArabic = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
let completedPrayers = JSON.parse(localStorage.getItem('completedPrayers')) || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };

let currentSection = 'sabah'; 
let currentZikrIndex = 0; 
let zikrCounter = 0;
let totalAzkarCount = parseInt(localStorage.getItem('totalAzkarCount')) || 0;
let currentRotation = 0;
let globalStartPage = 1;

const quotes = [
    "«وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ وَأَنَّ سَعْيَهُ سوفَ يُرَىٰ».. اعمل اللي عليك وسيب الباقي على صاحب التدبير. ✨",
    "طلب العلم مش صراع ذكاء، هو صراع نَفَس طويل وجَلد. عافر عشان فرحة السجدة بتاعت النجاح الكبير! 👑",
    "«إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا».. كل ساعة سهر وتعب محسوبة ومستنياك في حصاد نجاحك. 📈",
    "كل سطر بتذاكره وبتتعلمه النهاردة، هو طوبة بتبني بيها طريقك لمستقبل عظيم وقوي يستاهل تعبك. 💻⚡"
];

const azkarData = {
    sabah: [
        "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        "اللّهُ لاَ إِلَـهَ إِلاَّ هو الْحَيُّ الْقَيُّومُ (آية الكرسي)",
        "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ"
    ],
    maseh: [
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَسِيرُ",
        "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (3 مرات)",
        "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ"
    ],
    free: [
        "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        "لَا إِلَهَ إِلَّا اللَّه وَحْدَهُ لَا شَرِيكَ لَهُ"
    ]
};

// ==========================================
// 3. المظهر والسمات (Theme)
// ==========================================
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' || !currentTheme ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButtonUI(newTheme);
}
function updateThemeButtonUI(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = theme === 'light' ? '☀️ المظهر الفاتح' : '🌙 المظهر الداكن';
}
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// ==========================================
// 4. مواقيت الصلاة والعداد التنازلي المزدوج
// ==========================================
function convertTo12HourFormat(timeStr) {
    if(!timeStr) return "--:--";
    let [hours, minutes] = timeStr.split(':').map(Number);
    let ampm = hours >= 12 ? 'م' : 'ص'; hours = hours % 12; hours = hours ? hours : 12;
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

function updatePrayersAnalyticsUI() {
    let count = 0;
    for (const key in completedPrayers) {
        if (completedPrayers[key] === true) count++;
        const checkbox = document.getElementById(`check-${key}`); 
        const row = document.getElementById(`p-${key}`);
        if(checkbox && row) {
            checkbox.checked = completedPrayers[key];
            if(completedPrayers[key]) row.classList.add("completed-prayer"); else row.classList.remove("completed-prayer");
        }
    }
    const statElement = document.getElementById("statPrayers"); 
    if (statElement) statElement.innerText = `${count}/5`;
}

function togglePrayerDone(prayerKey) {
    const checkbox = document.getElementById(`check-${prayerKey}`);
    const row = document.getElementById(`p-${prayerKey}`);
    if (!checkbox || checkbox.disabled) { if(checkbox) checkbox.checked = false; return; }
    completedPrayers[prayerKey] = checkbox.checked;
    localStorage.setItem('completedPrayers', JSON.stringify(completedPrayers));
    if (checkbox.checked) {
        row.classList.add("completed-prayer");
    } else {
        row.classList.remove("completed-prayer");
    }
    updatePrayersAnalyticsUI();
}

document.querySelectorAll('.prayer-row').forEach(row => {
    row.addEventListener('click', (e) => {
        if(e.target.type !== 'checkbox') {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if(checkbox && !checkbox.disabled) {
                checkbox.checked = !checkbox.checked;
                const prayerKey = checkbox.id.replace('check-', '');
                togglePrayerDone(prayerKey);
            }
        }
    });
});

function updatePrayerUI() {
    for (const [key, value] of Object.entries(prayerTimesData)) {
        const element = document.getElementById(`time-${key}`); 
        if (element) element.innerText = convertTo12HourFormat(value);
    }
    checkNextPrayer();
}

function checkNextPrayer() {
    if (!prayerTimesData || Object.keys(prayerTimesData).length === 0) return;
    const now = new Date(); let minDiff = Infinity; let nextPrayerKey = "";
    
    document.querySelectorAll('.prayer-row').forEach(row => { 
        if (!row.classList.contains('completed-prayer')) row.classList.remove('next-active', 'prayer-available'); 
    });
    
    for (const [key, timeStr] of Object.entries(prayerTimesData)) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerTime = new Date(); prayerTime.setHours(hours, minutes, 0, 0);
        let diff = prayerTime - now;
        const checkbox = document.getElementById(`check-${key}`); 
        const row = document.getElementById(`p-${key}`);
        
        if (now >= prayerTime) {
            if (checkbox) checkbox.disabled = false;
            if (row && !completedPrayers[key]) row.classList.add('prayer-available');
        } else {
            if (checkbox) { checkbox.disabled = true; checkbox.checked = false; }
            completedPrayers[key] = false; if(row) row.classList.remove("completed-prayer");
        }
        
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextPrayerKey = key; }
    }
    updatePrayersAnalyticsUI();
    
    if (nextPrayerKey === "") {
        nextPrayerKey = "Fajr";
        const [hours, minutes] = prayerTimesData.Fajr.split(':').map(Number);
        const prayerTime = new Date(); prayerTime.setDate(prayerTime.getDate() + 1); prayerTime.setHours(hours, minutes, 0, 0);
        minDiff = prayerTime - now;
    }
    
    const activeRow = document.getElementById(`p-${nextPrayerKey}`);
    if (activeRow && !completedPrayers[nextPrayerKey]) activeRow.classList.add('next-active');
    
    const totalSeconds = Math.floor(minDiff / 1000);
    const h = Math.floor(totalSeconds / 3600); 
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const countdownElement = document.getElementById("nextPrayerCountdown");
    if (countdownElement) countdownElement.innerText = `متبقي على ${prayerNamesArabic[nextPrayerKey]}: ${h}س و ${m}د`;
    
    const headerCountdownElement = document.getElementById("headerPrayerCountdown");
    if (headerCountdownElement) {
        headerCountdownElement.innerText = `🕋 ${prayerNamesArabic[nextPrayerKey]}: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}

async function fetchPrayerTimes(city) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Egypt&method=5`);
        const data = await response.json();
        if (data.code === 200) {
            const timings = data.data.timings;
            prayerTimesData = { Fajr: timings.Fajr, Dhuhr: timings.Dhuhr, Asr: timings.Asr, Maghrib: timings.Maghrib, Isha: timings.Isha };
            updatePrayerUI();
        }
    } catch (e) { console.log("خطأ في جلب الأوقات", e); }
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
                if(btn) { btn.innerText = "تم تفعيل الإشعارات بنجاح 🟢"; btn.classList.add("activated"); }
            }
        });
    }
}

// ==========================================
// 5. سيستم واحة الأذكار والسبحة التفاعلية
// ==========================================
function switchAzkarSection(secName) {
    currentSection = secName; currentZikrIndex = 0; zikrCounter = 0;
    document.querySelectorAll('.btn-azkar-section').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`sec-${secName}`);
    if(activeBtn) activeBtn.classList.add('active');
    
    const selectorContainer = document.getElementById("freeZikrSelectorContainer");
    if (secName === 'free') { 
        if(selectorContainer) selectorContainer.style.display = 'block'; 
        if(document.getElementById("freeZikrSelect")) document.getElementById("freeZikrSelect").value = "0"; 
    } else { 
        if(selectorContainer) selectorContainer.style.display = 'none'; 
    }
    updateZikrDisplay();
}

function changeFreeZikr() {
    currentZikrIndex = parseInt(document.getElementById("freeZikrSelect").value); zikrCounter = 0; updateZikrDisplay();
}

// تم دمج الـ XP هنا: كل تسبيحة = 0.5 XP لرفع المستوى
function countZikr() {
    zikrCounter++; totalAzkarCount++;
    if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter;
    localStorage.setItem('totalAzkarCount', totalAzkarCount);
    if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    
    addXp(0.5); // زيادة الـ XP من السبحة
    
    const circle = document.getElementById("beadsCircle"); 
    if(circle) {
        currentRotation += 25;
        circle.style.transform = `rotate(${currentRotation}deg)`; circle.classList.add("pulsing");
        setTimeout(() => circle.classList.remove("pulsing"), 150);
    }
    if ("vibrate" in navigator) { navigator.vibrate(40); }
}

function updateZikrDisplay() {
    if(document.getElementById("azkarDisplay")) document.getElementById("azkarDisplay").innerText = azkarData[currentSection][currentZikrIndex];
    if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter;
}

function nextZikr() {
    currentZikrIndex = (currentZikrIndex + 1) % azkarData[currentSection].length; zikrCounter = 0; updateZikrDisplay();
}

function resetZikrCounter() { 
    zikrCounter = 0; 
    if(document.getElementById("zikrCounterBtn")) document.getElementById("zikrCounterBtn").innerText = zikrCounter; 
}

// ==========================================
// 6. سيستم الورد القرآني والمودال
// ==========================================
function generateQuranPlan() {
    const targetSelect = document.getElementById("quranTargetSelect");
    if(!targetSelect) return;
    const targetPages = parseInt(targetSelect.value);
    const dayOfMonth = new Date().getDate();
    
    globalStartPage = ((dayOfMonth * 7) % 580) + 1; 
    let endPage = globalStartPage + targetPages - 1;
    
    let suggestedSurah = "البقرة";
    if (globalStartPage > 50) suggestedSurah = "آل عمران";
    if (globalStartPage > 110) suggestedSurah = "النساء";
    if (globalStartPage > 170) suggestedSurah = "المائدة";
    if (globalStartPage > 230) suggestedSurah = "الأعراف";
    if (globalStartPage > 300) suggestedSurah = "يونس";
    if (globalStartPage > 400) suggestedSurah = "الإسراء";
    if (globalStartPage > 500) suggestedSurah = "الملك";
    
    const displayBox = document.getElementById("quranSuggestionBox");
    if(displayBox) {
        displayBox.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: #059669;">وردك للنهاردة بركة يومك ✨</h3>
            <p style="font-size: 16px; font-weight: 700; margin: 5px 0;">
                قراءة من <span style="color:#10b981;">صفحة ${globalStartPage}</span> إلى <span style="color:#10b981;">صفحة ${endPage}</span> (سورة ${suggestedSurah})
            </p>
        `;
    }
    
    const lastSavedDate = localStorage.getItem('quran_completed_date');
    const todayStr = new Date().toDateString();
    const btn = document.getElementById("btnCompleteQuran");
    const card = document.querySelector(".quran-card");
    
    if (lastSavedDate === todayStr) {
        if(card) card.classList.add("completed"); 
        if(btn) { btn.innerText = "أنجزت ورد اليوم! 🟢"; btn.style.opacity = "0.7"; }
    } else {
        if(card) card.classList.remove("completed"); 
        if(btn) { btn.innerText = "تم قراءة ورد اليوم بنجاح 🎉"; btn.style.opacity = "1"; }
    }
}

function playBeepSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const times = [0, 0.3, 0.6]; 
    
    times.forEach((time) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine'; 
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + time); 
        
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + time + 0.2);
        
        oscillator.start(audioCtx.currentTime + time);
        oscillator.stop(audioCtx.currentTime + time + 0.2);
    });
}

function openQuranModal() {
    const modal = document.getElementById("quranModal");
    const iframe = document.getElementById("quranIframe");
    const title = document.getElementById("quranModalTitle");
    
    if(modal && iframe && title) {
        iframe.src = `https://quran.com/page/${globalStartPage}`;
        title.innerText = `📖 مصحفك الإلكتروني - الورد يبدأ من صفحة (${globalStartPage})`;
        modal.style.display = "flex";
    }
}

function closeQuranModal() {
    if(document.getElementById("quranModal")) document.getElementById("quranModal").style.display = "none";
    if(document.getElementById("quranIframe")) document.getElementById("quranIframe").src = ""; 
}

function toggleQuranDone() {
    const todayStr = new Date().toDateString();
    const lastSavedDate = localStorage.getItem('quran_completed_date');
    const btn = document.getElementById("btnCompleteQuran");
    const card = document.querySelector(".quran-card");
    
    if (lastSavedDate !== todayStr) {
        localStorage.setItem('quran_completed_date', todayStr);
        if(card) card.classList.add("completed"); 
        if(btn) { btn.innerText = "أنجزت ورد اليوم! 🟢"; btn.style.opacity = "0.7"; }
        if ("vibrate" in navigator) { navigator.vibrate([50, 50, 50]); }
        addXp(30); // بونص قراءة الورد اليومي
    } else {
        localStorage.removeItem('quran_completed_date');
        if(card) card.classList.remove("completed"); 
        if(btn) { btn.innerText = "تم قراءة ورد اليوم بنجاح 🎉"; btn.style.opacity = "1"; }
    }
}

// ==========================================
// 7. سيستم التايمر (Timer Logic) + زيادة الـ XP التلقائية مع الثواني
// ==========================================
function updateTimerDisplayUI() {
    const timerDisplay = document.getElementById("timerDisplay");
    if (!timerDisplay) return;
    let currentSeconds = (currentMode === 'free') ? (window.secondsElapsed || 0) : (window.timeLeft || modeDurations[currentMode]);
    let h = Math.floor(currentSeconds / 3600); let m = Math.floor((currentSeconds % 3600) / 60); let s = currentSeconds % 60;
    timerDisplay.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function handleTimerFinishedComplete() {
    clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false'); localStorage.removeItem('timer_pausedTimeLeft');
    window.timeLeft = modeDurations[currentMode]; updateTimerDisplayUI();
    const timerMessage = document.getElementById("timerMessage");
    if (timerMessage) timerMessage.innerText = "🎉 كفووو! خلصت الجلسة بنجاح، أنت بطل! خُد بريك.";
    
    playBeepSound(); 

    if (Notification.permission === "granted") { 
        new Notification("👑 إنجاز جديد ومميز!", { 
            body: `عاش يا بطل! انتهت جلسة التركيز بنجاح. خُد بريك سريِع وفوق كده.`,
            vibrate: [200, 100, 200]
        }); 
    }
}

// تعديل الـ Loop لإضافة (1/60 من الـ XP) كل ثانية مذاكرة حقيقية
function startCountdownLoop() {
    clearInterval(timerInterval); 
    const timerMessage = document.getElementById("timerMessage");
    if (timerMessage) timerMessage.innerText = modeMessages[currentMode];
    timerInterval = setInterval(() => {
        let remaining = parseInt(localStorage.getItem('timer_endTime')) - Math.floor(Date.now() / 1000);
        if (remaining > 0) {
            window.timeLeft = remaining; totalHoursStudied += (1 / 3600); localStorage.setItem('totalHoursStudied', totalHoursStudied.toString());
            if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
            
            addXp(1 / 60); // كل دقيقة مذاكرة بتديك 1 XP كامل
            updateTimerDisplayUI();
        } else { handleTimerFinishedComplete(); }
    }, 1000);
}

function startFreeTimerLoop() {
    clearInterval(timerInterval); 
    const timerMessage = document.getElementById("timerMessage");
    if (timerMessage) timerMessage.innerText = modeMessages[currentMode];
    timerInterval = setInterval(() => {
        window.secondsElapsed = Math.floor(Date.now() / 1000) - parseInt(localStorage.getItem('timer_freeStartTime'));
        totalHoursStudied += (1 / 3600); localStorage.setItem('totalHoursStudied', totalHoursStudied.toString());
        if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
        
        addXp(1 / 60); // زيادة الـ XP في العداد الحر
        updateTimerDisplayUI();
    }, 1000);
}

function initTimerSystem() {
    document.querySelectorAll('.btn-mode').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${currentMode}'`)) { btn.classList.add('active'); }
    });
    const isRunning = localStorage.getItem('timer_isRunning') === 'true';
    if (isRunning) {
        if (currentMode === 'free') {
            const startTime = parseInt(localStorage.getItem('timer_freeStartTime'));
            window.secondsElapsed = (Math.floor(Date.now() / 1000) - startTime) + (parseInt(localStorage.getItem('timer_freePausedSeconds')) || 0);
            startFreeTimerLoop();
        } else {
            let remaining = parseInt(localStorage.getItem('timer_endTime')) - Math.floor(Date.now() / 1000);
            if (remaining > 0) { window.timeLeft = remaining; startCountdownLoop(); } else { handleTimerFinishedComplete(); }
        }
    } else {
        if (currentMode === 'free') { window.secondsElapsed = parseInt(localStorage.getItem('timer_freePausedSeconds')) || 0; }
        else { const hasPausedTime = localStorage.getItem('timer_pausedTimeLeft'); window.timeLeft = hasPausedTime ? parseInt(hasPausedTime) : modeDurations[currentMode]; }
        updateTimerDisplayUI(); 
        const timerMessage = document.getElementById("timerMessage");
        if (timerMessage) timerMessage.innerText = modeMessages[currentMode];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("startBtn")) {
        document.getElementById("startBtn").addEventListener("click", () => {
            if (localStorage.getItem('timer_isRunning') === 'true') return;
            localStorage.setItem('timer_isRunning', 'true'); const now = Math.floor(Date.now() / 1000);
            if (currentMode === 'free') {
                const alreadyElapsed = window.secondsElapsed || 0; localStorage.setItem('timer_freeStartTime', (now - alreadyElapsed).toString()); startFreeTimerLoop();
            } else {
                if (!window.timeLeft) window.timeLeft = modeDurations[currentMode];
                localStorage.setItem('timer_endTime', (now + window.timeLeft).toString()); localStorage.removeItem('timer_pausedTimeLeft'); startCountdownLoop();
            }
        });
    }
    if(document.getElementById("pauseBtn")) {
        document.getElementById("pauseBtn").addEventListener("click", () => {
            if (localStorage.getItem('timer_isRunning') !== 'true') return;
            clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false');
            if (currentMode === 'free') localStorage.setItem('timer_freePausedSeconds', window.secondsElapsed.toString());
            else localStorage.setItem('timer_pausedTimeLeft', window.timeLeft.toString());
            const timerMessage = document.getElementById("timerMessage");
            if (timerMessage) timerMessage.innerText = "⏸️ تم إيقاف الجلسة مؤقتاً.. ارتاح شوية وكمل!";
        });
    }
    if(document.getElementById("resetBtn")) {
        document.getElementById("resetBtn").addEventListener("click", () => {
            clearInterval(timerInterval); localStorage.setItem('timer_isRunning', 'false');
            localStorage.removeItem('timer_pausedTimeLeft'); localStorage.setItem('timer_freePausedSeconds', '0');
            if (currentMode === 'free') window.secondsElapsed = 0; else window.timeLeft = modeDurations[currentMode];
            const timerMessage = document.getElementById("timerMessage");
            if (timerMessage) timerMessage.innerText = modeMessages[currentMode]; updateTimerDisplayUI();
        });
    }
});

// ==========================================
// 8. سيستم قائمة المهام اليومية (To-Do List) + بونص إنجاز المهمة
// ==========================================
function saveTodos() {
    const todos = []; completedTodosCount = 0;
    document.querySelectorAll('.todo-item').forEach(item => {
        const isDone = item.classList.contains('completed');
        todos.push({ text: item.querySelector('.todo-text').innerText, completed: isDone }); if (isDone) completedTodosCount++;
    });
    localStorage.setItem('savedTodos', JSON.stringify(todos)); localStorage.setItem('completedTodosCount', completedTodosCount);
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
}

function createTodoElement(text, isCompleted) {
    const todoList = document.getElementById("todoList");
    if (!todoList) return; 
    const li = document.createElement("li"); li.className = `todo-item ${isCompleted ? 'completed' : ''}`;
    li.innerHTML = `<span class="todo-text">${text}</span><div style="display:flex; gap:8px;"><button class="btn-done-todo" onclick="toggleTodo(this)">${isCompleted ? 'أنجزت 🎉' : 'إنجاز ✓'}</button><button onclick="this.parentElement.parentElement.remove(); saveTodos();" style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#ef4444; padding:8px 12px; border-radius:6px; cursor:pointer;">حذف 🗑️</button></div>`;
    todoList.appendChild(li);
}

// دمج الـ XP هنا: كل علامة صح ✅ تديك 10 XP للمستويات
function toggleTodo(btn) {
    const item = btn.parentElement.parentElement; 
    const wasCompleted = item.classList.contains("completed");
    item.classList.toggle("completed");
    
    if (!wasCompleted) {
        addXp(10); // بونص إنجاز التاسك
    } else {
        addXp(-10); // سحب الـ XP لو شال علامة الإنجاز
    }
    
    btn.innerText = item.classList.contains("completed") ? "أنجزت 🎉" : "إنجاز ✓"; saveTodos();
}

function loadTodos() {
    const saved = JSON.parse(localStorage.getItem('savedTodos')) || []; 
    saved.forEach(t => createTodoElement(t.text, t.completed));
    if (document.getElementById("statTodos")) document.getElementById("statTodos").innerText = completedTodosCount;
}

function displayCurrentDate() {
    const today = new Date();
    const arabicDate = today.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if(document.getElementById("dateBar")) document.getElementById("dateBar").innerHTML = `اليوم: <span>${arabicDate}</span>`;
}

function getNewQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    if(document.getElementById("quoteDisplay")) document.getElementById("quoteDisplay").innerText = quotes[randomIndex];
}

// ==========================================
// 9. تشغيل الكل عند تحميل الصفحة (Initialization)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    updateThemeButtonUI(savedTheme); displayCurrentDate(); getNewQuote();
    updateRankUI(); // تشغيل الرتب فور فتح الصفحة
    
    if ("Notification" in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    if (document.getElementById("quoteBtn")) document.getElementById("quoteBtn").addEventListener("click", getNewQuote);
    
    const todoBtn = document.getElementById("todoBtn");
    const todoInput = document.getElementById("todoInput");
    if (todoBtn) { 
        todoBtn.addEventListener("click", () => { 
            if(todoInput && todoInput.value.trim() !== "") { 
                createTodoElement(todoInput.value.trim(), false); 
                todoInput.value = ""; 
                saveTodos(); 
            } 
        }); 
    }
    
    loadTodos(); 
    switchAzkarSection('sabah');
    generateQuranPlan(); 
    
    if (document.getElementById("statHours")) document.getElementById("statHours").innerText = totalHoursStudied.toFixed(2);
    if (document.getElementById("statAzkar")) document.getElementById("statAzkar").innerText = totalAzkarCount;
    if (Notification.permission === "granted" && document.getElementById("notifBtn")) { 
        document.getElementById("notifBtn").innerText = "تم تفعيل الإشعارات بنجاح 🟢"; 
        document.getElementById("notifBtn").classList.add("activated"); 
    }
    
    const savedCity = localStorage.getItem("savedCity") || "Cairo";
    if (document.getElementById("citySelect")) document.getElementById("citySelect").value = savedCity;
    
    fetchPrayerTimes(savedCity); 
    initTimerSystem(); 
    
    setInterval(checkNextPrayer, 1000);
});
