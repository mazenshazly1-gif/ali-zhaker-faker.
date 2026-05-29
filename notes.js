// ===================================================
// 📝 SAMSUNG NOTES LOGIC - الّلي ذاكر فاكر © 2026 📝
// ===================================================

let notesList = JSON.parse(localStorage.getItem('samsung_notes_list')) || [];
let currentNoteId = null;

// متغيرات لوحة الرسم والأدوات
const canvas = document.getElementById('samsungNotesCanvas');
let ctx = null;
let isDrawing = false;
let currentTool = 'draw'; // draw | eraser
let brushType = 'pen';   // pen | highlighter
let brushColor = '#000000';
let brushSize = 5;
let brushOpacity = 100;

// إحداثيات الرسم الأخيرة
let lastX = 0;
let lastY = 0;

// ==========================================
// 1. التحكم في النوافذ والتبديل (Modals)
// ==========================================
function openNotesModal() {
    document.getElementById('notesModalOverlay').style.display = 'flex';
    backToGallery(); // دائماً افتح على المعرض أولاً
}

function closeNotesModal() {
    document.getElementById('notesModalOverlay').style.display = 'none';
}

function backToGallery() {
    document.getElementById('notesEditorView').style.display = 'none';
    document.getElementById('notesGalleryView').style.display = 'flex';
    currentNoteId = null;
    renderNotesGallery();
}

