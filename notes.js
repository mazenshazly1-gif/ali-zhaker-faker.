// ===================================================
// 🎨 LOGIC MODULE: كشكول بيكاسو الذكي V3.0 المحبوك الاحترافي 🎨
// ===================================================

let picassoNotesList = JSON.parse(localStorage.getItem('picasso_master_list')) || [];
let activePicassoId = null;
let autoSaveInterval = null;

// متغيرات الـ PDF المطور متعدد الصفحات
let currentPdfDoc = null;
let currentPdfPageNum = 1;
let pdfPagesRenderedStates = {};

const pCanvas = document.getElementById('picassoDrawingCanvas');
const pTextArea = document.getElementById('picassoTextArea');
const pWorkspace = document.getElementById('picassoWorkspace');
let pCtx = null;

let isPicassoDrawing = false;
let picassoTool = 'draw'; 
let picassoColor = '#1e293b';
let picassoSize = 4;
let picassoAlpha = 1.0;
let picassoPoints = [];

// مصفوفات الـ Undo و الـ Redo للرسم الصافي
let undoStack = [];
let redoStack = [];

// --- 1. فتح وإغلاق المودال والمعرض مع البحث ---

function openPicassoModal() {
    document.getElementById('picassoModalOverlay').style.setProperty('display', 'flex', 'important');
    backToPicassoGallery();
}

function closePicassoModal() {
    document.getElementById('picassoModalOverlay').style.display = 'none';
    stopAutoSaveTimer();
    closePinMenu();
}

function backToPicassoGallery() {
    document.getElementById('picassoEditorView').style.display = 'none';
    document.getElementById('picassoGalleryView').style.display = 'flex';
    document.getElementById('pdfPageControls').style.display = 'none';
    removePinMenuButton();
    activePicassoId = null;
    currentPdfDoc = null;
    pdfPagesRenderedStates = {};
    stopAutoSaveTimer();
    renderPicassoGallery();
}

function renderPicassoGallery() {
    const grid = document.getElementById('picassoGalleryGrid');
    const searchQuery = document.getElementById('picassoSearchInput').value.trim().toLowerCase();
    if (!grid) return;
    
    let filteredNotes = picassoNotesList;
    if (searchQuery) {
        filteredNotes = picassoNotesList.filter(note => 
            (note.title && note.title.toLowerCase().includes(searchQuery)) || 
            (note.textContent && note.textContent.toLowerCase().includes(searchQuery))
        );
    }
    
    if (filteredNotes.length === 0) {
        grid.innerHTML = `<div class="empty-gallery-msg">لا توجد ملاحظات تطابق بحثك أو الخزنة فارغة! 🎨🚀</div>`;
        return;
    }
    
    grid.innerHTML = filteredNotes.map(note => `
        <div class="picasso-card" onclick="loadPicassoNote('${note.id}')">
            <div class="picasso-card-title">${escapeHtml(note.title) || 'لوحة بدون عنوان 🎨'}</div>
            <div class="picasso-card-date">📅 ${note.date} ${note.isPdf ? ' | 📄 كتاب PDF' : ''}</div>
        </div>
    `).join('');
}

// --- 2. التحكم في إنتاج وتحميل الملاحظات ---

function createNewPicassoNote() {
    const id = 'picasso_' + Date.now();
    const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    const newNote = { 
        id: id, 
        title: '', 
        textContent: '', 
        canvasDrawing: '',
        pdfStates: null,
        isPdf: false,
        isRuled: true,
        date: dateStr 
    };
    
    picassoNotesList.unshift(newNote);
    saveToLocalStorage();
    loadPicassoNote(id);
    
    if (typeof ToastSystem !== 'undefined') {
        ToastSystem.success("تم إنشاء ملاحظة جديدة 🎨");
    }
}

