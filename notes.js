// ===================================================
// 🎨 LOGIC MODULE: طلّع بيكاسو اللي جواك V3 المحبوك 🎨
// ===================================================

let picassoNotesList = JSON.parse(localStorage.getItem('picasso_master_list')) || [];
let activePicassoId = null;

const pCanvas = document.getElementById('picassoDrawingCanvas');
const pTextArea = document.getElementById('picassoTextArea');
const pWorkspace = document.getElementById('picassoWorkspace');
let pCtx = null;

let isPicassoDrawing = false;
let picassoTool = 'draw'; // hand, draw, highlighter, eraser
let picassoColor = '#000000';
let picassoSize = 4;
let picassoAlpha = 1.0;
let picassoPoints = [];

// مصفوفات الـ Undo و الـ Redo لحفظ الحالات (الأسهم)
let undoStack = [];
let redoStack = [];

function openPicassoModal() {
    document.getElementById('picassoModalOverlay').style.display = 'flex';
    backToPicassoGallery();
}

function closePicassoModal() {
    document.getElementById('picassoModalOverlay').style.display = 'none';
}

function backToPicassoGallery() {
    document.getElementById('picassoEditorView').style.display = 'none';
    document.getElementById('picassoGalleryView').style.display = 'flex';
    activePicassoId = null;
    renderPicassoGallery();
}

function renderPicassoGallery() {
    const grid = document.getElementById('picassoGalleryGrid');
    if (!grid) return;
    if (picassoNotesList.length === 0) {
        grid.innerHTML = `<div class="empty-gallery-msg">لا توجد لوحات حالياً، اضغط على (+) وطلّع بيكاسو اللي جواك! 🎨🚀</div>`;
        return;
    }
    grid.innerHTML = picassoNotesList.map(note => `
        <div class="picasso-card" onclick="loadPicassoNote('${note.id}')">
            <div class="picasso-card-title">${note.title || 'لوحة بدون عنوان 🎨'}</div>
            <div class="picasso-card-date">📅 ${note.date}</div>
        </div>
    `).join('');
}

function createNewPicassoNote() {
    const id = 'picasso_' + Date.now();
    const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    const newNote = { id: id, title: '', textContent: '', canvasDrawing: '', date: dateStr };
    
    picassoNotesList.unshift(newNote);
    localStorage.setItem('picasso_master_list', JSON.stringify(picassoNotesList));
    loadPicassoNote(id);
}

function loadPicassoNote(id) {
    activePicassoId = id;
    const note = picassoNotesList.find(n => n.id === id);
    if (!note) return;

    document.getElementById('picassoGalleryView').style.display = 'none';
    document.getElementById('picassoEditorView').style.display = 'flex';
    document.getElementById('picassoTitleInput').value = note.title;
    pTextArea.value = note.textContent || '';

    // تصفير الـ Stacks عند فتح نوت جديدة
    undoStack = [];
    redoStack = [];

    // تأخير بسيط للتأكد من ريندر الـ DOM وحساب المقاسات صح
    setTimeout(() => {
        initPicassoCanvasElement();
        if (note.canvasDrawing) {
            const img = new Image();
            img.src = note.canvasDrawing;
            img.onload = function() {
                pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                pCtx.drawImage(img, 0, 0);
                saveCanvasState(); // حفظ الحالة البدائية في الـ Undo
            };
        } else {
            clearPicassoCanvasSurface();
            saveCanvasState();
        }
    }, 50);
}

function initPicassoCanvasElement() {
    if (!pCanvas) return;
    pCtx = pCanvas.getContext('2d');
    
    // أخذ مقاس الحاوية بالظبط لمنع التشفيت
    pCanvas.width = pWorkspace.clientWidth;
    pCanvas.height = pWorkspace.clientHeight;
    
    pCtx.lineCap = 'round';
    pCtx.lineJoin = 'round';
    activatePicassoTool(picassoTool);
}