// ==========================================
// 2. إدارة معرض الملاحظات (Gallery System)
// ==========================================
function renderNotesGallery() {
    const galleryGrid = document.getElementById('notesGalleryGrid');
    if (!galleryGrid) return;

    if (notesList.length === 0) {
        galleryGrid.innerHTML = `<div class="empty-gallery-msg">لا توجد ملاحظات حالياً، اضغط على (+) وابدأ التلخيص! 🚀</div>`;
        return;
    }

    galleryGrid.innerHTML = notesList.map(note => {
        return `
            <div class="note-card" onclick="loadNoteToEditor('${note.id}')">
                <div class="note-card-title">${note.title || 'ملاحظة بدون عنوان'}</div>
                <div class="note-card-date">📅 ${note.date}</div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 3. إنشاء وتحميل وحفظ الملاحظات (CRUD)
// ==========================================
function createNewNote() {
    const newId = 'note_' + Date.now();
    const todayStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const newNote = {
        id: newId,
        title: '',
        canvasData: null, // سنحفظ الرسم هنا كـ DataURL
        date: todayStr
    };

    notesList.unshift(newNote);
    localStorage.setItem('samsung_notes_list', JSON.stringify(notesList));
    
    loadNoteToEditor(newId);
}

function loadNoteToEditor(noteId) {
    currentNoteId = noteId;
    const note = notesList.find(n => n.id === noteId);
    if (!note) return;

    // تبديل الواجهات
    document.getElementById('notesGalleryView').style.display = 'none';
    document.getElementById('notesEditorView').style.display = 'flex';

    // تعيين العنوان
    document.getElementById('noteTitleInput').value = note.title;

    // تهيئة اللوحة وضبط الحجم
    initCanvasElement();

    // تحميل الرسم إن وجد
    if (note.canvasData) {
        const img = new Image();
        img.src = note.canvasData;
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    } else {
        clearCanvasSurface();
    }
}

function saveCurrentNote() {
    if (!currentNoteId) return;

    const noteIndex = notesList.findIndex(n => n.id === currentNoteId);
    if (noteIndex === -1) return;

    // تحديث البيانات
    notesList[noteIndex].title = document.getElementById('noteTitleInput').value.trim() || 'ملاحظة بدون عنوان';
    notesList[noteIndex].canvasData = canvas.toDataURL();

    // الحفظ في LocalStorage
    localStorage.setItem('samsung_notes_list', JSON.stringify(notesList));
    
    // مكافأة XP رمزية عند الحفظ والتلخيص لدعم سيستم الألعاب الخاص بك
    if (typeof addXp === 'function') {
        addXp(5);
    }

    alert('تم حفظ الملاحظة بنجاح! 💾');
    backToGallery();
}

function deleteCurrentNote() {
    if (!currentNoteId) return;

    if (confirm('هل أنت متأكد من حذف هذه الملاحظة نهائياً؟ 🗑️')) {
        notesList = notesList.filter(n => n.id !== currentNoteId);
        localStorage.setItem('samsung_notes_list', JSON.stringify(notesList));
        backToGallery();
    }
}

// ==========================================
// 4. لوحة ومحرك الرسم (Canvas Engine)
// ==========================================
function initCanvasElement() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // تحديد أبعاد حقيقية للـ Canvas تتطابق مع حاويتها المرئية
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // إعدادات خط الرسم الافتراضية للـ Canvas
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // إعادة تفعيل الأدوات بناءً على الحالة الحالية
    activateTool(currentTool);
}

// الحصول على إحداثيات دقيقة تتناسب مع الماوس أو اللمس
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}

function startDrawing(e) {
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
}

function drawLoop(e) {
    if (!isDrawing || !ctx) return;
    e.preventDefault(); // منع السحب الافتراضي على الشاشات الذكية

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);

    if (currentTool === 'eraser') {
        // نمط الممحاة: يمسح ما تحته ويعيده للون الخلفية الأبيض لسامسونج نوتس
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2; // الممحاة أعرض قليلاً لسهولة المسح
        ctx.stroke();
    } else {
        // نمط الرسم العادي أو الهايلايتر
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        
        if (brushType === 'highlighter') {
            ctx.globalAlpha = brushOpacity / 100; // شفافية للتظليل دون حجب النص
        } else {
            ctx.globalAlpha = 1.0; // القلم العادي معتم بالكامل
        }
        ctx.stroke();
    }

    lastX = coords.x;
    lastY = coords.y;
}

function stopDrawing() {
    isDrawing = false;
    if (ctx) ctx.beginPath(); // إنهاء المسار الحالي لتجنب ترابط الخطوط العشوائية
}

function clearCanvasSurface() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ==========================================
// 5. أدوات التخصيص والألوان (Toolbar Actions)
// ==========================================
function activateTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.toolbar-tool-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tool === 'draw') {
        document.getElementById('tool-draw').classList.add('active');
    } else if (tool === 'eraser') {
        document.getElementById('tool-eraser').classList.add('active');
    }
}

function toggleBrushSettings() {
    const panel = document.getElementById('brushSettingsPanel');
    if (panel) {
        panel.style.display = (panel.style.display === 'none' || panel.style.display === '') ? 'flex' : 'none';
    }
}

function setBrushType(type) {
    brushType = type;
    document.querySelectorAll('.btn-brush-type').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`brush-${type}`).classList.add('active');

    const opacityRow = document.getElementById('opacitySettingRow');
    const sizeSlider = document.getElementById('brushSizeSlider');
    const opacitySlider = document.getElementById('brushOpacitySlider');

    if (type === 'highlighter') {
        opacityRow.style.display = 'flex';
        brushSize = 25; // حجم افتراضي عريض للهايلايت
        brushOpacity = 40; // شفافية مثالية للهايلايت الأصفر والملون
    } else {
        opacityRow.style.display = 'none';
        brushSize = 5;  // حجم افتراضي مناسب للقلم
        brushOpacity = 100;
    }

    if (sizeSlider) sizeSlider.value = brushSize;
    if (opacitySlider) opacitySlider.value = brushOpacity;
}

function selectBrushColor(color, element) {
    brushColor = color;
    if (element) {
        document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
        element.classList.add('active');
    }
}

// ==========================================
// 6. أحداث التنصت عند تحميل الصفحة (Event Listeners)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // ربط مخرجات الـ Sliders بالمتغيرات
    document.getElementById('brushSizeSlider')?.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
    });

    document.getElementById('brushOpacitySlider')?.addEventListener('input', (e) => {
        brushOpacity = parseInt(e.target.value);
    });

    // ربط أحداث الفأرة (Mouse Events) على اللوحة
    if (canvas) {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', drawLoop);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        // ربط أحداث اللمس لشاشات الموبايل والتابلت (Touch Events)
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', drawLoop);
        canvas.addEventListener('touchend', stopDrawing);
    }

    // تهيئة معرض الملاحظات فور تحميل الصفحة
    renderNotesGallery();
});

// التعامل مع تغيير حجم الشاشة للحفاظ على أبعاد اللوحة مستقرة دون تشويه الرسوم
window.addEventListener('resize', () => {
    if (currentNoteId && canvas) {
        // نأخذ نسخة احتياطية من الرسم الحالي قبل تغيير الحجم
        const tempCanvasData = canvas.toDataURL();
        initCanvasElement();
        const img = new Image();
        img.src = tempCanvasData;
        img.onload = () => ctx.drawImage(img, 0, 0);
    }
});