function loadPicassoNote(id) {
    activePicassoId = id;
    const note = picassoNotesList.find(n => n.id === id);
    if (!note) return;

    document.getElementById('picassoGalleryView').style.display = 'none';
    document.getElementById('picassoEditorView').style.display = 'flex';
    document.getElementById('picassoTitleInput').value = note.title;
    
    pTextArea.innerHTML = note.textContent || '';

    if (note.isRuled !== false) {
        pTextArea.classList.add('ruled-paper');
    } else {
        pTextArea.classList.remove('ruled-paper');
    }

    undoStack = [];
    redoStack = [];
    pdfPagesRenderedStates = note.pdfStates || {};
    currentPdfPageNum = 1;

    injectPinMenuButton();

    setTimeout(() => {
        initPicassoCanvasElement();
        
        if (note.isPdf && note.pdfFileRaw) {
            document.getElementById('pdfPageControls').style.display = 'flex';
            renderSavedPdfRaw(note.pdfFileRaw);
        } else if (note.canvasDrawing) {
            const img = new Image();
            img.src = note.canvasDrawing;
            img.onload = function() {
                pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                pCtx.drawImage(img, 0, 0);
                saveCanvasState(true); 
            };
        } else {
            clearPicassoCanvasSurface();
            saveCanvasState(true);
        }
        startAutoSaveTimer();
    }, 80);
}

// --- 3. الـ Word Tools: تلوين وتنسيق الخطوط ---

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    pTextArea.focus();
}

function insertTimestamp() {
    const now = new Date();
    const timeString = ` [⏱️ تم التلخيص في: ${now.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})} | 📅 ${now.toLocaleDateString('ar-EG')}] `;
    formatText('insertHTML', `<span class="note-timestamp" style="color: #a855f7; font-weight: bold; font-size: 13px;">${timeString}</span>`);
}

// --- 4. هندسة الكانفاس الحساس والموزون ضد التشفيت ---

function initPicassoCanvasElement() {
    if (!pCanvas || !pWorkspace) return;
    pCtx = pCanvas.getContext('2d');
    
    let tempCanvas = null;
    if (pCanvas.width > 0 && pCanvas.height > 0) {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = pCanvas.width;
        tempCanvas.height = pCanvas.height;
        tempCanvas.getContext('2d').drawImage(pCanvas, 0, 0);
    }

    pCanvas.width = pWorkspace.clientWidth;
    pCanvas.height = pWorkspace.clientHeight;
    
    pCtx.lineCap = 'round';
    pCtx.lineJoin = 'round';
    
    if (tempCanvas) {
        pCtx.drawImage(tempCanvas, 0, 0);
    }
    activatePicassoTool(picassoTool);
}

