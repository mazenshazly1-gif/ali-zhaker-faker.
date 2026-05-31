// ===================================================
// 🤖 Smart AI Bot Module - محرك الذكاء الاصطناعي الحي (النهائي V13.0)
// ===================================================

function toggleBotSidebar() {
    const sidebar = document.getElementById('botSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            document.getElementById('botInput').focus();
        }
    }
}

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
        appendMessage('معلش يا هندسة، السيرفر هنج.. جرب تسألني سؤال تاني بأسلوب مختلف!', 'bot');
    }

    container.scrollTop = container.scrollHeight;
}

// المحرك النهائي (بدون تعقيدات الـ Proxy اللي بتبوظ الـ Headers)
async function fetchLiveAIResponse(prompt) {
    const part1 = "sk-or-v1-d6144862d5f2d9e71375e35f";
    const part2 = "ee1ffd8a1b754e427ab33ac5033070e042942f87";
    const fullKey = part1 + part2; 

    // الحل الخبيث: هنستخدم خدمة وسيطة بتسمح بالـ Headers مباشرة
    const response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://openrouter.ai/api/v1/chat/completions"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fullKey}`
        },
        body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp',
            messages: [
                { role: 'system', content: 'أنت مساعد ذكي ومحفز اسمك الّلي ذاكر فاكر، تتحدث بالعامية المصرية.' },
                { role: 'user', content: prompt }
            ]
        })
    });

    const data = await response.json();
    // الرد بيجي جوه contents كـ String
    const result = JSON.parse(data.contents);
    
    if (result.choices && result.choices[0].message) {
        return result.choices[0].message.content;
    }
    throw new Error('فشل الاستجابة');
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
