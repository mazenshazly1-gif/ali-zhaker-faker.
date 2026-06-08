/* ==========================================================================
   🕋 منظومة مقامات السنن والبركة الذكية - الّلي ذاكر فاكر © 2026
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initDeenTimeChallenges();
    // فحص دوري كل دقيقة لتحديث المقام تلقائياً إذا تغير الوقت
    setInterval(initDeenTimeChallenges, 60000);
});

// قاعدة بيانات مكتبة السنن والمقامات الخمسة وفضلها وتدبرها
const deenPeriodsData = {
    dhaha: {
        title: "مقام ركعتي البركة واليسر",
        description: "صلاة الضحى الأوابين لفتح أبواب التوفيق وتيسير الفهم.",
        tip: "💡 <b>لمحة البركة:</b> صلاة الضحى تُجزئ عن 360 صدقة عن كُل سُلامى (مفصل) في جسدك، وتكفيك همّ يومك وتجلب التيسير والبركة في ساعات المذاكرة.",
        icon: "☀️",
        badgeText: "فترة الضحى والبركة"
    },
    rawatib: {
        title: "مقام الحصن الراتب المشيد",
        description: "السنن الرواتب التابعة للصلوات المفروضة لتجديد الطاقة والتركيز.",
        tip: "💡 <b>لمحة البركة:</b> السنن الرواتب هي (2 قبل الفجر، 4 قبل الظهر و2 بعده، 2 بعد المغرب، 2 بعد العشاء). فضلها عظيم حيث يبني الله للعبد المحافظ عليها بيتاً في الجنة.",
        icon: "🛡️",
        badgeText: "فترة السنن الرواتب"
    },
    sakina: {
        title: "مقام السكينة والغروب المتجدد",
        description: "ترديد أذكار المساء أو جلسة استغفار خفيفة لطرد القلق والشتات النفسي.",
        tip: "💡 <b>لمحة البركة:</b> الذكر والاستغفار في هذا الوقت يطرد هموم ضغط المذاكرة والامتحانات، ويملأ قلبك طمأنينة ويقينًا بأن الله معك ولن يضيع تعبك.",
        icon: "🌊",
        badgeText: "فترة السكينة والغروب"
    },
    bashair: {
        title: "مقام آية الكرسي وخواتيم البقرة",
        description: "قراءة آية الكرسي دبر الصلاة المكتوبة وخواتيم سورة البقرة بحضور قلب.",
        tip: "💡 <b>لمحة البركة:</b> من قرأ آية الكرسي دبر كل صلاة لم يمنعه من دخول الجنة إلا أن يموت، وخواتيم البقرة (آمن الرسول...) كفتاه من كل سوء ونفسية سيئة ليلته.",
        icon: "📖",
        badgeText: "فترة ما بين العشائين"
    },
    witr: {
        title: "مقام سفينة النجاة والختام النوراني",
        description: "صلاة ركعة الوتر والدعاء بالتوفيق وسورة الملك قبل النوم لفصل الدماغ.",
        tip: "💡 <b>لمحة البركة:</b> صلاة الوتر هي ختام صلاة الليل، وإن الله وتر يحب الوتر. سورة الملك تنجي من عذاب القبر وتجعل نومك عبادة وراحة تامة لعقلك الباطن.",
        icon: "⚓",
        badgeText: "فترة جوف الليل والختام"
    }
};

// تحميل البيانات والحالات من الـ localStorage
let dtStates = JSON.parse(localStorage.getItem("dt_challenges_states")) || {};
let dtStreak = parseInt(localStorage.getItem("dt_challenges_streak")) || 0;
let dtLastCheckedDate = localStorage.getItem("dt_challenges_last_date") || "";

function initDeenTimeChallenges() {
    checkDeenNewDayReset();
    determineCurrentPeriodAndRender();
    updateDtStreakUI();
}

/**
 * فحص وتصفير فترات اليوم الجديد مع ميكانيكية الـ Streak المرن (فترتين للإنقاذ)
 */