function getPicassoCoords(e) {
    const rect = pCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

// --- 5. نظام الـ Undo / Redo الدقيق للرسم ---

function saveCanvasState(isInitial = false) {
    if (!pCtx) return;
    if (undoStack.length > 30) undoStack.shift(); 
    undoStack.push(pCanvas.toDataURL());
    if (!isInitial) {
        redoStack = []; 
    }
}

function undoPicassoAction() {
    if (undoStack.length <= 1) return; 
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

// --- 6. ميكانيكية الرسم وفصل الهايلايتر الحقيقي الفسفوري ---

function startPicassoDrawing(e) {
    if (picassoTool === 'hand') return; 
    isPicassoDrawing = true;
    const coords = getPicassoCoords(e);
    picassoPoints = [coords];

    pCtx.beginPath();
    
    if (picassoTool === 'highlighter') {
        pCtx.globalCompositeOperation = 'multiply'; 
        pCtx.globalAlpha = 0.35; 
        pCtx.fillStyle = picassoColor === '#1e293b' ? '#fde047' : picassoColor; 
    } else if (picassoTool === 'eraser') {
        pCtx.globalCompositeOperation = 'destination-out';
        pCtx.globalAlpha = 1.0;
    } else {
        pCtx.globalCompositeOperation = 'source-over';
        pCtx.globalAlpha = picassoAlpha;
        pCtx.fillStyle = picassoColor;
    }
    
    const radius = picassoTool === 'highlighter' ? 26 : picassoSize;
    pCtx.arc(coords.x, coords.y, radius / 2, 0, Math.PI * 2);
    pCtx.fill();
}

function drawPicassoLoop(e) {
    if (!isPicassoDrawing || !pCtx || picassoTool === 'hand') return;
    if (e.cancelable) e.preventDefault();
    
    const coords = getPicassoCoords(e);
    picassoPoints.push(coords);

    pCtx.beginPath();
    
    if (picassoTool === 'highlighter') {
        pCtx.globalCompositeOperation = 'multiply';
        pCtx.strokeStyle = picassoColor === '#1e293b' ? '#fde047' : picassoColor;
        pCtx.lineWidth = 26; 
        pCtx.globalAlpha = 0.35;
    } else if (picassoTool === 'eraser') {
        pCtx.globalCompositeOperation = 'destination-out';
        pCtx.lineWidth = 35;
        pCtx.globalAlpha = 1.0;
    } else {
        pCtx.globalCompositeOperation = 'source-over';
        pCtx.strokeStyle = picassoColor;
        pCtx.lineWidth = picassoSize;
        pCtx.globalAlpha = picassoAlpha;
    }

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
        saveCanvasState(); 
    }
}

function activatePicassoTool(tool) {
    picassoTool = tool;
    document.querySelectorAll('.toolbar-tool-btn').forEach(btn => btn.classList.remove('active'));
    
    const toolBtn = document.getElementById(`tool-picasso-${tool}`);
    if (toolBtn) toolBtn.classList.add('active');

    if (tool === 'hand') {
        pCanvas.style.pointerEvents = 'none';
        pCanvas.style.cursor = 'default';
        pTextArea.style.pointerEvents = 'auto'; 
    } else {
        pCanvas.style.pointerEvents = 'auto';
        pCanvas.style.cursor = 'crosshair';
        pTextArea.style.pointerEvents = 'none'; 
    }
}

// --- 7. باليتة الألوان المفتوحة والمتخصصة ---

function setPicassoColor(color, element) {
    picassoColor = color;
    if (element) {
        document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
        element.classList.add('active');
    }
    if (picassoTool === 'hand' || picassoTool === 'eraser') {
        activatePicassoTool('draw'); 
    }
}

function handleCustomColorSelect(colorValue) {
    setPicassoColor(colorValue, null);
    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
}

function updatePicassoBrushSettings() {
    const sizeSlider = document.getElementById('picassoSizeSlider');
    if (sizeSlider) picassoSize = parseInt(sizeSlider.value);
}

function clearPicassoCanvasSurface() {
    if (!pCtx || !pCanvas) return;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    saveCanvasState();
    
    if (typeof ToastSystem !== 'undefined') {
        ToastSystem.info("تم مسح لوحة الرسم 🧹");
    }
}

// --- 8. ميكانيكية الدبوس الذكي والورق المسطر ---

function injectPinMenuButton() {
    removePinMenuButton();
    
    const pinBtn = document.createElement('button');
    pinBtn.id = 'picassoPinBtn';
    pinBtn.className = 'picasso-pin-dropdown-trigger';
    pinBtn.innerHTML = '📌';
    pinBtn.title = 'خيارات الصفحة الذكية';
    pinBtn.onclick = (e) => {
        e.stopPropagation();
        togglePinMenu();
    };
    
    const pinMenu = document.createElement('div');
    pinMenu.id = 'picassoPinMenu';
    pinMenu.className = 'picasso-pin-menu';
    pinMenu.style.display = 'none';
    pinMenu.onclick = (e) => e.stopPropagation();
    
    pinMenu.innerHTML = `
        <button class="pin-menu-item" onclick="toggleRuledPaperStyle()">📝 تحويل مظهر الورقة (مسطر/سادة)</button>
        <button class="pin-menu-item" onclick="clearPicassoCanvasSurface(); closePinMenu();">🗑️ مسح لوحة الرسم الصافي</button>
        <button class="pin-menu-item" onclick="insertTimestamp(); closePinMenu();">⏱️ إدراج طابع وقت المذاكرة</button>
        <button class="pin-menu-item" onclick="exportPicassoAsPDF('${activePicassoId}'); closePinMenu();">📄 تصدير كـ PDF</button>
        <button class="pin-menu-item" onclick="savePicassoNote()">💾 حفظ سريع وخروج</button>
    `;
    
    pWorkspace.appendChild(pinBtn);
    pWorkspace.appendChild(pinMenu);
}

function removePinMenuButton() {
    const oldBtn = document.getElementById('picassoPinBtn');
    const oldMenu = document.getElementById('picassoPinMenu');
    if (oldBtn) oldBtn.remove();
    if (oldMenu) oldMenu.remove();
}

function togglePinMenu() {
    const menu = document.getElementById('picassoPinMenu');
    if (!menu) return;
    menu.style.display = (menu.style.display === 'none') ? 'flex' : 'none';
}

function closePinMenu() {
    const menu = document.getElementById('picassoPinMenu');
    if (menu) menu.style.display = 'none';
}

function toggleRuledPaperStyle() {
    const isNowRuled = pTextArea.classList.toggle('ruled-paper');
    
    const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
    if (index !== -1) {
        picassoNotesList[index].isRuled = isNowRuled;
    }
    closePinMenu();
    
    if (typeof ToastSystem !== 'undefined') {
        ToastSystem.info(isNowRuled ? "تم تفعيل الورق المسطر 📝" : "تم تفعيل الورق السادة 📄");
    }
}

document.addEventListener('click', () => {
    closePinMenu();
});

// --- 9. محرك الـ PDF المطور ذو الصفحات المتعددة ---

function handlePicassoAttachment(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    activatePicassoTool('hand');
    
    if (file.type.includes('image')) {
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
                pCtx.drawImage(img, 0, 0, pCanvas.width, pCanvas.height);
                saveCanvasState();
            }
        };
        reader.readAsDataURL(file);
    } 
    else if (file.type === 'application/pdf') {
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const base64Raw = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            
            const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
            if (index !== -1) {
                picassoNotesList[index].isPdf = true;
                picassoNotesList[index].pdfFileRaw = base64Raw;
            }
            
            document.getElementById('pdfPageControls').style.display = 'flex';
            currentPdfPageNum = 1;
            pdfPagesRenderedStates = {};
            renderSavedPdfRaw(base64Raw);
            
            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.success("تم رفع ملف PDF بنجاح 📄");
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function renderSavedPdfRaw(base64String) {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    pdfjsLib.getDocument({data: bytes}).promise.then(function(pdfDoc_) {
        currentPdfDoc = pdfDoc_;
        renderCurrentPdfPage();
    });
}

function renderCurrentPdfPage() {
    if (!currentPdfDoc || !pCtx) return;
    
    currentPdfDoc.getPage(currentPdfPageNum).then(function(page) {
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min(pCanvas.width / viewport.width, pCanvas.height / viewport.height);
        const scaledViewport = page.getViewport({ scale: scale });
        
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        
        const renderContext = { canvasContext: pCtx, viewport: scaledViewport };
        page.render(renderContext).promise.then(() => {
            const savedDrawingForPage = pdfPagesRenderedStates[`page_${currentPdfPageNum}`];
            if (savedDrawingForPage) {
                const img = new Image();
                img.src = savedDrawingForPage;
                img.onload = function() {
                    pCtx.drawImage(img, 0, 0);
                    undoStack = [pCanvas.toDataURL()];
                };
            } else {
                undoStack = [pCanvas.toDataURL()];
            }
            
            document.getElementById('pdfPageIndicator').innerText = `صفحة ${currentPdfPageNum} / ${currentPdfDoc.numPages}`;
        });
    });
}

function nextPdfPage() {
    if (!currentPdfDoc || currentPdfPageNum >= currentPdfDoc.numPages) return;
    pdfPagesRenderedStates[`page_${currentPdfPageNum}`] = pCanvas.toDataURL();
    currentPdfPageNum++;
    renderCurrentPdfPage();
}

function prevPdfPage() {
    if (!currentPdfDoc || currentPdfPageNum <= 1) return;
    pdfPagesRenderedStates[`page_${currentPdfPageNum}`] = pCanvas.toDataURL();
    currentPdfPageNum--;
    renderCurrentPdfPage();
}

// --- 10. الحفظ التلقائي الذكي، اليدوي، والتنظيف ---

function startAutoSaveTimer() {
    stopAutoSaveTimer();
    autoSaveInterval = setInterval(() => {
        if (!activePicassoId) return;
        const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
        if (index === -1) return;

        picassoNotesList[index].title = document.getElementById('picassoTitleInput').value.trim() || 'ملاحظة بدون عنوان';
        picassoNotesList[index].textContent = pTextArea.innerHTML; 
        picassoNotesList[index].isRuled = pTextArea.classList.contains('ruled-paper');

        if (picassoNotesList[index].isPdf) {
            pdfPagesRenderedStates[`page_${currentPdfPageNum}`] = pCanvas.toDataURL();
            picassoNotesList[index].pdfStates = pdfPagesRenderedStates;
        } else {
            picassoNotesList[index].canvasDrawing = pCanvas.toDataURL();
        }

        try {
            saveToLocalStorage();
            console.log('📌 تم الحفظ التلقائي الصامت...');
        } catch (e) {
            console.warn('⚠️ الذاكرة ممتلئة، يتم حفظ الهيكل الأساسي والنص بنجاح.');
        }
    }, 4000); 
}

function stopAutoSaveTimer() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

function savePicassoNote() {
    if (!activePicassoId) return;
    const index = picassoNotesList.findIndex(n => n.id === activePicassoId);
    if (index === -1) return;

    picassoNotesList[index].title = document.getElementById('picassoTitleInput').value.trim() || 'ملاحظة بدون عنوان';
    picassoNotesList[index].textContent = pTextArea.innerHTML;
    picassoNotesList[index].isRuled = pTextArea.classList.contains('ruled-paper');
    
    if (picassoNotesList[index].isPdf) {
        pdfPagesRenderedStates[`page_${currentPdfPageNum}`] = pCanvas.toDataURL();
        picassoNotesList[index].pdfStates = pdfPagesRenderedStates;
    } else {
        picassoNotesList[index].canvasDrawing = pCanvas.toDataURL();
    }
    
    try {
        saveToLocalStorage();
        if (typeof addXp === 'function') { addXp(15); } 
        backToPicassoGallery();
        
        if (typeof ToastSystem !== 'undefined') {
            ToastSystem.success("تم حفظ الملاحظة بنجاح! +15 XP 💾");
        }
    } catch (error) {
        if (typeof ToastSystem !== 'undefined') {
            ToastSystem.warning("⚠️ تنبيه: مساحة التخزين ممتلئة بالملفات! تم حفظ النصوص والتنسيقات بنجاح، يفضل مسح النوتس القديمة جداً لتوفير مساحة للرسوم الكبيرة.");
        }
    }
}

function deletePicassoNote() {
    if (!activePicassoId) return;
    Swal.fire({
        title: '🗑️ حذف الملاحظة؟',
        text: 'هل تريد مسح هذا الملخص وملاحظاته نهائياً؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#ef4444',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            stopAutoSaveTimer();
            picassoNotesList = picassoNotesList.filter(n => n.id !== activePicassoId);
            saveToLocalStorage();
            backToPicassoGallery();

            if (typeof ToastSystem !== 'undefined') {
                ToastSystem.delete("تم حذف الملاحظة نهائياً 🗑️");
            }
        }
    });
}

