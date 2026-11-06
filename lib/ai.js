import axios from 'axios';
import { CONFIG } from '../config.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DALLE_URL = 'https://api.openai.com/v1/images/generations';

export async function askGPT(prompt) {
  if (!CONFIG.OPENAI_API_KEY) throw new Error('OpenAI Key missing');
  const res = await axios.post(OPENAI_URL, {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  }, { headers: { Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}` } });
  return res.data.choices[0].message.content;
}

export async function generateImage(prompt) {
  if (!CONFIG.OPENAI_API_KEY) throw new Error('OpenAI Key missing');
  const res = await axios.post(DALLE_URL, {
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024'
  }, { headers: { Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}` } });
  return res.data.data[0].url;
}