function getPicassoCoords(e) {
    const rect = pCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

// نظام الـ Undo / Redo المطور
function saveCanvasState() {
    if (!pCtx) return;
    // حفظ لقطة كاملة من الكانفاس لحمايتها
    if (undoStack.length > 20) undoStack.shift(); // حد أقصى 20 خطوة عشان الذاكرة
    undoStack.push(pCanvas.toDataURL());
    redoStack = []; // تفريغ الـ Redo عند حدوث أي حركة جديدة
}

function undoPicassoAction() {
    if (undoStack.length <= 1) return; // محتاجين على الأقل الحالة البدائية
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    
    const previousState = undoStack[undoStack.length - 1];
    restoreCanvasFromDataURL(previousState);
}

function redoPicassoAction() {
    if (redoStack.length === 0) return;
    const nextState = redoStack.pop();
    undoStack.push(nextState);
    restoreCanvasFromDataURL(nextState);
}

function restoreCanvasFromDataURL(dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = function() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.drawImage(img, 0, 0);
    };
}

function startPicassoDrawing(e) {
    if (picassoTool === 'hand') return; // منع الرسم تماماً في وضع اليد
    isPicassoDrawing = true;
    const coords = getPicassoCoords(e);
    picassoPoints = [coords];

    pCtx.beginPath();
    pCtx.arc(coords.x, coords.y, (picassoTool === 'highlighter' ? 24 : picassoSize) / 2, 0, Math.PI * 2);
    pCtx.fillStyle = picassoTool === 'eraser' ? 'rgba(0,0,0,1)' : picassoColor;
    pCtx.globalCompositeOperation = picassoTool === 'eraser' ? 'destination-out' : 'source-over';
    pCtx.globalAlpha = picassoTool === 'highlighter' ? (picassoAlpha * 0.4) : picassoAlpha;
    pCtx.fill();
}

function drawPicassoLoop(e) {
    if (!isPicassoDrawing || !pCtx || picassoTool === 'hand') return;
    e.preventDefault();
    const coords = getPicassoCoords(e);
    picassoPoints.push(coords);

    pCtx.beginPath();
    pCtx.globalCompositeOperation = picassoTool === 'eraser' ? 'destination-out' : 'source-over';
    pCtx.strokeStyle = picassoColor;
    pCtx.lineWidth = picassoTool === 'highlighter' ? 30 : (picassoTool === 'eraser' ? 40 : picassoSize);
    pCtx.globalAlpha = picassoTool === 'highlighter' ? 0.4 : picassoAlpha;

    pCtx.moveTo(picassoPoints[0].x, picassoPoints[0].y);
    let i;
    for (i = 1; i < picassoPoints.length - 1; i++) {
        const xc = (picassoPoints[i].x + picassoPoints[i + 1].x) / 2;
        const yc = (picassoPoints[i].y + picassoPoints[i + 1].y) / 2;
        pCtx.quadraticCurveTo(picassoPoints[i].x, picassoPoints[i].y, xc, yc);
    }
    pCtx.stroke();
    
    if (picassoPoints.length > 10) { picassoPoints.shift(); }
}

function stopPicassoDrawing() {
    if (isPicassoDrawing) {
        isPicassoDrawing = false;
        picassoPoints = [];
        saveCanvasState(); // حفظ الخطوة فوراً بعد رفع القلم
    }
}

// السيطرة على الـ Pointer Events لحل أزمة التكست والقراءة والـ Scrolling
function activatePicassoTool(tool) {
    picassoTool = tool;
    document.querySelectorAll('.toolbar-tool-btn').forEach(btn => btn.classList.remove('active'));
    
    const toolBtn = document.getElementById(`tool-picasso-${tool}`);
    if (toolBtn) toolBtn.classList.add('active');

    if (tool === 'hand') {
        // وضع اليد: الكانفاس شفاف هيدروليك، تضغط وتكتب وتعمل سكرول براحتك للـ PDF والنص
        pCanvas.style.pointerEvents = 'none';
        pCanvas.style.cursor = 'default';
    } else {
        // أوضاع الرسم: الكانفاس يستقبل اللمس والقلم فوراً ويقفل اللي تحته
        pCanvas.style.pointerEvents = 'auto';
        pCanvas.style.cursor = 'crosshair';
    }
}

