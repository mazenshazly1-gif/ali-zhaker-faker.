/* ==========================================================================
   🕋 منظومة مقامات السنن والبركة الذكية V3.0 - الّلي ذاكر فاكر © 2026
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initDeenTimeChallenges();
    setInterval(initDeenTimeChallenges, 60000);
});

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

let dtStates = JSON.parse(localStorage.getItem("dt_challenges_states")) || {};
let dtStreak = parseInt(localStorage.getItem("dt_challenges_streak")) || 0;
let dtLastCheckedDate = localStorage.getItem("dt_challenges_last_date") || "";

function initDeenTimeChallenges() {
    checkDeenNewDayReset();
    determineCurrentPeriodAndRender();
    updateDtStreakUI();
}

function checkDeenNewDayReset() {
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

    if (dtLastCheckedDate !== "" && dtLastCheckedDate !== todayStr) {
        const periods = ["dhaha", "rawatib", "sakina", "bashair", "witr"];
        let completedYesterdayCount = 0;
        periods.forEach(p => {
            if (dtStates[p] === true) completedYesterdayCount++;
        });

        if (completedYesterdayCount < 2 && dtLastCheckedDate !== todayStr) {
            if (dtLastCheckedDate !== yesterdayStr) {
                dtStreak = 0;
            } else if (completedYesterdayCount < 2) {
                dtStreak = 0;
            }
            localStorage.setItem("dt_challenges_streak", dtStreak);
        }

        dtStates = {};
        localStorage.setItem("dt_challenges_states", JSON.stringify(dtStates));
        localStorage.setItem("dt_challenges_last_date", todayStr);
    }
    
    if (dtLastCheckedDate === "") {
        localStorage.setItem("dt_challenges_last_date", todayStr);
    }
}

function determineCurrentPeriodAndRender() {
    let cachedTimes = null;
    try {
        cachedTimes = JSON.parse(localStorage.getItem('cachedPrayerTimes'));
    } catch(e) { cachedTimes = null; }

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

    let currentPeriodKey = "witr";

    if (currentMinutes >= minShrooq && currentMinutes < minDhuhr) {
        currentPeriodKey = "dhaha";
    } else if (currentMinutes >= minDhuhr && currentMinutes < minAsr) {
        currentPeriodKey = "rawatib";
    } else if (currentMinutes >= minAsr && currentMinutes < minMaghrib) {
        currentPeriodKey = "sakina";
    } else if (currentMinutes >= minMaghrib && currentMinutes < minIsha) {
        currentPeriodKey = "bashair";
    } else {
        currentPeriodKey = "witr";
    }

    renderCurrentChallengeUI(currentPeriodKey);
}

function renderCurrentChallengeUI(activePeriodKey) {
    const data = deenPeriodsData[activePeriodKey];
    if (!data) return;

    document.getElementById("dtPeriodBadge").innerText = data.badgeText;
    document.getElementById("dtIcon").innerText = data.icon;
    document.getElementById("dtTitle").innerText = data.title;
    document.getElementById("dtDescription").innerText = data.description;
    document.getElementById("dtExpandedPanel").innerHTML = data.tip;

    document.getElementById("dtExpandedPanel").style.display = "none";

    const actionBtn = document.getElementById("dtActionBtn");
    const statusIndicator = document.getElementById("dtStatusIndicator");

    if (dtStates[activePeriodKey] === true) {
        statusIndicator.className = "dc-status-indicator dc-status-done";
        statusIndicator.innerText = "✓ أحييتَ السُّنّة بنجاح";
        actionBtn.disabled = true;
        actionBtn.innerHTML = "🌟 مَقام مُكتمل";
    } else {
        statusIndicator.className = "dc-status-indicator";
        statusIndicator.innerText = "⏳ المقام الحالي نشط";
        actionBtn.disabled = false;
        actionBtn.innerHTML = "✅ أحييتُ السُّنّة";
    }
}

function completeCurrentDeenPeriod() {
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

    dtStates[activePeriodKey] = true;
    localStorage.setItem("dt_challenges_states", JSON.stringify(dtStates));

    renderCurrentChallengeUI(activePeriodKey);

    checkFlexibleStreakProgression();
    
    if (typeof ToastSystem !== 'undefined') {
        ToastSystem.success("تم إحياء السنة بنجاح! بارك الله فيك 🕌");
    }
}

function checkFlexibleStreakProgression() {
    const periods = ["dhaha", "rawatib", "sakina", "bashair", "witr"];
    let completedCount = 0;
    periods.forEach(p => { if (dtStates[p] === true) completedCount++; });

    const todayStr = new Date().toDateString();
    const lastStreakDate = localStorage.getItem("dt_streak_earned_date") || "";

    if (completedCount === 2 && lastStreakDate !== todayStr) {
        dtStreak += 1;
        localStorage.setItem("dt_challenges_streak", dtStreak);
        localStorage.setItem("dt_streak_earned_date", todayStr);
        updateDtStreakUI();
        
        if (typeof ToastSystem !== 'undefined') {
            ToastSystem.success(`✨ أدركتَ البركة! أنجزتَ مقامين من السنن اليوم، تم حماية وزيادة الـ Streak الديني الخاص بك بنجاح: ${dtStreak} أيام.`);
        }
    }
}

function toggleDtExpansion() {
    const panel = document.getElementById("dtExpandedPanel");
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
}

function updateDtStreakUI() {
    const streakDisplay = document.getElementById("dtStreakDisplay");
    const container = document.getElementById("dtMainContainer");

    if (streakDisplay) {
        streakDisplay.innerText = `🔥 مقام السنن: ${dtStreak} أيام`;
    }

    if (container) {
        if (dtStreak >= 3) {
            container.classList.add("dc-legendary-streak");
        } else {
            container.classList.remove("dc-legendary-streak");
        }
    }
}