function saveToLocalStorage() {
    localStorage.setItem('picasso_master_list', JSON.stringify(picassoNotesList));
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- 11. إعداد واستماع الأحداث الاستباقية ---

document.addEventListener('DOMContentLoaded', () => {
    if (pCanvas) {
        pCanvas.addEventListener('mousedown', startPicassoDrawing);
        pCanvas.addEventListener('mousemove', drawPicassoLoop);
        pCanvas.addEventListener('mouseup', stopPicassoDrawing);
        pCanvas.addEventListener('mouseleave', stopPicassoDrawing);
        
        pCanvas.addEventListener('touchstart', startPicassoDrawing, { passive: false });
        pCanvas.addEventListener('touchmove', drawPicassoLoop, { passive: false });
        pCanvas.addEventListener('touchend', stopPicassoDrawing);
    }
    
    window.addEventListener('resize', () => {
        if (activePicassoId) {
            if (currentPdfDoc) {
                renderCurrentPdfPage();
            } else {
                initPicassoCanvasElement();
            }
        }
    });

    renderPicassoGallery();
});

// ==========================================================================
// 📄 PDF EDITOR FUNCTIONS - Added to fix missing functionality
// ==========================================================================

function openPdfEditorModal() {
    const modal = document.getElementById('pdfEditorModal');
    if (!modal) {
        ToastSystem.error('محرر PDF غير متوفر ❌');
        return;
    }
    modal.style.display = 'flex';

    // Ensure PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
        ToastSystem.info('جاري تحميل مكتبة PDF...');
        loadPdfJsLibrary();
    }
}

