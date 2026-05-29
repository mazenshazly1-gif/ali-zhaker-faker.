// ===================================================
// 🎨 LOGIC MODULE: طلّع بيكاسو اللي جواك V2 🎨
// ===================================================

let picassoNotesList = JSON.parse(localStorage.getItem('picasso_master_list')) || [];
let activePicassoId = null;

const pCanvas = document.getElementById('picassoDrawingCanvas');
const pTextArea = document.getElementById('picassoTextArea');
let pCtx = null;

let isPicassoDrawing = false;
let picassoTool = 'draw'; // draw, highlighter, eraser
let picassoColor = '#000000';
let picassoSize = 4;
let picassoAlpha = 1.0;

// إحداثيات الرسم السلس (قائمة النقاط لمنع التكسير)
let picassoPoints = [];

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

    initPicassoCanvasElement();

    if (note.canvasDrawing) {
        const img = new Image();
        img.src = note.canvasDrawing;
        img.onload = function() {
            pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
            pCtx.drawImage(img, 0, 0);
        };
    } else {
        clearPicassoCanvasSurface();
    }
}

function initPicassoCanvasElement() {
    if (!pCanvas) return;
    pCtx = pCanvas.getContext('2d');
    const container = pCanvas.parentElement;
    
    pCanvas.width = container.clientWidth;
    pCanvas.height = container.clientHeight;
    
    pCtx.lineCap = 'round';
    pCtx.lineJoin = 'round';
    activatePicassoTool(picassoTool);
}

// حساب الإحداثيات الدقيقة للموس والتاتش لضمان الاستجابة على الحواف
function getPicassoCoords(e) {
    const rect = pCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

// خوارزمية الرسم السلس بالمنحنيات ودعم النقاط المستقلة (Click Dots)
function startPicassoDrawing(e) {
    isPicassoDrawing = true;
    const coords = getPicassoCoords(e);
    picassoPoints = [coords];

    // رسم نقطة فورية في مكان الضغط إذا لم يتحرك القلم (لحل مشكلة عدم الاستجابة للنقاط)
    pCtx.beginPath();
    pCtx.arc(coords.x, coords.y, picassoSize / 2, 0, Math.PI * 2);
    pCtx.fillStyle = picassoTool === 'eraser' ? 'rgba(0,0,0,1)' : picassoColor;
    pCtx.globalCompositeOperation = picassoTool === 'eraser' ? 'destination-out' : 'source-over';
    pCtx.globalAlpha = picassoTool === 'highlighter' ? 0.4 : picassoAlpha;
    pCtx.fill();
}

function drawPicassoLoop(e) {
    if (!isPicassoDrawing || !pCtx) return;
    e.preventDefault();
    const coords = getPicassoCoords(e);
    picassoPoints.push(coords);

    pCtx.beginPath();
    pCtx.globalCompositeOperation = picassoTool === 'eraser' ? 'destination-out' : 'source-over';
    pCtx.strokeStyle = picassoColor;
    pCtx.lineWidth = picassoTool === 'highlighter' ? 24 : (picassoTool === 'eraser' ? 30 : picassoSize);
    pCtx.globalAlpha = picassoTool === 'highlighter' ? 0.4 : 1.0;

    // استخدام الـ Quadratic Curves لمنع التكسير وجعل الخط انسيابي
    pCtx.moveTo(picassoPoints[0].x, picassoPoints[0].y);
    let i;
    for (i = 1; i < picassoPoints.length - 1; i++) {
        const xc = (picassoPoints[i].x + picassoPoints[i + 1].x) / 2;
        const yc = (picassoPoints[i].y + picassoPoints[i + 1].y) / 2;
        pCtx.quadraticCurveTo(picassoPoints[i].x, picassoPoints[i].y, xc, yc);
    }
    pCtx.stroke();
    
    // تقليص المصفوفة للحفاظ على سرعة المتصفح
    if (picassoPoints.length > 10) { picassoPoints.shift(); }
}

function stopPicassoDrawing() {
    isPicassoDrawing = false;
    picassoPoints = [];
}

function activatePicassoTool(tool) {
    picassoTool = tool;
    document.querySelectorAll('.toolbar-tool-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tool === 'draw') document.getElementById('tool-picasso-draw').classList.add('active');
    else if (tool === 'highlighter') document.getElementById('tool-picasso-highlighter').classList.add('active');
    else if (tool === 'eraser') document.getElementById('tool-picasso-eraser').classList.add('active');
}

function setPicassoColor(color, element) {
    picassoColor = color;
    if (element) {
        document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
        element.classList.add('active');
    }
}

function clearPicassoCanvasSurface() {
    if (!pCtx || !pCanvas) return;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
}

// ميزة قراءة الميديا والـ PDFs الملحمية فرونت إند بالكامل
function handlePicassoAttachment(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.type.includes('image')) {
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                pCtx.drawImage(img, 0, 0, pCanvas.width, pCanvas.height);
            }
        };
        reader.readAsDataURL(file);
    } 
    else if (file.type === 'application/pdf') {
        reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                // قراءة الصفحة الأولى من الملخص أو المذكرة المرفوعة وعرضها بالخلفية
                pdf.getPage(1).then(function(page) {
                    const viewport = page.getViewport({ scale: 1.2 });
                    const renderContext = { canvasContext: pCtx, viewport: viewport };
                    page.render(renderContext);
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
    picassoNotesList[index].canvasDrawing = pCanvas.toDataURL(); // حفظ الرسم كـ Base64 مدمج

    localStorage.setItem('picasso_master_list', JSON.stringify(picassoNotesList));
    if (typeof addXp === 'function') { addXp(10); } // مكافأة الـ XP لبيكاسو المبدع!
    
    alert('تم حفظ اللوحة والملاحظات بنجاح في خزنتك! 💾🎨');
    backToPicassoGallery();
}

function deletePicassoNote() {
    if (!activePicassoId) return;
    if (confirm('هل تريد مسح هذه اللوحة وملاحظاتها نهائياً؟ 🗑️')) {
        picassoNotesList = picassoNotesList.filter(n => n.id !== activePicassoId);
        localStorage.setItem('picasso_master_list', JSON.stringify(picassoNotesList));
        backToPicassoGallery();
    }
}

// ربط الأحداث الموحدة للموس والتش عالي الاستجابة
document.addEventListener('DOMContentLoaded', () => {
    if (pCanvas) {
        pCanvas.addEventListener('mousedown', startPicassoDrawing);
        pCanvas.addEventListener('mousemove', drawPicassoLoop);
        pCanvas.addEventListener('mouseup', stopPicassoDrawing);
        
        pCanvas.addEventListener('touchstart', startPicassoDrawing, { passive: false });
        pCanvas.addEventListener('touchmove', drawPicassoLoop, { passive: false });
        pCanvas.addEventListener('touchend', stopPicassoDrawing);
    }
    renderPicassoGallery();
});
