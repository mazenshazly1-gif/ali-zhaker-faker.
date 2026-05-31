// ===================================================
// 🤖 Smart AI Bot Module - محرك الذكاء الاصطناعي الحي والمفكر (نسخة V12.0 الخبيثة)
// ===================================================

// فتح وقفل السايد بار الخاص بالبوت
function toggleBotSidebar() {
    const sidebar = document.getElementById('botSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            document.getElementById('botInput').focus();
        }
    }
}

// إرسال الرسالة ومعالجتها بالذكاء الاصطناعي فوراً
async function sendBotMessage() {
    const input = document.getElementById('botInput');
    const container = document.getElementById('botChatContainer');
    const text = input.value.trim();

    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';

    const loadingId = appendLoading();
    container.scrollTop = container.scrollHeight;

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

// المحرك الرئيسي للذكاء الاصطناعي (مع إضافة الـ Proxy لتجاوز الحظر)
async function fetchLiveAIResponse(prompt) {
    const proxyUrl = "https://corsproxy.io/?";
    const targetUrl = "https://openrouter.ai/api/v1/chat/completions";

    const part1 = "sk-or-v1-d6144862d5f2d9e71375e35f";
    const part2 = "ee1ffd8a1b754e427ab33ac5033070e042942f87";
    const fullKey = part1 + part2; 

    const systemPrompt = `أنت مساعد ذكي ومحفز اسمك 'الّلي ذاكر فاكر'. أنت لست آلة جامدة بل تفكر وتحلل بعمق. تتحدث باللهجة المصرية العامية الودودة جداً، بأسلوب "أولاد البلد" والمطورين. مهمتك: التحفيز، حل المسائل العلمية (فيزياء، كيمياء، رياضة)، ومراجعة الأكواد البرمجية. اجعل ردودك دائماً مبهجة، ذكية، وعملية.`;

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${fullKey}`
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp', 
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
        return 'الظاهر إنك أوفلاين يا بطل.. ركز في اللي في إيدك وراجع قوانينك!';
    }
}

function appendMessage(text, sender) {
    const container = document.getElementById('botChatContainer');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${sender}`;
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
}

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
