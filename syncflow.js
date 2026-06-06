/* ==========================================================================
   SyncFlow Engine Logic - الّلي ذاكر فاكر © 2026
   ========================================================================== */

// تكوين افتراضي للمحرك في حال عدم توفر بيانات المواقيت فوراً
const sfDefaultPrayers = {
    Fajr: "04:10",
    Dhuhr: "12:55",
    Asr: "16:30",
    Maghrib: "19:45",
    Isha: "21:15"
};

// عند تحميل الصفحة بالكامل، ابدأ تشغيل المحرك الذكي
document.addEventListener("DOMContentLoaded", () => {
    initSyncFlowEngine();
    
    // ربط مستمعي الأحداث لأزرار التحكم الخاصة بـ SyncFlow
    const calibrateBtn = document.getElementById("sfCalibrateBtn");
    const postponeBtn = document.getElementById("sfPostponeBtn");
    const startBtn = document.getElementById("startBtn");

    if (calibrateBtn) calibrateBtn.addEventListener("click", sfCalibrateTimer);
    if (postponeBtn) postponeBtn.addEventListener("click", sfPostponeSession);
    
    // مراقبة زر بدء التايمر القديم الخاص بك لعمل فحص ديناميكي ما قبل الإقلاع
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            // ننتظر لمحة بسيطة للتأكد من أن التايمر بدأ ثم نفحص التعارض
            setTimeout(sfCheckSessionConflict, 200);
        });
    }

    // تحديث خارطة الطريق كل دقيقة لضمان دقة المواعيد
    setInterval(sfUpdateRoadmapView, 60000);
});

/**
 * تهيئة المحرك وتحديث الواجهات بناءً على البيانات الحالية
 */
function initSyncFlowEngine() {
    sfUpdateRoadmapView();
    sfCheckSessionConflict();
    sfUpdatePrayerStreakUI();
}

/**
 * جلب مواقيت الصلاة المتاحة (سواء من مشروعك أو القيم الافتراضية)
 */
function sfGetPrayerTimes() {
    // محاولة جلب المواقيت المخرنة بواسطة مشروعك القديم في الـ LocalStorage
    const savedTimes = localStorage.getItem("prayerTimes");
    if (savedTimes) {
        try {
            const parsed = JSON.parse(savedTimes);
            if (parsed && parsed.Fajr) return parsed;
        } catch (e) {
            console.log("SyncFlow: Reading local prayer times, using defaults.");
        }
    }
    return sfDefaultPrayers;
}

/**
 * تحويل الوقت بصيغة (HH:MM) إلى دقائق كلية في اليوم لسهولة الحساب الرياضي
 */
function sfTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours * 60) + minutes;
}

/**
 * الحصول على الوقت الحالي بالدقائق من بداية اليوم
 */
function sfGetCurrentMinutes() {
    const now = new Date();
    return (now.getHours() * 60) + now.getMinutes();
}

/**
 * حساب المدة المتبقية بالجلسة النشطة حالياً في التايمر القديم بالدقائق
 */
function sfGetActiveTimerMinutes() {
    const timerDisplay = document.getElementById("timerDisplay");
    if (!timerDisplay) return 0;
    
    const parts = timerDisplay.innerText.split(":").map(Number);
    if (parts.length === 3) {
        // صيغة hh:mm:ss
        return (parts[0] * 60) + parts[1] + (parts[2] > 0 ? 1 : 0);
    } else if (parts.length === 2) {
        // صيغة mm:ss
        return parts[0] + (parts[1] > 0 ? 1 : 0);
    }
    return 0;
}

/**
 * 1. تحديث وتوليد خارطة الطريق الذكية بالأعلى بالاعتماد على التوقيت الحالي والصلوات
 */
