import axios from 'axios';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DALLE_URL = 'https://api.openai.com/v1/images/generations';
const GROK_URL = 'https://api.x.ai/v1/chat/completions';

const getKey = (keyName) => CONFIG[keyName] || process.env[keyName];

// ═══════════════════════════════════════════════════════════════════
// 🧠 TEXT GENERATION (OpenAI -> Grok -> Pollinations)
// ═══════════════════════════════════════════════════════════════════
export async function askGPT(prompt) {
    const systemPrompt = `You are "ARSLAN MDX AI", a smart assistant created by Arslan Tech. Answer briefly in Roman Urdu or English. Use emojis.`;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
    ];

    // 1. Try OpenAI
    const openAiKey = getKey('OPENAI_API_KEY');
    if (openAiKey) {
        try {
            const res = await axios.post(OPENAI_URL, {
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 800
            }, { headers: { Authorization: `Bearer ${openAiKey}` }, timeout: 15000 });
            if (res.data?.choices?.[0]?.message?.content) {
                return res.data.choices[0].message.content;
            }
        } catch (e) {
            logger.warn(`[AI] OpenAI failed: ${e.message}. Trying Grok...`);
        }
    }

    // 2. Try Grok
    const grokKey = getKey('GROK_API_KEY');
    if (grokKey) {
        try {
            const res = await axios.post(GROK_URL, {
                model: 'grok-beta',
                messages: messages,
                max_tokens: 800
            }, { headers: { Authorization: `Bearer ${grokKey}` }, timeout: 15000 });
            if (res.data?.choices?.[0]?.message?.content) {
                return res.data.choices[0].message.content;
            }
        } catch (e) {
            logger.warn(`[AI] Grok failed: ${e.message}. Switching to Pollinations...`);
        }
    }

    // 3. Fallback to Pollinations (Free)
    try {
        const res = await axios.post('https://text.pollinations.ai/openai', {
            model: 'openai',
            messages: messages
        }, { timeout: 20000 });
        if (res.data?.choices?.[0]?.message?.content) {
            return res.data.choices[0].message.content;
        }
    } catch (e) {
        logger.error(`[AI] All AI engines failed: ${e.message}`);
    }

    throw new Error('AI servers are currently busy. Please try again later.');
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 IMAGE GENERATION (DALL-E -> Pollinations Free Image)
// ═══════════════════════════════════════════════════════════════════
export async function generateImage(prompt) {
    const openAiKey = getKey('OPENAI_API_KEY');

    // 1. Try DALL-E 3 (If Key exists)
    if (openAiKey) {
        try {
            const res = await axios.post(DALLE_URL, {
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1024x1024'
            }, { headers: { Authorization: `Bearer ${openAiKey}` }, timeout: 30000 });
            if (res.data?.data?.[0]?.url) {
                return res.data.data[0].url;
            }
        } catch (e) {
            logger.warn(`[AI IMAGE] DALL-E failed: ${e.message}. Switching to Free API...`);
        }
    }

    // 2. Fallback: Pollinations Free Image API (No Key Required)
    // Ye direct image URL return karta hai jo WhatsApp easily load kar leta hai
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
}