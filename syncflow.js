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
    const submitRecallBtn = document.getElementById("sfSubmitRecallBtn"); // ربط زر الـ Active Recall

    if (calibrateBtn) calibrateBtn.addEventListener("click", sfCalibrateTimer);
    if (postponeBtn) postponeBtn.addEventListener("click", sfPostponeSession);
    if (submitRecallBtn) submitRecallBtn.addEventListener("click", submitActiveRecall);
    
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
        return (parts[0] * 60) + parts[1] + (parts[2] > 0 ? 1 : 0);
    } else if (parts.length === 2) {
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
    let minDistance = 1440;

    for (const [name, time] of Object.entries(prayers)) {
        const pMin = sfTimeToMinutes(time);
        if (pMin > currentMin && (pMin - currentMin) < minDistance) {
            minDistance = pMin - currentMin;
            nextPrayerName = name;
        }
    }

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

    if (minDistance > 120) {
        roadmapText.innerHTML = `⏳ متبقي ${timeLeftStr} على صلاة <b>${pNameAr}</b>. قدامك نافذة ذهبية واسعة! أنسب وقت لتشغيل <b>🧠 جلسة الأبطال (4س)</b> أو إنجاز درس فيزياء/كيمياء تقيل.`;
    } else if (minDistance >= 60) {
        roadmapText.innerHTML = `⏱️ متبقي ${timeLeftStr} على صلاة <b>${pNameAr}</b>. وقت ممتاز لـ <b>⚡ جلسة الإنجاز (2س)</b> الموائمة تلقائياً، أو حل شيت تطبيق سريع ولطيف.`;
    } else {
        roadmapText.innerHTML = `⚠️ صلاة <b>${pNameAr}</b> ستؤذن بعد ${timeLeftStr}! لا تبدأ جلسة طويلة الآن. ننصحك بقراءة وردك القرآني أو مراجعة سريعة لـ <b>الّلي ذاكر فاكر</b> حتى يرفع الأذان.`;
    }
}

/**
 * 2. فحص التعارض والتحقق من اقتراب الصلاة مع تذكر قرار المستخدم عند الريفريش
 */
function sfCheckSessionConflict() {
    const warningCard = document.getElementById("sfWarningCard");
    const warningMessage = document.getElementById("sfWarningMessage");
    const conflictView = document.getElementById("sfConflictView");
    const recallView = document.getElementById("sfRecallView");
    
    if (!warningCard || !warningMessage) return;

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

    // 🌟 فحص الذاكرة: هل قام المستخدم بحل تعارض هذه الصلاة مسبقاً؟
    const lastDecision = localStorage.getItem("sfLastDecision");
    const lastDecisionPrayer = localStorage.getItem("sfLastDecisionPrayer");

    if (lastDecisionPrayer === targetPrayer && lastDecision) {
        // إذا كان القرار تأجيلاً وواجهة الاستدعاء النشط معروضة، حافظ عليها
        if (lastDecision === 'postponed' && recallView && recallView.style.display === "block") {
            warningCard.style.display = "block";
            return;
        }
        // عدا ذلك، تم حل التعارض بنجاح؛ لا تظهر الرسالة مجدداً بعد عمل ريفريش
        warningCard.style.display = "none";
        return;
    }

    const arabicNames = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
    const pNameAr = arabicNames[targetPrayer] || "الصلاة";

    if (sessionDuration > minDistance && minDistance > 0) {
        if (recallView && recallView.style.display === "block") return;

        warningMessage.innerHTML = `برمجة الجلسة الحالية (${sessionDuration} دقيقة) تتداخل مع صلاة <b>${pNameAr}</b> القادمة بعد (${minDistance} دقيقة). صلاتك أولى يا باشمهندس؛ اختر تعديل الجلسة لتتوافق مع الأذان بالملي أو إرجاءها.`;
        warningCard.style.display = "block";
        if (conflictView) conflictView.style.display = "block";
    } else {
        if (recallView && recallView.style.display !== "block") {
            warningCard.style.display = "none";
        }
    }
}

/**
 * ميكانيكية التوافق الذكي (Calibrate): ضبط التايمر وتذكر القرار لمنع ظهوره بالريفريش
 */
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
        if (window.timerInterval) clearInterval(window.timerInterval);
        
        const display = document.getElementById("timerDisplay");
        if (display) {
            const hrs = Math.floor(minDistance / 60);
            const mins = minDistance % 60;
            display.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
        }
        
        const timerMsg = document.getElementById("timerMessage");
        if (timerMsg) timerMsg.innerText = `🚀 تم تفعيل الجلسة المتوافقة! التايمر هيفصل مع الأذان بالظبط. دوس ابدأ وانطلق!`;
        
        // 🌟 تخزين القرار لمنع رجوع الكارت عند التحديث
        localStorage.setItem("sfLastDecision", "calibrated");
        localStorage.setItem("sfLastDecisionPrayer", targetPrayer);

        document.getElementById("sfWarningCard").style.display = "none";
    }
}

/**
 * ميكانيكية الإرجاء (Postpone): إيقاف الجلسة وتجهيز مود الاستدعاء النشط مع حفظ الحالة
 */
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

    // 🌟 تخزين قرار الإرجاء للمحافظة على واجهة الاستدعاء عند عمل ريفريش
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
}

/**
 * حفظ جلسة الاستدعاء النشط (Active Recall)، تنظيف قرارات الصلاة الحالية لتستعد للقادمة
 */
function submitActiveRecall() {
    const recallInput = document.getElementById("sfRecallInput");
    if (!recallInput || recallInput.value.trim() === "") {
        alert("اكتب سطر واحد سريع يا هندسة عشان نثبته في الذاكرة ونقفل الكارت! 🎯");
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

    // 🌟 تفريغ سجل القرارات لتجهيز المحرك بشكل كامل للصلاة التالية
    localStorage.removeItem("sfLastDecision");
    localStorage.removeItem("sfLastDecisionPrayer");

    alert(`بطل يا باشمهندس مازن! 🧠 تم تثبيت المعلومة بنجاح في الذاكرة طويلة المدى، وكسبت +25 XP مكافأة التثبيت النشط.`);
    
    // 🛠️ تصحيح الإخفاء البرمجي للكروت لتلافي أي أخطاء ثانوية
    document.getElementById("sfWarningCard").style.display = "none";
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