function sfUpdateRoadmapView() {
    const roadmapCard = document.getElementById("sfRoadmapCard");
    const roadmapText = document.getElementById("sfRoadmapText");
    if (!roadmapCard || !roadmapText) return;

    const prayers = sfGetPrayerTimes();
    const currentMin = sfGetCurrentMinutes();
    
    let nextPrayerName = "";
    let nextPrayerMin = 1440; // نهاية اليوم بالدقائق
    let minDistance = 1440;

    // البحث عن الصلاة القادمة
    for (const [name, time] of Object.entries(prayers)) {
        const pMin = sfTimeToMinutes(time);
        if (pMin > currentMin && (pMin - currentMin) < minDistance) {
            minDistance = pMin - currentMin;
            nextPrayerName = name;
            nextPrayerMin = pMin;
        }
    }

    // خريطة ترجمة الأسماء للعربية لجمال الواجهة
    const arabicNames = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
    const pNameAr = arabicNames[nextPrayerName] || "الصلاة القادمة";

    roadmapCard.style.display = "block";

    if (!nextPrayerName) {
        roadmapText.innerHTML = `🎯 أتممت صلوات اليوم بنجاح يا باشمهندس! وقت مثالي لمراجعة كشكول <b>بيكاسو</b> وتثبيت ملخصاتك قبل النوم. 🌙`;
        return;
    }

    const hoursLeft = Math.floor(minDistance / 60);
    const minsLeft = minDistance % 60;
    let timeLeftStr = hoursLeft > 0 ? `${hoursLeft} ساعة و ${minsLeft} دقيقة` : `${minsLeft} دقيقة`;

    // تخصيص النص ديناميكياً حسب الوقت المتبقي
    if (minDistance > 120) {
        roadmapText.innerHTML = `⏳ متبقي ${timeLeftStr} على صلاة <b>${pNameAr}</b>. قدامك نافذة ذهبية واسعة! أنسب وقت لتشغيل <b>🧠 جلسة الأبطال (4س)</b> أو إنجاز درس فيزياء/كيمياء تقيل.`;
    } else if (minDistance >= 60) {
        roadmapText.innerHTML = `⏱️ متبقي ${timeLeftStr} على صلاة <b>${pNameAr}</b>. وقت ممتاز لـ <b>⚡ جلسة الإنجاز (2س)</b> الموائمة تلقائياً، أو حل شيت تطبيق سريع ولطيف.`;
    } else {
        roadmapText.innerHTML = `⚠️ صلاة <b>${pNameAr}</b> ستؤذن بعد ${timeLeftStr}! لا تبدأ جلسة طويلة الآن. ننصحك بقراءة وردك القرآني أو مراجعة سريعة لـ <b>الّلي ذاكر فاكر</b> حتى يرفع الأذان.`;
    }
}

/**
 * 2. فحص التعارض (ما قبل الإقلاع الدراسي) والتحقق من اقتراب الصلاة
 */
function sfCheckSessionConflict() {
    const warningCard = document.getElementById("sfWarningCard");
    const warningMessage = document.getElementById("sfWarningMessage");
    const conflictView = document.getElementById("sfConflictView");
    const recallView = document.getElementById("sfRecallView");
    
    if (!warningCard || !warningMessage) return;

    // إذا كان التايمر واقف أو صفر، لا داعي لعرض تحذير التعارض
    const sessionDuration = sfGetActiveTimerMinutes();
    if (sessionDuration <= 0) {
        warningCard.style.display = "none";
        return;
    }

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

    const arabicNames = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
    const pNameAr = arabicNames[targetPrayer] || "الصلاة";

    // إذا كانت مدة الجلسة المطلوبة تتخطى وقت الصلاة القادمة (التعارض نشط)
    if (sessionDuration > minDistance && minDistance > 0) {
        // تأكد أننا لسنا في وضع الـ Active Recall حالياً
        if (recallView && recallView.style.display === "block") return;

        warningMessage.innerHTML = `برمجة الجلسة الحالية (${sessionDuration} دقيقة) تتداخل مع صلاة <b>${pNameAr}</b> القادمة بعد (${minDistance} دقيقة). صلاتك أولى يا باشمهندس؛ اختر تعديل الجلسة لتتوافق مع الأذان بالملي أو إرجاءها.`;
        warningCard.style.display = "block";
        if (conflictView) conflictView.style.display = "block";
    } else {
        // لا تعارض، اخف كارت التحذير (إلا لو كان شغال مود استدعاء نشط)
        if (recallView && recallView.style.display !== "block") {
            warningCard.style.display = "none";
        }
    }
}

/**
 * ميكانيكية التوافق الذكي (Calibrate): ضبط التايمر تلقائياً على الوقت المتبقي للصلاة بالضبط
 */