function checkDeenNewDayReset() {
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

    if (dtLastCheckedDate !== "" && dtLastCheckedDate !== todayStr) {
        // حساب كم فترة أنجزها الطالب بالأمس قبل المسح
        const periods = ["dhaha", "rawatib", "sakina", "bashair", "witr"];
        let completedYesterdayCount = 0;
        periods.forEach(p => {
            if (dtStates[p] === true) completedYesterdayCount++;
        });

        // لو لم ينجز فترتين على الأقل.. يصفر الستريك
        if (completedYesterdayCount < 2 && dtLastCheckedDate !== todayStr) {
            // للتأكد أنه ليس انتقال عشوائي بل فوت حقيقي ليوم كامل
            if (dtLastCheckedDate !== yesterdayStr) {
                dtStreak = 0;
            } else if (completedYesterdayCount < 2) {
                dtStreak = 0;
            }
            localStorage.setItem("dt_challenges_streak", dtStreak);
        }

        // تصفير فترات اليوم الجديد تماماً
        dtStates = {};
        localStorage.setItem("dt_challenges_states", JSON.stringify(dtStates));
        localStorage.setItem("dt_challenges_last_date", todayStr);
    }
    
    if (dtLastCheckedDate === "") {
        localStorage.setItem("dt_challenges_last_date", todayStr);
    }
}

/**
 * دالة تحديد الفترة الحالية بدقة بناءً على مواقيت الصلاة الفعلية للـ API المتاحة في الـ localStorage
 */