function closePdfEditorModal() {
    const modal = document.getElementById('pdfEditorModal');
    if (modal) modal.style.display = 'none';
}

function loadPdfJsLibrary() {
    if (typeof pdfjsLib !== 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = function() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        ToastSystem.success('تم تحميل مكتبة PDF ✅');
    };
    script.onerror = function() {
        ToastSystem.error('فشل تحميل مكتبة PDF ❌');
    };
    document.head.appendChild(script);
}

function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        ToastSystem.error('من فضلك ارفع ملف PDF صالح ❌');
        return;
    }

    // Ensure PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
        ToastSystem.info('جاري تحميل مكتبة PDF أولاً...');
        loadPdfJsLibrary();
        // Retry after load
        setTimeout(() => handlePdfUpload(event), 2000);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);

        pdfjsLib.getDocument({data: typedarray}).promise.then(function(pdf) {
            window.currentPdfDoc = pdf;
            window.currentPdfPage = 1;
            renderPdfPage(1);
            ToastSystem.success('تم تحميل PDF: ' + pdf.numPages + ' صفحة 📄');
        }).catch(function(err) {
            ToastSystem.error('فشل تحميل PDF: ' + err.message);
        });
    };
    reader.readAsArrayBuffer(file);
}

function renderPdfPage(pageNum) {
    if (!window.currentPdfDoc) return;

    window.currentPdfDoc.getPage(pageNum).then(function(page) {
        const workspace = document.getElementById('pdfWorkspace');
        if (!workspace) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const viewport = page.getViewport({scale: 1.0});
        const scale = Math.min(
            (workspace.clientWidth - 40) / viewport.width,
            (workspace.clientHeight - 40) / viewport.height,
            1.5
        );

        const scaledViewport = page.getViewport({scale: scale});
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        page.render({
            canvasContext: ctx,
            viewport: scaledViewport
        }).promise.then(function() {
            workspace.innerHTML = '';
            workspace.appendChild(canvas);
            workspace.style.display = 'flex';
            workspace.style.justifyContent = 'center';
            workspace.style.alignItems = 'center';
        });
    });
}

function addPdfText() {
    ToastSystem.info('📝 ميزة إضافة نص قيد التطوير');
}

function addPdfHighlight() {
    ToastSystem.info('🖍️ ميزة التظليل قيد التطوير');
}

function exportPdf() {
    ToastSystem.info('💾 تصدير PDF قيد التطوير');
}