function updatePicassoBrushSettings() {
    const sizeSlider = document.getElementById('picassoSizeSlider');
    const alphaSlider = document.getElementById('picassoAlphaSlider');
    if (sizeSlider) picassoSize = parseInt(sizeSlider.value);
    if (alphaSlider) picassoAlpha = parseFloat(alphaSlider.value) / 100;
}

function setPicassoColor(color, element) {
    picassoColor = color;
    if (element) {
        document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
        element.classList.add('active');
    }
    if (picassoTool === 'hand' || picassoTool === 'eraser') {
        activatePicassoTool('draw'); // قلب تلقائي لقلم لو اختار لون
    }
}

function clearPicassoCanvasSurface() {
    if (!pCtx || !pCanvas) return;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    saveCanvasState();
}

function handlePicassoAttachment(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    activatePicassoTool('hand'); // نقل المستخدم تلقائياً لوضع التصفح عشان يشوف الملف
    
    if (file.type.includes('image')) {
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                // مسح الكانفاس ورسم الصورة كخلفية ثابتة
                pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                pCtx.drawImage(img, 0, 0, pCanvas.width, pCanvas.height);
                saveCanvasState();
            }
        };
        reader.readAsDataURL(file);
    } 
    else if (file.type === 'application/pdf') {
        reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                // ريندر الصفحة الأولى داخل الكانفاس بأبعاد الحاوية بالظبط
                pdf.getPage(1).then(function(page) {
                    const viewport = page.getViewport({ scale: 1.0 });
                    const scale = Math.min(pCanvas.width / viewport.width, pCanvas.height / viewport.height);
                    const scaledViewport = page.getViewport({ scale: scale });
                    
                    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                    const renderContext = { canvasContext: pCtx, viewport: scaledViewport };
                    page.render(renderContext).promise.then(() => {
                        saveCanvasState();
                    });
                });
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

function savePicassoNote() {
    if (!activePicassoId) return;
    const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
    if (index === -1) return;

    picassoNotesList[index].title = document.getElementById('picassoTitleInput').value.trim() || 'لوحة بيكاسو بدون عنوان';
    picassoNotesList[index].textContent = pTextArea.value;
    
    try {
        picassoNotesList[index].canvasDrawing = pCanvas.toDataURL();
        localStorage.setItem('picasso_master_list', JSON.stringify(picassoNotesList));
        if (typeof addXp === 'function') { addXp(15); } // 15 XP لإنتاج بيكاسو الخالي من العك!
        alert('تم حفظ اللوحة والملاحظات بنجاح في خزنتك! 💾🎨');
        backToPicassoGallery();
    } catch (error) {
        alert('⚠️ خطأ: مساحة المتصفح ممتلئة بسبب حجم الملف المرفوع الكبير! حاول استخدام ملفات أصغر.');
    }
}

function deletePicassoNote() {
    if (!activePicassoId) return;
    if (confirm('هل تريد مسح هذه اللوحة وملاحظاتها نهائياً؟ 🗑️')) {
        picassoNotesList = picassoNotesList.filter(n => n.id !== activePicassoId);
        localStorage.setItem('picasso_master_list', JSON.stringify(picassoNotesList));
        backToPicassoGallery();
    }
}

// أحداث الماوس والتاتش
document.addEventListener('DOMContentLoaded', () => {
    const canvasEl = document.getElementById('picassoDrawingCanvas');
    if (canvasEl) {
        canvasEl.addEventListener('mousedown', startPicassoDrawing);
        canvasEl.addEventListener('mousemove', drawPicassoLoop);
        canvasEl.addEventListener('mouseup', stopPicassoDrawing);
        canvasEl.addEventListener('mouseleave', stopPicassoDrawing);
        
        canvasEl.addEventListener('touchstart', startPicassoDrawing, { passive: false });
        canvasEl.addEventListener('touchmove', drawPicassoLoop, { passive: false });
        canvasEl.addEventListener('touchend', stopPicassoDrawing);
    }
    renderPicassoGallery();
});