function sfCalibrateTimer() {
    const prayers = sfGetPrayerTimes();
    const currentMin = sfGetCurrentMinutes();
    let minDistance = 1440;

    for (const [_, time] of Object.entries(prayers)) {
        const pMin = sfTimeToMinutes(time);
        if (pMin > currentMin && (pMin - currentMin) < minDistance) {
            minDistance = pMin - currentMin;
        }
    }

    if (minDistance > 0 && minDistance < 1440) {
        // تحويل الدقائق إلى ثواني وتحديث الـ Display الخاص بالتايمر القديم
        let totalSeconds = minDistance * 60;
        
        // استدعاء لوجيك التحديث من نظامك (تحديث الشاشة والمتغيرات الداخلية للتايمر)
        if (window.timerInterval) clearInterval(window.timerInterval);
        
        // تحديث وعرض التايمر بصيغة واجهتك
        const display = document.getElementById("timerDisplay");
        if (display) {
            const hrs = Math.floor(minDistance / 60);
            const mins = minDistance % 60;
            display.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
        }
        
        // إرسال رسالة تحفيزية في الصندوق المخصص عندك
        const timerMsg = document.getElementById("timerMessage");
        if (timerMsg) timerMsg.innerText = `🚀 تم تفعيل الجلسة المتوافقة! التايمر هيفصل مع الأذان بالظبط. دوس ابدأ وانطلق!`;
        
        // إخفاء كارت التحذير بعد المعايرة الناجحة
        document.getElementById("sfWarningCard").style.display = "none";
    }
}

/**
 * ميكانيكية الإرجاء (Postpone): إيقاف الجلسة فوراً للاستعداد للصلاة أولاً، وتفعيل مود الاستدعاء النشط
 */
function sfPostponeSession() {
    // 1. إيقاف التايمر القديم عن طريق محاكاة الضغط على زر "فصل" أو الـ Reset عندك
    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) pauseBtn.click();

    const timerMsg = document.getElementById("timerMessage");
    if (timerMsg) timerMsg.innerText = `صناعة العظماء تبدأ من المسجد! 🕋 اذهب للصلاة، والمحرك بانتظارك.`;

    // 2. تحويل الكارت مباشرة إلى واجهة الـ Active Recall (الاستدعاء النشط)
    const conflictView = document.getElementById("sfConflictView");
    const recallView = document.getElementById("sfRecallView");
    
    if (conflictView) conflictView.style.display = "none";
    if (recallView) recallView.style.display = "block";
    
    const recallInput = document.getElementById("sfRecallInput");
    if (recallInput) {
        recallInput.value = "";
        recallInput.focus();
    }
}

/**
 * حفظ جلسة الاستدعاء النشط (Active Recall)، منح الـ XP للمستخدم، وتحديث الـ Streak
 */
function submitActiveRecall() {
    const recallInput = document.getElementById("sfRecallInput");
    if (!recallInput || recallInput.value.trim() === "") {
        alert("اكتب سطر واحد سريع يا هندسة عشان نثبته في الذاكرة ونقفل الكارت! 🎯");
        return;
    }

    const userSummary = recallInput.value.trim();
    console.log("SyncFlow [Active Recall Saved]:", userSummary);

    // إضافة الـ XP الإضافي للمستخدم كـ Reward لتفعيل عقله أثناء المشي
    if (typeof window.addXP === "function") {
        // لو دالة إضافة الـ XP موجودة في مشروعك القديم هنناديها ونضيف 25 نقطة تميز
        window.addXP(25); 
    } else {
        // لو مش موجودة، بنحدث الـ UI بشكل محاكي لإظهار المكافأة
        const xpText = document.getElementById("xpText");
        if (xpText) xpText.innerText = parseInt(xpText.innerText) + 25 + " / 120 XP";
    }

    // زيادة الالتزام بالصلوات المتتالية (Prayer Streak) داخل محرك الـ SyncFlow
    let streak = parseInt(localStorage.getItem("sfPrayerStreak") || "0");
    streak += 1;
    localStorage.setItem("sfPrayerStreak", streak);
    sfUpdatePrayerStreakUI();

    alert(`بطل يا باشمهندس مازن! 🧠 تم تثبيت المعلومة بنجاح في الذاكرة طويلة المدى، وكسبت +25 XP مكافأة التثبيت النشط.`);
    
    // إخفاء كارت الطوارئ تماماً والعودة للوضع الطبيعي المصفى
    document.getElementById("sfWarningCard").style.style = "none";
    document.getElementById("sfRecallView").style.display = "none";
}

/**
 * تحديث واجهة الـ Streak الخاصة بالصلوات في الكارت العلوي
 */
function sfUpdatePrayerStreakUI() {
    const streakDisplay = document.getElementById("sfPrayerStreakDisplay");
    if (streakDisplay) {
        const streak = localStorage.getItem("sfPrayerStreak") || "0";
        streakDisplay.innerText = `🔥 صلوات متتالية: ${streak}`;
    }
}
