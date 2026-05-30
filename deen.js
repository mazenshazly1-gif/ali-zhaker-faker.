// كود تشغيل راديو القرآن الكريم - الّلي ذاكر فاكر 2026
document.addEventListener("DOMContentLoaded", () => {
    const radioPlayer = document.getElementById('radio-player');
    const btnPlayRadio = document.getElementById('btn-play-radio');
    const btnMuteRadio = document.getElementById('btn-mute-radio');
    const radioStationSelect = document.getElementById('radioStationSelect');

    if (!radioPlayer || !btnPlayRadio || !btnMuteRadio || !radioStationSelect) return;

    // 1. تشغيل وإيقاف الراديو لايف
    btnPlayRadio.addEventListener('click', () => {
        if (radioPlayer.paused) {
            radioPlayer.play()
                .then(() => {
                    btnPlayRadio.innerHTML = '⏸️ إيقاف مؤقت';
                    btnPlayRadio.style.background = '#ef4444'; // يقلب أحمر عند التشغيل
                })
                .catch(err => console.log("خطأ في تشغيل البث المباشر: ", err));
        } else {
            radioPlayer.pause();
            btnPlayRadio.innerHTML = '▶️ تشغيل';
            btnPlayRadio.style.background = '#10b981'; // يرجع أخضر
        }
    });

    // 2. كتم الصوت وفك الكتم
    btnMuteRadio.addEventListener('click', () => {
        if (radioPlayer.muted) {
            radioPlayer.muted = false;
            btnMuteRadio.innerHTML = '🔊 كتم';
            btnMuteRadio.style.background = '#6b7280';
        } else {
            radioPlayer.muted = true;
            btnMuteRadio.innerHTML = '🔇 تشغيل الصوت';
            btnMuteRadio.style.background = '#f59e0b';
        }
    });

    // 3. التنقل بين الإذاعات بشكل تلقائي وفوري
    radioStationSelect.addEventListener('change', (e) => {
        const isPlaying = !radioPlayer.paused;
        
        // تغيير الرابط للرابط الجديد
        radioPlayer.src = e.target.value;
        
        // لو كان شغال، خليه يكمل تشغيل علطول على المحطة الجديدة
        if (isPlaying) {
            radioPlayer.play()
                .then(() => {
                    btnPlayRadio.innerHTML = '⏸️ إيقاف مؤقت';
                    btnPlayRadio.style.background = '#ef4444';
                });
        }
    });
});
