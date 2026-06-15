/* ============================================
   APP SHELL JS ENGINE - اللي ذاكر فاكر V3.0
   ============================================ */

(function () {

  /* ---- جلب إعدادات المستخدم ---- */
  function getUserName() {
    return localStorage.getItem('app_username') || '';
  }
  function getUserRole() {
    return 'رِحْلَةُ السَّعْيِ وَالأَثَرِ 🚀';
  }
  function getInitials(name) {
    return name.trim().charAt(0) || '👤';
  }

  /* ============================================
     ONBOARDING — شاشة الترحيب
     ============================================ */
  function shouldShowOnboarding() {
    return !localStorage.getItem('app_username');
  }

  function buildOnboardingOverlay() {
    const cities = [
      {en: "Cairo", ar: "القاهرة"}, {en: "Alexandria", ar: "الإسكندرية"},
      {en: "Giza", ar: "الجيزة"}, {en: "Luxor", ar: "الأقصر"},
      {en: "Aswan", ar: "أسوان"}, {en: "Asyut", ar: "أسيوط"},
      {en: "Ismailia", ar: "الإسماعيلية"}, {en: "Beni Suef", ar: "بني سويف"},
      {en: "Port Said", ar: "بورسعيد"}, {en: "Damietta", ar: "دمياط"},
      {en: "Mansoura", ar: "الدقهلية"}, {en: "Zagazig", ar: "الشرقية"},
      {en: "Sohag", ar: "سوهاج"}, {en: "Suez", ar: "السويس"},
      {en: "Tanta", ar: "الغربية"}, {en: "Fayoum", ar: "الفيوم"},
      {en: "Benha", ar: "القليوبية"}, {en: "Kafr El Sheikh", ar: "كفر الشيخ"},
      {en: "Matrouh", ar: "مطروح"}, {en: "Shebin El Kom", ar: "المنوفية"},
      {en: "Minya", ar: "المنيا"}, {en: "Damanhour", ar: "البحيرة"},
      {en: "Hurghada", ar: "البحر الأحمر"}, {en: "Kharga", ar: "الوادي الجديد"},
      {en: "Arish", ar: "شمال سيناء"}, {en: "Tor", ar: "جنوب سيناء"}
    ];

    const overlay = document.createElement('div');
    overlay.id = 'appOnboardingOverlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      background:var(--bg-main, #0f172a);
      display:flex; align-items:center; justify-content:center;
      direction:rtl; padding:20px;
    `;

    overlay.innerHTML = `
      <div style="
        background:var(--card-bg, #1e293b);
        border:1px solid var(--border-color, #334155);
        border-radius:24px;
        padding:36px 28px;
        width:100%; max-width:400px;
        text-align:center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      ">
        <div style="font-size:48px; margin-bottom:12px;">⚡</div>
        <div style="font-size:22px; font-weight:800; color:var(--text-main,#f1f5f9); margin-bottom:8px;">
          أهلاً وسهلاً!
        </div>
        <div style="font-size:14px; color:var(--text-muted,#94a3b8); margin-bottom:28px; line-height:1.6;">
          خليني أتعرف عليك عشان أخصص تجربتك في اللي ذاكر فاكر 🎯
        </div>

        <div style="text-align:right; margin-bottom:20px;">
          <label style="font-size:13px; font-weight:700; color:var(--text-main,#f1f5f9); display:block; margin-bottom:8px;">
            👤 اسمك إيه؟
          </label>
          <input
            id="onboardingNameInput"
            type="text"
            placeholder="اكتب اسمك هنا..."
            maxlength="30"
            style="
              width:100%; box-sizing:border-box;
              background:var(--btn-mode-bg, #0f172a);
              border:1.5px solid var(--border-color, #334155);
              border-radius:12px;
              color:var(--text-main, #f1f5f9);
              font-family:inherit; font-size:15px; font-weight:600;
              padding:13px 16px;
              outline:none; direction:rtl;
              transition: border-color 0.2s;
            "
          />
        </div>

        <div style="text-align:right; margin-bottom:28px;">
          <label style="font-size:13px; font-weight:700; color:var(--text-main,#f1f5f9); display:block; margin-bottom:8px;">
            📍 محافظتك إيه؟ (لمواقيت الصلاة)
          </label>
          <select
            id="onboardingCitySelect"
            style="
              width:100%; box-sizing:border-box;
              background:var(--btn-mode-bg, #0f172a);
              border:1.5px solid var(--border-color, #334155);
              border-radius:12px;
              color:var(--text-main, #f1f5f9);
              font-family:inherit; font-size:14px; font-weight:700;
              padding:13px 16px;
              outline:none; direction:rtl; cursor:pointer;
            "
          >
            ${cities.map(c => `<option value="${c.en}" ${c.en === 'Cairo' ? 'selected' : ''}>${c.ar}</option>`).join('')}
          </select>
        </div>

        <button
          id="onboardingSubmitBtn"
          style="
            width:100%;
            background:linear-gradient(135deg, #3b82f6, #1d4ed8);
            border:none; border-radius:14px;
            color:#fff; font-family:inherit; font-size:16px; font-weight:800;
            padding:15px; cursor:pointer;
            box-shadow:0 4px 20px rgba(59,130,246,0.4);
            transition: transform 0.15s, box-shadow 0.15s;
          "
          onmouseover="this.style.transform='scale(1.02)'"
          onmouseout="this.style.transform='scale(1)'"
        >
          يلا نبدأ! 🚀
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      const inp = document.getElementById('onboardingNameInput');
      if (inp) inp.focus();
    }, 100);

    document.getElementById('onboardingSubmitBtn').addEventListener('click', submitOnboarding);
    document.getElementById('onboardingNameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitOnboarding();
    });
  }

  function submitOnboarding() {
    const nameInput = document.getElementById('onboardingNameInput');
    const citySelect = document.getElementById('onboardingCitySelect');
    const name = nameInput ? nameInput.value.trim() : '';
    const city = citySelect ? citySelect.value : 'Cairo';

    localStorage.setItem('app_username', name || 'مستقبل جديد');
    localStorage.setItem('savedCity', city);

    if (typeof fetchPrayerTimes === 'function') {
      fetchPrayerTimes(city);
    }
    const oldCitySelect = document.getElementById('citySelect');
    if (oldCitySelect) {
      oldCitySelect.value = city;
    }

    const overlay = document.getElementById('appOnboardingOverlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.4s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        refreshShellUserInfo(name || 'مستقبل جديد');
        if (typeof ToastSystem !== 'undefined') {
          ToastSystem.success(`أهلاً بيك يا ${name || 'مستقبل جديد'}! 🎉`);
        }
      }, 400);
    }
  }
  
    /* ============================================
     MODAL تعديل الاسم
     ============================================ */
  function buildNameModal() {
    const existing = document.getElementById('appNameModal');
    if (existing) { existing.remove(); }

    const modal = document.createElement('div');
    modal.id = 'appNameModal';
    modal.style.cssText = `
      position:fixed; inset:0; z-index:8000;
      background:rgba(0,0,0,0.6);
      display:flex; align-items:center; justify-content:center;
      direction:rtl; padding:20px;
      backdrop-filter: blur(4px);
    `;

    const currentName = getUserName();

    modal.innerHTML = `
      <div style="
        background:var(--card-bg, #1e293b);
        border:1px solid var(--border-color, #334155);
        border-radius:20px;
        padding:28px 24px;
        width:100%; max-width:360px;
        box-shadow:0 20px 60px rgba(0,0,0,0.5);
      ">
        <div style="font-size:18px; font-weight:800; color:var(--text-main,#f1f5f9); margin-bottom:18px; text-align:center;">
          👤 تعديل الاسم
        </div>
        <input
          id="appNameModalInput"
          type="text"
          value="${currentName}"
          placeholder="اكتب اسمك..."
          maxlength="30"
          style="
            width:100%; box-sizing:border-box;
            background:var(--btn-mode-bg, #0f172a);
            border:1.5px solid var(--border-color, #334155);
            border-radius:12px;
            color:var(--text-main, #f1f5f9);
            font-family:inherit; font-size:15px; font-weight:600;
            padding:13px 16px;
            outline:none; direction:rtl;
            margin-bottom:16px;
          "
        />
        <div style="display:flex; gap:10px;">
          <button id="appNameModalCancel" style="
            flex:1; padding:13px; border-radius:12px;
            background:var(--btn-mode-bg,#0f172a);
            border:1px solid var(--border-color,#334155);
            color:var(--text-muted,#94a3b8);
            font-family:inherit; font-size:14px; font-weight:700;
            cursor:pointer;
          ">إلغاء</button>
          <button id="appNameModalSave" style="
            flex:2; padding:13px; border-radius:12px;
            background:linear-gradient(135deg,#3b82f6,#1d4ed8);
            border:none;
            color:#fff;
            font-family:inherit; font-size:14px; font-weight:800;
            cursor:pointer;
            box-shadow:0 4px 14px rgba(59,130,246,0.3);
          ">حفظ ✓</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      const inp = document.getElementById('appNameModalInput');
      if (inp) { inp.focus(); inp.select(); }
    }, 50);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeNameModal();
    });

    document.getElementById('appNameModalCancel').addEventListener('click', closeNameModal);
    document.getElementById('appNameModalSave').addEventListener('click', saveNameFromModal);
    document.getElementById('appNameModalInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveNameFromModal();
      if (e.key === 'Escape') closeNameModal();
    });
  }

  function closeNameModal() {
    const modal = document.getElementById('appNameModal');
    if (modal) {
      modal.style.transition = 'opacity 0.2s ease';
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 200);
    }
  }

  function saveNameFromModal() {
    const inp = document.getElementById('appNameModalInput');
    const newName = inp ? inp.value.trim() : '';
    const nameToSave = newName || 'مستقبل جديد ✨';

    localStorage.setItem('app_username', nameToSave);
    refreshShellUserInfo(nameToSave);
    closeNameModal();
    if (typeof ToastSystem !== 'undefined') {
      ToastSystem.success(`تم تحديث الاسم إلى ${nameToSave} 👤`);
    }
  }

  function refreshShellUserInfo(name) {
    const drawerName = document.querySelector('.app-drawer-name');
    const drawerAvatar = document.querySelector('.app-drawer-avatar');
    const profileName = document.querySelector('.app-profile-name');
    const profileAvatar = document.querySelector('.app-profile-avatar-big');
    const profileNameSub = document.getElementById('profileNameSub');

    if (drawerName) drawerName.textContent = name || 'مستقبل جديد ✨';
    if (drawerAvatar) drawerAvatar.textContent = getInitials(name);
    if (profileName) profileName.textContent = name || 'مستقبل جديد ✨';
    if (profileAvatar) profileAvatar.textContent = getInitials(name);
    if (profileNameSub) profileNameSub.textContent = name || 'اضغط لتعيين اسمك';
  }

  /* ============================================
     SESSION END MODAL
     ============================================ */
  window.showSessionEndModal = function(xpEarned, isHardcore) {
    const existing = document.getElementById('appSessionEndModal');
    if (existing) existing.remove();

    const hours = parseFloat(localStorage.getItem('totalHoursStudied') || 0).toFixed(2);
    const todos = parseInt(localStorage.getItem('completedTodosCount') || 0);
    const azkar = parseInt(localStorage.getItem('totalAzkarCount') || 0);
    const name = getUserName() || 'بطل';

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
    
    if (typeof ToastSystem !== 'undefined') {
      ToastSystem.success(`+${xpEarned} XP من جلستك! استمر يا بطل 🏆`);
    }
  };
  
    /* ============================================
     بناء عناصر الـ Shell
     ============================================ */
  function buildShell() {
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = `
      <div class="app-header-right">
        <button class="app-drawer-btn" id="appDrawerBtn" aria-label="القائمة">
          <span></span><span></span><span></span>
        </button>
        <div class="app-logo">⚡ اللي ذاكر فاكر</div>
      </div>
      <div class="app-header-left">
        <div class="app-prayer-badge" id="appPrayerBadge">جاري الحساب...</div>
        <button class="app-settings-btn" id="settingsBtn" onclick="openSettingsModal()" title="الإعدادات">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.67 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.67a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    `;
    document.body.prepend(header);

    const nav = document.createElement('nav');
    nav.className = 'app-bottom-nav';
    nav.innerHTML = `
      <button class="app-nav-item active" data-page="home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
        الرئيسية
      </button>
      <button class="app-nav-item" data-page="deen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        الواحة
      </button>
      <button class="app-nav-item" data-page="stats">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
        الإحصائيات
      </button>
      <button class="app-nav-item" data-page="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        حسابي
      </button>
    `;
    document.body.appendChild(nav);

    const overlay = document.createElement('div');
    overlay.className = 'app-drawer-overlay';
    overlay.id = 'appDrawerOverlay';
    document.body.appendChild(overlay);

    const name = getUserName();
    const role = getUserRole();
    const drawer = document.createElement('div');
    drawer.className = 'app-drawer';
    drawer.id = 'appDrawer';
    drawer.innerHTML = `
      <div class="app-drawer-profile">
        <div class="app-drawer-avatar">${getInitials(name)}</div>
        <div class="app-drawer-name">${name || 'مستقبل جديد ✨'}</div>
        <div class="app-drawer-subtitle">${role}</div>
      </div>
      <div class="app-drawer-menu">
        <div class="app-drawer-section">الرئيسية</div>
        <button class="app-drawer-item active" data-page="home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
          </svg>
          الرئيسية
        </button>
        <button class="app-drawer-item" data-page="deen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          الواحة الدينية
        </button>
        <button class="app-drawer-item" data-page="stats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          الإحصائيات
        </button>
        <button class="app-drawer-item" data-page="profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          حسابي
        </button>
        <div class="app-drawer-divider"></div>
        <div class="app-drawer-section">أخرى</div>
        <button class="app-drawer-item" onclick="window.open('https://t.me/MaZeN_VlP','_blank')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
          تواصل معنا
        </button>
      </div>
      <div class="app-drawer-footer">
        تم التطوير بـ ❤️ بواسطة <a href="https://t.me/MaZeN_VlP" target="_blank">Mazen</a>
        <br>الإصدار 3.0.0
      </div>
    `;
    document.body.appendChild(drawer);
  }

  function wrapPages() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const studyTab = document.getElementById('studyTab');
    const deenTab = document.getElementById('deenTab');
    if (!studyTab || !deenTab) return;

    const weeklyChartCard = studyTab.querySelector('.card:has(#weeklyChart)') ||
      Array.from(studyTab.querySelectorAll('.card')).find(c => c.querySelector('#weeklyChart'));
    const historyCard = studyTab.querySelector('.card:has(#historyLogList)') ||
      Array.from(studyTab.querySelectorAll('.card')).find(c => c.querySelector('#historyLogList'));
    const topGrid = studyTab.querySelector('.top-grid');

    studyTab.setAttribute('data-page-id', 'home');
    studyTab.classList.add('app-page', 'active');
    studyTab.style.display = 'block';

    deenTab.setAttribute('data-page-id', 'deen');
    deenTab.classList.add('app-page');
    deenTab.style.display = 'none';

    const statsPage = document.createElement('div');
    statsPage.id = 'statsTab';
    statsPage.setAttribute('data-page-id', 'stats');
    statsPage.classList.add('app-page', 'tab-content');
    statsPage.style.display = 'none';

    const statsWrapper = document.createElement('div');
    statsWrapper.className = 'app-stats-wrapper';

    if (topGrid) statsWrapper.appendChild(topGrid);
    if (weeklyChartCard) statsWrapper.appendChild(weeklyChartCard);
    if (historyCard) statsWrapper.appendChild(historyCard);

    statsPage.appendChild(statsWrapper);
    mainContent.appendChild(statsPage);

    const profilePage = buildProfilePage();
    profilePage.setAttribute('data-page-id', 'profile');
    profilePage.classList.add('app-page');
    profilePage.style.display = 'none';
    mainContent.appendChild(profilePage);

    const aboutPage = buildAboutPage();
    aboutPage.setAttribute('data-page-id', 'about');
    aboutPage.classList.add('app-page');
    aboutPage.style.display = 'none';
    mainContent.appendChild(aboutPage);

    const privacyPage = buildPrivacyPage();
    privacyPage.setAttribute('data-page-id', 'privacy');
    privacyPage.classList.add('app-page');
    privacyPage.style.display = 'none';
    mainContent.appendChild(privacyPage);
  }

  function buildProfilePage() {
    const name     = getUserName();
    const role     = getUserRole();
    const city     = localStorage.getItem('savedCity')      || 'Cairo';
    const theme    = localStorage.getItem('theme')          || 'dark';
    const isDark   = theme === 'dark';
    const avatar   = localStorage.getItem('userAvatar')     || '⚡';
    const goal     = localStorage.getItem('userGoal')       || '';
    const numLang  = localStorage.getItem('numLang')        || 'en';
    const timerSnd = localStorage.getItem('timerSound')     || 'bell';
    const pomoDur  = localStorage.getItem('pomoDuration')   || '25';
    const pomoBreak= localStorage.getItem('pomoBreak')      || '5';

    const xp = parseFloat(localStorage.getItem('userXp')) || 0;
    const RANKS_LOCAL = [
      { name: "النائم اللي صحي 🥶",     minXp: 0     },
      { name: "بيسخن على الماشي ⚡",      minXp: 150   },
      { name: "جاد ومركّز 📚",            minXp: 400   },
      { name: "مقاوح محترف 🔥",           minXp: 900   },
      { name: "بطل المواجهة ⚔️",          minXp: 1800  },
      { name: "عقل من فئة تانية 🧠",      minXp: 3200  },
      { name: "أيقونة في طريقه 🌟",       minXp: 5000  },
      { name: "ملك المقاوحة 👑",          minXp: 8000  },
      { name: "الأسطورة 🛡️",             minXp: 12000 },
      { name: "اللي ذاكر فاكر حقاً ⚡",  minXp: 18000 }
    ];
    let currentRankName = RANKS_LOCAL[0].name;
    for (let i = 0; i < RANKS_LOCAL.length; i++) {
      if (xp >= RANKS_LOCAL[i].minXp) currentRankName = RANKS_LOCAL[i].name;
    }

    const AVATAR_OPTIONS = ['⚡','🔥','👑','🧠','🚀','🦁','🎯','💎','🌟','⚔️','🛡️','🌙','📚','🦅','💪'];
    const SOUND_OPTIONS = [
      { val: 'bell',     label: '🔔 جرس ناعم'        },
      { val: 'chime',    label: '✨ نغمة هادئة'       },
      { val: 'success',  label: '🎉 صوت إنجاز'        },
      { val: 'digital',  label: '📳 تنبيه رقمي'       },
      { val: 'none',     label: '🔇 بدون صوت'         }
    ];
    const POMO_DURATIONS = ['15','20','25','30','45','60'];
    const POMO_BREAKS    = ['5','10','15','20'];

    const page = document.createElement('div');
    page.id = 'profileTab';
    page.innerHTML = `
      <div class="app-profile-wrapper">

        <div class="app-profile-hero">
          <div class="app-profile-avatar-big profile-emoji-avatar" id="profileAvatarDisplay"
               style="font-size:52px; background:transparent; border:3px solid var(--accent-color,#3b82f6); cursor:pointer;"
               onclick="openAvatarPicker()"
               title="اضغط لتغيير الأيقونة">
            ${avatar}
          </div>
          <div class="app-profile-name" id="profileDisplayName">${name || 'مستقبل جديد ✨'}</div>
          ${goal ? `<div class="app-profile-goal" id="profileGoalDisplay">🎯 ${goal}</div>` : `<div class="app-profile-goal" id="profileGoalDisplay" style="color:var(--text-muted);font-size:13px;">اضغط لإضافة هدفك 👇</div>`}
          <div class="app-profile-rank-badge" id="profileRankBadge">${currentRankName}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${xp.toFixed(0)} XP إجمالي</div>
        </div>

        <div id="avatarPickerCard" class="app-settings-card" style="display:none;">
          <div class="app-settings-title">اختار أيقونتك</div>
          <div id="avatarGrid" style="display:flex;flex-wrap:wrap;gap:10px;padding:10px 4px;justify-content:center;">
            ${AVATAR_OPTIONS.map(em => `
              <button onclick="selectAvatar('${em}')"
                style="font-size:28px;background:${em===avatar?'var(--accent-color,#3b82f6)':'var(--btn-mode-bg,#1e293b)'};
                border:2px solid ${em===avatar?'var(--accent-color,#3b82f6)':'var(--border-color,#334155)'};
                border-radius:12px;width:52px;height:52px;cursor:pointer;transition:0.2s;"
              >${em}</button>
            `).join('')}
          </div>
        </div>

        <div class="app-settings-card">
          <div class="app-settings-title">الحساب</div>
          <div class="app-settings-item" id="editNameItem">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(59,130,246,0.1)">👤</div>
              <div>
                <div class="app-settings-item-label">الاسم الشخصي</div>
                <div class="app-settings-item-sub" id="profileNameSub">${name || 'اضغط لتعيين اسمك'}</div>
              </div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
          <div class="app-settings-item" id="editGoalItem">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(16,185,129,0.1)">🎯</div>
              <div>
                <div class="app-settings-item-label">هدفك</div>
                <div class="app-settings-item-sub" id="profileGoalSub">${goal || 'اكتب هدفك هنا عشان تفضل متحفز'}</div>
              </div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
        </div>

        <div class="app-settings-card">
          <div class="app-settings-title">التفضيلات</div>
          <div class="app-settings-item">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(245,158,11,0.1)">📍</div>
              <div>
                <div class="app-settings-item-label">المحافظة</div>
                <div class="app-settings-item-sub">لمواقيت الصلاة بدقة</div>
              </div>
            </div>
            <select class="app-select" id="appCitySelect">${buildCityOptions(city)}</select>
          </div>
          <div class="app-settings-item" id="themeItem">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(139,92,246,0.1)">🎨</div>
              <div>
                <div class="app-settings-item-label">المظهر</div>
                <div class="app-settings-item-sub">${isDark ? 'داكن' : 'فاتح'}</div>
              </div>
            </div>
            <div class="app-toggle ${isDark ? '' : 'on'}" id="appThemeToggle"></div>
          </div>
          <div class="app-settings-item">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(99,102,241,0.1)">🔢</div>
              <div>
                <div class="app-settings-item-label">لغة الأرقام</div>
                <div class="app-settings-item-sub">${numLang === 'ar' ? 'عربي (١٢٣)' : 'إنجليزي (123)'}</div>
              </div>
            </div>
            <select class="app-select" id="numLangSelect">
              <option value="en" ${numLang==='en'?'selected':''}>إنجليزي (123)</option>
              <option value="ar" ${numLang==='ar'?'selected':''}>عربي (١٢٣)</option>
            </select>
          </div>
        </div>

        <div class="app-settings-card">
          <div class="app-settings-title">إعدادات التايمر</div>
          <div class="app-settings-item">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(239,68,68,0.1)">🔔</div>
              <div>
                <div class="app-settings-item-label">صوت نهاية الجلسة</div>
                <div class="app-settings-item-sub">اختار الصوت اللي يناسبك</div>
              </div>
            </div>
            <select class="app-select" id="timerSoundSelect">
              ${SOUND_OPTIONS.map(s=>`<option value="${s.val}" ${timerSnd===s.val?'selected':''}>${s.label}</option>`).join('')}
            </select>
          </div>
          <div class="app-settings-item" style="cursor:default;">
            <div class="app-settings-item-right" style="width:100%;">
              <div class="app-settings-item-icon" style="background:rgba(245,158,11,0.1)">▶️</div>
              <div style="flex:1;">
                <div class="app-settings-item-label">تجربة الصوت</div>
              </div>
              <button onclick="previewTimerSound()"
                style="background:var(--accent-color,#3b82f6);color:#fff;border:none;border-radius:10px;
                padding:7px 16px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;">
                تشغيل ▶
              </button>
            </div>
          </div>
          <div class="app-settings-item">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(16,185,129,0.1)">⏱️</div>
              <div>
                <div class="app-settings-item-label">مدة البومودورو</div>
                <div class="app-settings-item-sub">وقت التركيز بالدقايق</div>
              </div>
            </div>
            <select class="app-select" id="pomoDurSelect">
              ${POMO_DURATIONS.map(d=>`<option value="${d}" ${pomoDur===d?'selected':''}>${d} دقيقة</option>`).join('')}
            </select>
          </div>
          <div class="app-settings-item">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(52,211,153,0.1)">☕</div>
              <div>
                <div class="app-settings-item-label">مدة الراحة</div>
                <div class="app-settings-item-sub">وقت الاستراحة بالدقايق</div>
              </div>
            </div>
            <select class="app-select" id="pomoBreakSelect">
              ${POMO_BREAKS.map(b=>`<option value="${b}" ${pomoBreak===b?'selected':''}>${b} دقايق</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="app-settings-card">
          <div class="app-settings-title">الإشعارات</div>
          <div class="app-settings-item">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(16,185,129,0.1)">🕌</div>
              <div>
                <div class="app-settings-item-label">إشعارات الأذان</div>
                <div class="app-settings-item-sub">تنبيه عند كل وقت صلاة</div>
              </div>
            </div>
            <button onclick="requestNotificationPermission()"
              style="background:var(--accent-deen,#10b981);color:#fff;border:none;border-radius:10px;
              padding:7px 14px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;">
              تفعيل 🔔
            </button>
          </div>
        </div>

        <div class="app-settings-card">
          <div class="app-settings-title">البيانات</div>
          <div class="app-settings-item" onclick="exportUserData()" style="cursor:pointer;">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(59,130,246,0.1)">📤</div>
              <div>
                <div class="app-settings-item-label">تصدير بياناتي</div>
                <div class="app-settings-item-sub">حفظ إحصائياتك كملف JSON</div>
              </div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
          <div class="app-settings-item" onclick="resetXpConfirm()" style="cursor:pointer;">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(245,158,11,0.1)">🔄</div>
              <div>
                <div class="app-settings-item-label">إعادة تعيين الـ XP والرتبة</div>
                <div class="app-settings-item-sub">بداية جديدة من الصفر في نظام النقاط</div>
              </div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
        </div>

        <div class="app-settings-card">
          <div class="app-settings-title">عام</div>
          <div class="app-settings-item" onclick="navigateTo('about')" style="cursor:pointer;">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(16,185,129,0.1)">ℹ️</div>
              <div><div class="app-settings-item-label">عن المنصة</div></div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
          <div class="app-settings-item" onclick="navigateTo('privacy')" style="cursor:pointer;">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(239,68,68,0.1)">🔒</div>
              <div><div class="app-settings-item-label">سياسة الخصوصية</div></div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
          <div class="app-settings-item" onclick="window.open('https://t.me/MaZeN_VlP','_blank')" style="cursor:pointer;">
            <div class="app-settings-item-right">
              <div class="app-settings-item-icon" style="background:rgba(59,130,246,0.1)">💬</div>
              <div><div class="app-settings-item-label">تواصل معنا (الدعم الفني)</div></div>
            </div>
            <span class="app-settings-arrow">‹</span>
          </div>
        </div>

        <button class="app-btn-danger" id="appDeleteAccount" onclick="deleteAccount()">🗑️ حذف حسابي ومسح كل البيانات</button>

        <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:24px;padding-bottom:80px;font-weight:bold;">
          الّلي ذاكر فاكر © 2026 <br>
          Developed by: <a href="https://t.me/MaZeN_VlP" target="_blank"
            style="color:var(--accent-color,#3b82f6);text-decoration:none;">👑 Mazen</a>
        </div>
      </div>
    `;
    return page;
  }
  
    /* ===== Avatar Picker ===== */
  window.openAvatarPicker = function() {
    const card = document.getElementById('avatarPickerCard');
    if (card) card.style.display = card.style.display === 'none' ? 'block' : 'none';
  };
  
  window.selectAvatar = function(em) {
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
    if (typeof ToastSystem !== 'undefined') {
      ToastSystem.success("تم تغيير الأيقونة بنجاح 🎨");
    }
  };

  /* ===== Goal Editor ===== */
  function buildGoalModal() {
    const current = localStorage.getItem('userGoal') || '';
    const overlay = document.createElement('div');
    overlay.id = 'goalModalOverlay';
    overlay.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);
      display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;`;
    overlay.innerHTML = `
      <div style="background:var(--card-bg,#1e293b);border:1px solid var(--border-color,#334155);
        border-radius:20px;padding:28px;width:100%;max-width:380px;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">🎯</div>
        <div style="font-size:18px;font-weight:800;color:var(--text-main,#f1f5f9);margin-bottom:6px;">هدفك إيه؟</div>
        <div style="font-size:13px;color:var(--text-muted,#94a3b8);margin-bottom:20px;">
          اكتب هدفك عشان يفضل قدامك ويحفزك كل يوم
        </div>
        <input id="goalInput" type="text" maxlength="60" placeholder="مثال: دخول كلية الحاسبات 🎓"
          value="${current}"
          style="width:100%;box-sizing:border-box;background:var(--btn-mode-bg,#0f172a);
          border:1.5px solid var(--border-color,#334155);border-radius:12px;
          color:var(--text-main,#f1f5f9);font-family:inherit;font-size:15px;font-weight:600;
          padding:13px 16px;outline:none;direction:rtl;margin-bottom:16px;">
        <div style="display:flex;gap:10px;">
          <button onclick="saveGoal()"
            style="flex:1;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:12px;
            color:#fff;font-family:inherit;font-size:15px;font-weight:800;padding:13px;cursor:pointer;">
            حفظ 🎯
          </button>
          <button onclick="document.getElementById('goalModalOverlay').remove()"
            style="flex:1;background:var(--btn-mode-bg,#1e293b);border:1px solid var(--border-color,#334155);
            border-radius:12px;color:var(--text-muted,#94a3b8);font-family:inherit;font-size:15px;
            font-weight:700;padding:13px;cursor:pointer;">
            إلغاء
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('goalInput')?.focus(), 100);
    document.getElementById('goalInput').addEventListener('keydown', e => { if(e.key==='Enter') saveGoal(); });
  }

  window.saveGoal = function() {
    const val = document.getElementById('goalInput')?.value?.trim();
    if (!val) {
      if (typeof ToastSystem !== 'undefined') {
        ToastSystem.warning("اكتب هدفك الأول 🎯");
      }
      return;
    }
    localStorage.setItem('userGoal', val);
    const goalDisplay = document.getElementById('profileGoalDisplay');
    if (goalDisplay) { goalDisplay.textContent = '🎯 ' + val; goalDisplay.style.color = ''; }
    const goalSub = document.getElementById('profileGoalSub');
    if (goalSub) goalSub.textContent = val;
    document.getElementById('goalModalOverlay')?.remove();
    if (typeof ToastSystem !== 'undefined') {
      ToastSystem.success("تم حفظ هدفك بنجاح! استمر يا بطل 🎯");
    }
  };

  /* ===== Preview Timer Sound ===== */
  window.previewTimerSound = function() {
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
      if (typeof ToastSystem !== 'undefined') {
        ToastSystem.info("🔇 لا يوجد صوت للمعاينة");
      }
      return;
    }
    const audio = new Audio(SOUND_URLS[sound]);
    audio.volume = 0.8;
    audio.play().catch(() => {
      if (typeof ToastSystem !== 'undefined') {
        ToastSystem.error("فشل تشغيل الصوت - تأكد من اتصال الإنترنت ⚠️");
      }
    });
    if (typeof ToastSystem !== 'undefined') {
      ToastSystem.success("جاري تشغيل المعاينة 🔊");
    }
  };

  /* ===== Export Data ===== */
  window.exportUserData = function() {
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
    if (typeof ToastSystem !== 'undefined') {
      ToastSystem.success("تم تصدير بياناتك بنجاح 📤");
    }
  };

  /* ===== Reset XP ===== */
  window.resetXpConfirm = function() {
    Swal.fire({
        title: '⚠️ إعادة تعيين الـ XP؟',
        text: 'هتتمسح كل نقاط الـ XP والرتبة وتبدأ من الصفر. مش هيتأثر أي حاجة تانية. متأكد؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، إعادة تعيين',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#f59e0b',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('userXp', '0');
            if (typeof updateRankUI === 'function') updateRankUI();
            const badge = document.getElementById('profileRankBadge');
            if (badge) badge.textContent = 'النائم اللي صحي 🥶';
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.success("تم! بداية جديدة يا بطل 💪");
            }
        }
    });
  };

  /* ===== Delete Account ===== */
  window.deleteAccount = function() {
    Swal.fire({
        title: '🚨 تحذير!',
        text: 'سيتم مسح كافة إحصائياتك وإعداداتك المحلية تماماً من هذا المتصفح. هل تريد الاستمرار؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، امسح كل شيء',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#ef4444',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.delete("تم مسح كل البيانات - إعادة تحميل... 🗑️");
            }
            setTimeout(() => location.reload(), 1500);
        }
    });
  };

  function buildCityOptions(selected) {
    const cities = [
      {en: "Cairo", ar: "القاهرة"}, {en: "Alexandria", ar: "الإسكندرية"},
      {en: "Giza", ar: "الجيزة"}, {en: "Luxor", ar: "الأقصر"},
      {en: "Aswan", ar: "أسوان"}, {en: "Asyut", ar: "أسيوط"},
      {en: "Ismailia", ar: "الإسماعيلية"}, {en: "Beni Suef", ar: "بني سويف"},
      {en: "Port Said", ar: "بورسعيد"}, {en: "Damietta", ar: "دمياط"},
      {en: "Mansoura", ar: "الدقهلية"}, {en: "Zagazig", ar: "الشرقية"},
      {en: "Sohag", ar: "سوهاج"}, {en: "Suez", ar: "السويس"},
      {en: "Tanta", ar: "الغربية"}, {en: "Fayoum", ar: "الفيوم"},
      {en: "Benha", ar: "القليوبية"}, {en: "Kafr El Sheikh", ar: "كفر الشيخ"},
      {en: "Matrouh", ar: "مطروح"}, {en: "Shebin El Kom", ar: "المنوفية"},
      {en: "Minya", ar: "المنيا"}, {en: "Damanhour", ar: "البحيرة"},
      {en: "Hurghada", ar: "البحر الأحمر"}, {en: "Kharga", ar: "الوادي الجديد"},
      {en: "Arish", ar: "شمال سيناء"}, {en: "Tor", ar: "جنوب سيناء"}
    ];
    return cities.map(c =>
      `<option value="${c.en}" ${c.en.toLowerCase() === selected.toLowerCase() ? 'selected' : ''}>${c.ar}</option>`
    ).join('');
  }

  function buildAboutPage() {
    const page = document.createElement('div');
    page.id = 'aboutTab';
    page.innerHTML = `
      <div class="app-about-wrapper">
        <div class="app-about-hero">
          <div class="app-about-logo">⚡</div>
          <div class="app-about-name">اللي ذاكر فاكر</div>
          <div class="app-about-version">الإصدار 3.0.0</div>
          <div class="app-about-desc">
            منصة إنتاجية متكاملة مصممة لمساعدة أي شخص — سواء كنت تذاكر، تشتغل، أو تطور نفسك — على تنظيم وقته، تتبع إنجازاته، والمحافظة على التوازن بين العمل والروح في مكان واحد.
          </div>
        </div>

        <div class="app-settings-card" style="margin-bottom:16px;">
          <div class="app-settings-title">مميزات المنصة</div>
          <div style="padding:4px 8px 12px;display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:22px;min-width:32px;">⏱️</div>
              <div><div style="font-size:14px;font-weight:700;color:var(--text-main,#f1f5f9);">تايمر ذكي</div>
              <div style="font-size:12px;color:var(--text-muted,#94a3b8);margin-top:2px;">جلسات بومودورو، تركيز، وعداد حر مع وضع Hardcore للمنضبطين</div></div>
            </div>
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:22px;min-width:32px;">🏆</div>
              <div><div style="font-size:14px;font-weight:700;color:var(--text-main,#f1f5f9);">نظام XP والرتب</div>
              <div style="font-size:12px;color:var(--text-muted,#94a3b8);margin-top:2px;">اكسب نقاط مع كل إنجاز وارتقِ في 10 مستويات متصاعدة</div></div>
            </div>
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:22px;min-width:32px;">📝</div>
              <div><div style="font-size:14px;font-weight:700;color:var(--text-main,#f1f5f9);">كشكول بيكاسو</div>
              <div style="font-size:12px;color:var(--text-muted,#94a3b8);margin-top:2px;">سجّل ملاحظاتك بالكتابة والرسم في مكان واحد</div></div>
            </div>
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:22px;min-width:32px;">🕌</div>
              <div><div style="font-size:14px;font-weight:700;color:var(--text-main,#f1f5f9);">الواحة الدينية</div>
              <div style="font-size:12px;color:var(--text-muted,#94a3b8);margin-top:2px;">مواقيت الصلاة، الأذكار، والورد القرآني يومياً</div></div>
            </div>
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:22px;min-width:32px;">📊</div>
              <div><div style="font-size:14px;font-weight:700;color:var(--text-main,#f1f5f9);">إحصائيات أسبوعية</div>
              <div style="font-size:12px;color:var(--text-muted,#94a3b8);margin-top:2px;">تابع تقدمك وساعاتك ومهامك بمخطط بياني تفاعلي</div></div>
            </div>
          </div>
        </div>

        <div class="app-timeline">
          <div class="app-timeline-title">سجل التحديثات</div>
          <div class="app-timeline-item">
            <div class="app-timeline-dot-wrap"><div class="app-timeline-dot"></div><div class="app-timeline-line"></div></div>
            <div class="app-timeline-content">
              <div class="app-timeline-ver">v3.0.0 — الإصدار الحالي</div>
              <div class="app-timeline-date">يونيو 2026</div>
              <div class="app-timeline-text">نظام Toast Notifications موحد، Theme Manager، PDF Export، Timer Sound Toggle، وتحسينات UI/UX شاملة.</div>
            </div>
          </div>
          <div class="app-timeline-item">
            <div class="app-timeline-dot-wrap"><div class="app-timeline-dot"></div><div class="app-timeline-line"></div></div>
            <div class="app-timeline-content">
              <div class="app-timeline-ver">v2.5.0</div>
              <div class="app-timeline-date">يونيو 2026</div>
              <div class="app-timeline-text">بروفايل متطور مع اختيار الأيقونة، إعداد الهدف الشخصي، نظام XP بـ10 رتب، إعدادات البومودورو والصوت، وتصدير البيانات.</div>
            </div>
          </div>
          <div class="app-timeline-item">
            <div class="app-timeline-dot-wrap"><div class="app-timeline-dot"></div><div class="app-timeline-line"></div></div>
            <div class="app-timeline-content">
              <div class="app-timeline-ver">v2.0.0</div>
              <div class="app-timeline-date">يونيو 2026</div>
              <div class="app-timeline-text">إطلاق App Shell الجديد مع Bottom Navigation والـ Drawer، شاشة Onboarding، وتحسين التنقل بين الصفحات.</div>
            </div>
          </div>
          <div class="app-timeline-item">
            <div class="app-timeline-dot-wrap"><div class="app-timeline-dot"></div><div class="app-timeline-line"></div></div>
            <div class="app-timeline-content">
              <div class="app-timeline-ver">v1.0.0</div>
              <div class="app-timeline-date">مايو 2026</div>
              <div class="app-timeline-text">الإطلاق الأول للمنصة مع التايمر والمهام اليومية والأذكار ومواقيت الصلاة.</div>
            </div>
          </div>
        </div>
      </div>
    `;
    return page;
  }

  function buildPrivacyPage() {
    const page = document.createElement('div');
    page.id = 'privacyTab';
    page.innerHTML = `
      <div class="app-privacy-wrapper">
        <div class="app-privacy-card">
          <h3>بياناتك آمنة تماماً 🔒</h3>
          <p>
            جميع بياناتك — إحصائياتك، مهامك، ملاحظاتك، ومستواك في نظام النقاط — تُحفَظ محلياً على جهازك فقط عبر الـ localStorage، ولا تُرسَل لأي خادم خارجي في أي وقت.
          </p>
          <h3>ما الذي نجمعه؟</h3>
          <p>
            لا نجمع أي بيانات شخصية. المنصة لا تحتاج إلى تسجيل دخول أو بريد إلكتروني. الاسم الذي تكتبه يُخزَّن على جهازك فقط ولا نراه نحن.
          </p>
          <h3>مواقيت الصلاة والقرآن</h3>
          <p>
            يتم الاتصال بخدمات خارجية مجانية (Aladhan API و Quran.com) لجلب مواقيت الصلاة وصفحات المصحف. هذه الطلبات لا تحتوي على أي بيانات شخصية.
          </p>
          <h3>حقك في بياناتك</h3>
          <p>
            تستطيع في أي وقت تصدير بياناتك كاملة أو حذفها نهائياً من خلال صفحة الإعدادات. البيانات ملكك بالكامل.
          </p>
        </div>
      </div>
    `;
    return page;
  }

  /* ---- نظام الملاحة ---- */
  window.navigateTo = function (pageId) {
    if (pageId === 'deen') {
      document.documentElement.setAttribute('data-interface', 'deen');
      if (typeof updateZikrDisplay === 'function') updateZikrDisplay();
    } else if (pageId === 'home' || pageId === 'stats') {
      document.documentElement.removeAttribute('data-interface');
    }

    if (pageId === 'stats' && typeof updateStreakAndChartSystem === 'function') {
      setTimeout(updateStreakAndChartSystem, 50);
    }

    document.querySelectorAll('.app-page').forEach(p => {
      p.classList.remove('active');
      p.style.setProperty('display', 'none', 'important');
    });

        const target = document.querySelector(`[data-page-id="${pageId}"]`);
    if (target) {
      target.classList.add('active');
      target.style.setProperty('display', 'block', 'important');
    }

    document.querySelectorAll('.app-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    document.querySelectorAll('.app-drawer-item[data-page]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    window.scrollTo(0, 0);
    closeDrawer();
  };

  function openDrawer() {
    document.getElementById('appDrawer').classList.add('open');
    document.getElementById('appDrawerOverlay').classList.add('open');
  }
  function closeDrawer() {
    const drawer = document.getElementById('appDrawer');
    const overlay = document.getElementById('appDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  function syncPrayerBadge() {
    const nextCountdown = document.getElementById('nextPrayerCountdown');
    const appBadge = document.getElementById('appPrayerBadge');
    if (nextCountdown && appBadge && nextCountdown.textContent && !nextCountdown.textContent.includes('جاري')) {
      appBadge.textContent = nextCountdown.textContent;
    }
  }

  /* ---- مستمعي الأحداث ---- */
  function bindEvents() {
    document.getElementById('appDrawerBtn').addEventListener('click', openDrawer);
    document.getElementById('appDrawerOverlay').addEventListener('click', closeDrawer);

    document.querySelectorAll('.app-nav-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
    document.querySelectorAll('.app-drawer-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });

    const themeToggle = document.getElementById('appThemeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        if (typeof toggleTheme === 'function') {
          toggleTheme();
        }
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        themeToggle.classList.toggle('on', isLight);
        const sub = document.querySelector('#themeItem .app-settings-item-sub');
        if (sub) sub.textContent = isLight ? 'فاتح' : 'داكن';
      });
    }

    const citySelect = document.getElementById('appCitySelect');
    if (citySelect) {
      citySelect.addEventListener('change', () => {
        const oldSelect = document.getElementById('citySelect');
        if (oldSelect) {
          oldSelect.value = citySelect.value;
          oldSelect.dispatchEvent(new Event('change'));
        } else {
          localStorage.setItem('savedCity', citySelect.value);
          if (typeof fetchPrayerTimes === 'function') fetchPrayerTimes(citySelect.value);
        }
      });
    }

    const editNameItem = document.getElementById('editNameItem');
    if (editNameItem) {
      editNameItem.addEventListener('click', () => {
        buildNameModal();
      });
    }

    const editGoalItem = document.getElementById('editGoalItem');
    if (editGoalItem) {
      editGoalItem.addEventListener('click', () => buildGoalModal());
    }

    const numLangSelect = document.getElementById('numLangSelect');
    if (numLangSelect) {
      numLangSelect.addEventListener('change', () => {
        localStorage.setItem('numLang', numLangSelect.value);
        const sub = numLangSelect.closest('.app-settings-item')?.querySelector('.app-settings-item-sub');
        if (sub) sub.textContent = numLangSelect.value === 'ar' ? 'عربي (١٢٣)' : 'إنجليزي (123)';
      });
    }

    const timerSoundSelect = document.getElementById('timerSoundSelect');
    if (timerSoundSelect) {
      timerSoundSelect.addEventListener('change', () => {
        localStorage.setItem('timerSound', timerSoundSelect.value);
      });
    }

    const pomoDurSelect = document.getElementById('pomoDurSelect');
    if (pomoDurSelect) {
      pomoDurSelect.addEventListener('change', () => {
        localStorage.setItem('pomoDuration', pomoDurSelect.value);
        if (typeof modeDurations !== 'undefined') {
          modeDurations['pomodoro'] = parseInt(pomoDurSelect.value) * 60;
        }
        const btn = document.getElementById('mode-pomodoro');
        if (btn) btn.textContent = `⏱️ بومودورو (${pomoDurSelect.value}د)`;
      });
    }

    const pomoBreakSelect = document.getElementById('pomoBreakSelect');
    if (pomoBreakSelect) {
      pomoBreakSelect.addEventListener('change', () => {
        localStorage.setItem('pomoBreak', pomoBreakSelect.value);
      });
    }

    const deleteBtn = document.getElementById('appDeleteAccount');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        Swal.fire({
          title: '🚨 تحذير!',
          text: 'سيتم مسح كافة إحصائياتك وإعداداتك المحلية تماماً من هذا المتصفح. هل تريد الاستمرار؟',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'نعم، امسح كل شيء',
          cancelButtonText: 'إلغاء',
          confirmButtonColor: '#ef4444',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.clear();
            location.reload();
          }
        });
      });
    }
  }

  /* ---- ربط الـ Session End Modal ---- */
  function patchTimerFinish() {
    const originalFn = window.handleTimerFinishedComplete;
    if (typeof originalFn === 'function') {
      window.handleTimerFinishedComplete = function () {
        originalFn.call(this);
        const isHardcore = localStorage.getItem('hardcoreModeActive') === 'true';
        const xp = isHardcore ? 50 : 20;
        setTimeout(() => showSessionEndModal(xp, isHardcore), 300);
      };
    } else {
      setTimeout(patchTimerFinish, 200);
    }
  }

  function initAppShell() {
    buildShell();
    wrapPages();
    bindEvents();
    syncPrayerBadge();

    const oldFooter = document.querySelector('footer');
    if (oldFooter) oldFooter.style.setProperty('display', 'none', 'important');

    if (shouldShowOnboarding()) {
      buildOnboardingOverlay();
    }

    patchTimerFinish();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppShell);
  } else {
    initAppShell();
  }



  // ===== SETTINGS BUTTON FIX =====
  // Ensure settings button works with script.js functions
  document.addEventListener('DOMContentLoaded', function() {
    var settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      // Remove inline onclick to prevent conflicts
      settingsBtn.removeAttribute('onclick');

      settingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Try calling function from script.js
        if (typeof openSettingsModal === 'function') {
          openSettingsModal();
        } else {
          // Fallback: show warning and retry
          if (typeof ToastSystem !== 'undefined') {
            ToastSystem.warning('جاري تحميل الإعدادات... ⏳');
          }
          setTimeout(function() {
            if (typeof openSettingsModal === 'function') {
              openSettingsModal();
            } else {
              console.error('openSettingsModal not found - script.js may not be loaded');
            }
          }, 1000);
        }
      });
    }
  });

})();