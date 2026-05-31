// ===================================================
// 🤖 Smart AI Bot Module - محرك الذكاء الاصطناعي الحي والمفكر
// ===================================================

// فتح وقفل السايد بار الخاص بالبوت
function toggleBotSidebar() {
    const sidebar = document.getElementById('botSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            document.getElementById('botInput').focus();
            checkApiKeyOnOpen(); // التأكد من وجود المفتاح عند الفتح
        }
    }
}

// دالة تفحص لو المفتاح متخزن ولا لاء وتظهره للمستخدم لتعديله لو حب
function checkApiKeyOnOpen() {
    let apiKey = localStorage.getItem('openrouter_api_key');
    // لو مش موجود، ممكن تخليه يطلب المفتاح أو تنبه المستخدم في الشات بصمت
    if (!apiKey) {
        console.warn('⚠️ تنبيه: لم يتم تعيين OpenRouter API Key في الـ LocalStorage بعد.');
    }
}

// إرسال الرسالة ومعالجتها بالذكاء الاصطناعي فوراً
async function sendBotMessage() {
    const input = document.getElementById('botInput');
    const container = document.getElementById('botChatContainer');
    const text = input.value.trim();

    if (!text) return;

    // 1. عرض رسالة المستخدم في الشات
    appendMessage(text, 'user');
    input.value = '';

    // 2. إظهار تأثير التفكير (Loading)
    const loadingId = appendLoading();
    container.scrollTop = container.scrollHeight;

    // 3. إرسال السؤال للمخ الذكي
    try {
        const responseText = await fetchLiveAIResponse(text);
        removeLoading(loadingId);
        appendMessage(responseText, 'bot');
    } catch (error) {
        removeLoading(loadingId);
        appendMessage('معلش يا هندسة، السيرفر هنج مني ثانية.. اسألني تاني كدا عشان دماغي تجمع!', 'bot');
    }

    container.scrollTop = container.scrollHeight;
}

// المحرك الرئيسي للذكاء الاصطناعي - بيحلل ويفكر ويرد بالمصري
async function fetchLiveAIResponse(prompt) {
    // جلب المفتاح بأمان من متصفح المستخدم مباشرة بدون رفعه على جيت هاب
    const apiKey = localStorage.getItem('openrouter_api_key');
    
    if (!apiKey) {
        return 'يا غالي، أنت لسه ما ضفتش الـ API Key بتاعك في الـ LocalStorage. اكتب في الـ Console عندك: localStorage.setItem("openrouter_api_key", "مفتاحك_هنا") عشان أقدر أشتغل وأفرم معاك المذاكرة! 🚀';
    }

    const systemPrompt = `
    أنت مساعد ذكي ومحفز اسمك 'الّلي ذاكر فاكر'. أنت لست آلة جامدة ولا تحفظ ردوداً، بل تفكر وتحلل بعمق.
    تتحدث باللهجة المصرية العامية الودودة جداً، بأسلوب "أولاد البلد" والمطورين (مثل: يا هندسة، يا غالي، يا بطل، طحن، فرم).
    مهمتك:
    1. تحفيز المستخدم وتشجيعه بذكاء وبدون كليشيهات مملة إذا كان محبطاً أو متعباً.
    2. حل الأسئلة العلمية، الفيزيائية، الكيميائية، والرياضية خطوة بخطوة مع الشرح المبسط جداً بالمصري وتدعيم المعادلات.
    3. مراجعة وتصحيح الأكواد البرمجية (HTML, CSS, JS) وشرح الأخطاء بمنطق هندسي سليم.
    4. إذا كان الكلام مجرد فضفضة، شاركه الحوار كصديق حقيقي في غرفة التحكم.
    اجعل ردودك دائماً مبهجة، ذكية، وعملية.
    `;

    try {
        const response = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // استخدام المفتاح الديناميكي الآمن
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        return 'بص يا هندسة، الإشارة قطعت في دماغي ثانية، قول تاني كدا؟';
    } catch (error) {
        console.error('AI Fetch Error:', error);
        return 'الظاهر إنك أوفلاين يا بطل.. مفيش إنترنت يوصلني بمخي الكبير دلوقتي. ركز في اللي في إيدك وراجع قوانينك، وأول ما الشبكة تيجي هكون معاك في أي مسألة!';
    }
}

// دالة بناء فقاعة الرسالة
function appendMessage(text, sender) {
    const container = document.getElementById('botChatContainer');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${sender}`;
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
}

// دالة نقاط التفكير (Loading Dots)
function appendLoading() {
    const container = document.getElementById('botChatContainer');
    const id = 'loading-' + Date.now();
    const loadDiv = document.createElement('div');
    loadDiv.className = 'bot-loading';
    loadDiv.id = id;
    loadDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    container.appendChild(loadDiv);
    return id;
}

function removeLoading(id) {
    const elem = document.getElementById(id);
    if (elem) elem.remove();
}
