document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('decision-input');
    const btnSavage = document.getElementById('btn-savage');
    const btnLogical = document.getElementById('btn-logical');
    const btnExistential = document.getElementById('btn-existential');
    const feedContainer = document.getElementById('feed-container');
    const scrollTrigger = document.getElementById('scroll-trigger');

    let isTyping = false;
    let isGeneratingFeed = false;
    let currentDecision = "";
    let scrollDepth = 0;

    const modes = ['savage', 'logical', 'existential', 'consequences', 'sarcastic'];
    
    // Psychological hooks to insert
    const hooks = [
        "Still scrolling?",
        "You're not done yet.",
        "It gets worse.",
        "Let's dig a little deeper, shall we?",
        "Why do you keep looking for an answer you already know?",
        "One more thing..."
    ];

    const buttons = {
        savage: btnSavage,
        logical: btnLogical,
        existential: btnExistential
    };
    
    const originalContent = {
        savage: '<span class="icon">🔥</span> Savage',
        logical: '<span class="icon">🧠</span> Logical',
        existential: '<span class="icon">💀</span> Existential Crisis'
    };

    function setButtonsState(disabled, loadingType = null) {
        Object.keys(buttons).forEach(key => {
            const btn = buttons[key];
            btn.disabled = disabled;
            if (disabled) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                if (key === loadingType) {
                    btn.innerHTML = '<span class="icon">⏳</span> Thinking...';
                }
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.innerHTML = originalContent[key];
            }
        });
    }

    // Fallback responses
    const responses = {
        savage: ["**🔥 ERROR 404: Logic Not Found**\n\nBecause your track record of good decisions is just **flawless**, right?\n\nI could explain why this is a terrible idea, but I don't have enough processing power to comprehend that level of stupidity.\n\nSure, do it. Future you needs something to cry about to their therapist anyway."],
        logical: ["**🧠 Reconsideration Advised**\n\nBased on available data, the risk-to-reward ratio here is highly skewed towards **risk**.\n\nLet's break this down: Cost is high, probability of success is low, and long-term benefits are nonexistent.\n\nThe math simply doesn't check out. I recommend performing a cost-benefit analysis before proceeding."],
        existential: ["**💀 Into the Void**\n\nDoes it really matter? In 5 billion years the sun will expand and swallow the Earth, erasing all evidence of this **mistake**.\n\nYou are a momentary speck of consciousness in an indifferent universe. Do it or don't. The void remains unchanged.\n\nWhy do you seek validation from a machine?"],
        consequences: ["**⚠️ The Butterfly Effect**\n\nIf you do this, tomorrow you'll regret it. Next week, you'll be actively trying to fix it.\n\nIn five years, you'll still cringe at the memory right before you fall asleep.\n\nEvery action has a reaction. Yours just happen to be exclusively negative."],
        sarcastic: ["**🤡 Oh, Brilliant Idea**\n\nWow. Just... wow. I never would have thought of something so incredibly **genius**.\n\nPlease, by all means, proceed. I'll just be over here preparing the \"I told you so\" banner.\n\nIt's going to be a spectacular disaster. Can I get popcorn?"]
    };

    function getRandomResponse(type) {
        const pool = responses[type] || responses['savage'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function typeWriterEffect(element, text, speed = 15) {
        return new Promise(resolve => {
            let htmlText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            element.innerHTML = '';
            let i = 0;
            
            function type() {
                if (i <= htmlText.length) {
                    if (htmlText.charAt(i) === '<') {
                        let tagClose = htmlText.indexOf('>', i);
                        if (tagClose !== -1) {
                            i = tagClose + 1;
                        }
                    }
                    element.innerHTML = htmlText.substring(0, i) + '<span class="cursor"></span>';
                    
                    if (i < htmlText.length) {
                        i++;
                        setTimeout(type, speed + (Math.random() * 10));
                    } else {
                        element.innerHTML = htmlText;
                        resolve();
                    }
                }
            }
            type();
        });
    }

    function getIntensity(depth) {
        if (depth < 2) return "light critique";
        if (depth < 5) return "harsher and more analytical";
        if (depth < 8) return "philosophical and existential";
        return "absurd, dramatic, and intensely deeply probing";
    }

    async function generateAIResponse(input, mode, depth) {
        const apiKey = 'YOUR_API_KEY';
        
        if (apiKey === 'YOUR_API_KEY') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getRandomResponse(mode));
                }, 1000); 
            });
        }

        const intensity = getIntensity(depth);
        const prompt = `You are an AI that critiques user decisions in a brutally honest way.
User decision: "${input}"
Mode: "${mode}"
Analysis Depth: ${depth} (Intensity: ${intensity})

Rules based on mode:
If mode is "savage": Be brutally honest, sarcastic, slightly funny. Roast the user.
If mode is "logical": Break down the decision rationally. Show pros and cons, risks.
If mode is "existential": Respond in a deep, philosophical, slightly dramatic tone.
If mode is "consequences": Predict the terrible future outcomes of this decision.
If mode is "sarcastic": Be highly passive-aggressive and patronizing.

CRITICAL FORMATTING INSTRUCTIONS:
- First line MUST be a bold headline reaction using markdown.
- Then: 2-3 short paragraphs separated by a blank line.
- Add an emoji matching the tone in the headline.
- Highlight key phrases in **bold**.
- Keep the total response under 80 words. Focus on being punchy and unique. DO NOT REPEAT previous concepts.
- Do NOT wrap the response in a markdown code block.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            }
            return "Error: Could not generate a response. The void remains silent.";
        } catch (error) {
            console.error("API Error:", error);
            return "Error: Connection failed. You're on your own.";
        }
    }

    const labels = {
        savage: "Savage Analysis",
        logical: "Logical Breakdown",
        existential: "Existential Crisis",
        consequences: "Future Consequences",
        sarcastic: "Sarcastic Commentary"
    };

    async function appendNewCard(mode) {
        isTyping = true;
        scrollDepth++;
        
        // Visual escalation
        const darkness = Math.min(scrollDepth * 0.05, 0.85);
        document.body.style.setProperty('--bg-darkness', darkness);

        // Occasional Hooks or Fake Footers
        if (scrollDepth > 1 && scrollDepth % 3 === 0) {
            const hookText = hooks[Math.floor(Math.random() * hooks.length)];
            const hookEl = document.createElement('div');
            hookEl.className = 'hook-message';
            hookEl.innerText = hookText;
            feedContainer.appendChild(hookEl);
        } else if (scrollDepth > 2 && scrollDepth % 5 === 0) {
            const footerEl = document.createElement('div');
            footerEl.className = 'fake-footer';
            footerEl.innerText = "— End of Analysis —";
            feedContainer.appendChild(footerEl);
            // wait a bit for effect
            await new Promise(r => setTimeout(r, 1500));
        }

        const card = document.createElement('section');
        card.className = `response-section glass theme-${mode} visible`;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        card.innerHTML = `
            <div class="response-header">
                <div class="status-dot"></div>
                <span class="response-type">${labels[mode]} (Depth Level ${scrollDepth})</span>
            </div>
            <div class="response-content">
                <!-- Content will type here -->
            </div>
        `;
        
        feedContainer.appendChild(card);
        
        // Trigger reflow for animation
        void card.offsetWidth;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';

        // Scroll slightly to show new card is coming
        card.scrollIntoView({ behavior: 'smooth', block: 'end' });

        const contentEl = card.querySelector('.response-content');
        const reply = await generateAIResponse(currentDecision, mode, scrollDepth);

        await typeWriterEffect(contentEl, reply);
        
        isTyping = false;
        
        // Re-enable observer trigger if we aren't near bottom
        if (isGeneratingFeed) {
            scrollTrigger.classList.remove('hidden');
            scrollTrigger.classList.add('visible');
        }
    }

    async function handleAction(initialMode) {
        const decision = inputField.value.trim();
        if (!decision) {
            inputField.style.borderColor = '#ff4500';
            setTimeout(() => { inputField.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }, 500);
            return;
        }

        if (isTyping) return;
        
        // Start new session
        currentDecision = decision;
        scrollDepth = 0;
        isGeneratingFeed = true;
        feedContainer.innerHTML = '';
        document.body.style.setProperty('--bg-darkness', '0');
        
        setButtonsState(true, initialMode);
        scrollTrigger.classList.remove('hidden');
        scrollTrigger.classList.add('visible');

        await appendNewCard(initialMode);
        
        setButtonsState(false);
    }

    // Infinite Scroll Logic
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && isGeneratingFeed && !isTyping) {
            scrollTrigger.classList.remove('visible');
            scrollTrigger.classList.add('hidden');
            
            // Choose next mode
            const nextMode = modes[scrollDepth % modes.length];
            // Small delay for realism
            setTimeout(() => {
                appendNewCard(nextMode);
            }, 500);
        }
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    observer.observe(scrollTrigger);

    btnSavage.addEventListener('click', () => handleAction('savage'));
    btnLogical.addEventListener('click', () => handleAction('logical'));
    btnExistential.addEventListener('click', () => handleAction('existential'));
    
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAction('savage');
        }
    });
    
    document.querySelectorAll('.example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.textContent.replace(/^"|"$/g, '');
            inputField.value = text;
            handleAction('savage');
        });
    });
});