function determineCurrentPeriodAndRender() {
    // جلب أوقات الصلاة المخزنة في تطبيقك الأصلي
    let cachedTimes = null;
    try {
        cachedTimes = JSON.parse(localStorage.getItem('cachedPrayerTimes'));
    } catch(e) { cachedTimes = null; }

    // مواقيت افتراضية ذكية ومحبوكة في حال عدم وجود نت أو كاش للـ API لتفادي الكراش نهائياً
    let shrooqTime = "06:00";
    let dhuhrTime = "12:00";
    let asrTime = "15:30";
    let maghribTime = "18:45";
    let ishaTime = "20:15";
    let fajrTime = "04:30";

    if (cachedTimes && cachedTimes.data && cachedTimes.data.timings) {
        const t = cachedTimes.data.timings;
        shrooqTime = t.Sunrise || shrooqTime;
        dhuhrTime = t.Dhuhr || dhuhrTime;
        asrTime = t.Asr || asrTime;
        maghribTime = t.Maghrib || maghribTime;
        ishaTime = t.Isha || ishaTime;
        fajrTime = t.Fajr || fajrTime;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // دالة مساعدة لتحويل صيغة HH:MM لدقائق مطلقّة
    const timeToMin = (tStr) => {
        const splitted = tStr.split(':');
        return parseInt(splitted[0]) * 60 + parseInt(splitted[1]);
    };

    const minShrooq = timeToMin(shrooqTime);
    const minDhuhr = timeToMin(dhuhrTime);
    const minAsr = timeToMin(asrTime);
    const minMaghrib = timeToMin(maghribTime);
    const minIsha = timeToMin(ishaTime);
    const minFajr = timeToMin(fajrTime);

    let currentPeriodKey = "witr"; // الافتراضي قيام الليل

    // تقسيم النوافذ الزمنية ديناميكياً بناءً على حركة الصلوات الفاشل تداخلها
    if (currentMinutes >= minShrooq && currentMinutes < minDhuhr) {
        currentPeriodKey = "dhaha";
    } else if (currentMinutes >= minDhuhr && currentMinutes < minAsr) {
        currentPeriodKey = "rawatib";
    } else if (currentMinutes >= minAsr && currentMinutes < minMaghrib) {
        currentPeriodKey = "sakina";
    } else if (currentMinutes >= minMaghrib && currentMinutes < minIsha) {
        currentPeriodKey = "bashair";
    } else {
        // من بعد العشاء حتى الفجر، أو من الفجر للشروق
        currentPeriodKey = "witr";
    }

    renderCurrentChallengeUI(currentPeriodKey);
}

/**
 * رندرة وعرض كارت المقام الحالي والتحقق من حالة الإنجاز أو فوات الوقت
 */
function renderCurrentChallengeUI(activePeriodKey) {
    const data = deenPeriodsData[activePeriodKey];
    if (!data) return;

    // تحديث الهوية والنصوص بداخل الكارت
    document.getElementById("dtPeriodBadge").innerText = data.badgeText;
    document.getElementById("dtIcon").innerText = data.icon;
    document.getElementById("dtTitle").innerText = data.title;
    document.getElementById("dtDescription").innerText = data.description;
    document.getElementById("dtExpandedPanel").innerHTML = data.tip;

    // إخفاء لوحة التدبر عند الانتقال التلقائي
    document.getElementById("dtExpandedPanel").style.display = "none";

    const actionBtn = document.getElementById("dtActionBtn");
    const statusIndicator = document.getElementById("dtStatusIndicator");

    // التحقق هل هذه الفترة تم إحياؤها بالفعل اليوم؟
    if (dtStates[activePeriodKey] === true) {
        statusIndicator.className = "dc-status-indicator dc-status-done";
        statusIndicator.innerText = "✓ أحييتَ السُّنّة بنجاح";
        actionBtn.disabled = true;
        actionBtn.innerHTML = "🌟 مَقام مُكتمل";
    } else {
        // فترة نشطة بانتظار الإنجاز
        statusIndicator.className = "dc-status-indicator";
        statusIndicator.innerText = "⏳ المقام الحالي نشط";
        actionBtn.disabled = false;
        actionBtn.innerHTML = "✅ أحييتُ السُّنّة";
    }

    // رندرة الفترات الفائتة الصامتة في الخلفية (أمانة برمجية)
    // لو فتح بالليل والضحى لم تكتمل، تحفظ كـ Missed صامتة
    const periodsKeys = ["dhaha", "rawatib", "sakina", "bashair", "witr"];
    periodsKeys.forEach(pKey => {
        if (pKey !== activePeriodKey && dtStates[pKey] === undefined) {
            // إذا مر وقتها الفعلي دون تشيك، تعتبر فائتة صامتة
            // نتركها في اللوجيك مرنة للستريك
        }
    });
}

/**
 * دالة زر التفاعل الرئيسي: إحياء السنة الحالية
 */
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
    if ("vibrate" in navigator) navigator.vibrate(60);

    // إعادة رندرة الواجهة فوراً لقفل الزرار وتحويل المظهر
    renderCurrentChallengeUI(activePeriodKey);

    // فحص شرط الـ Streak المرن: هل وصل لـ فترتين منجزتين اليوم لزيادة الستريك أو الحفاظ عليه؟
    checkFlexibleStreakProgression();
}

/**
 * فحص الـ Streak المرن: إذا أنجز فترتين يتحرك الستريك للأمام فوراً ويحمي نفسه
 */
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
        alert(`✨ أدركتَ البركة! أنجزتَ مقامين من السنن اليوم، تم حماية وزيادة الـ Streak الديني الخاص بك بنجاح: ${dtStreak} أيام.`);
    }
}

/**
 * مفتاح التدبر: إظهار وإخفاء لمحة البركة التفسيرية بسلاسة
 */
function toggleDtExpansion() {
    const panel = document.getElementById("dtExpandedPanel");
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
}

/**
 * تحديث شارة الـ Streak الديني والتأثير البصري المحبوك
 */
function updateDtStreakUI() {
    const streakDisplay = document.getElementById("dtStreakDisplay");
    const container = document.getElementById("dtMainContainer");

    if (streakDisplay) {
        streakDisplay.innerText = `🔥 مقام السنن: ${dtStreak} أيام`;
    }

    if (container) {
        // إذا كان الالتزام 3 أيام فأكثر يكتسب الوهج الأسطوري الأخضر المتناسق
        if (dtStreak >= 3) {
            container.classList.add("dc-legendary-streak");
        } else {
            container.classList.remove("dc-legendary-streak");
        }
    }
}