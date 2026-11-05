/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤖 AI.JS — ARSLAN MDX Advanced AI Assistant (Clean Design)
 * ═══════════════════════════════════════════════════════════════════
 * Powered by OpenAI (GPT-4o-Mini)
 */

import axios from 'axios';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

export const ai = {
  name: 'ai',
  aliases: ['gpt', 'chat', 'bot'],
  async run(ctx) {
    const query = ctx.args.join(' ').trim();

    if (!query) {
      return ctx.reply(`> 🤖 *Usage:* ${ctx.prefix}ai <your question>\n> *Example:* ${ctx.prefix}ai What is the capital of Pakistan?`);
    }

    // Check if OpenAI Key exists
    if (!CONFIG.OPENAI_API_KEY) {
      return ctx.reply(`> ❌ *OpenAI API Key is missing.*\n> Please add it to your .env file.`);
    }

    await ctx.react('⏳');

    try {
      // 🚀 Call OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are ARSLAN MDX, an advanced AI assistant created by Arslan Tech. You respond in a helpful, friendly, and concise manner. Use Roman Urdu if the user speaks in Roman Urdu, otherwise reply in the same language as the user.' 
            },
            { 
              role: 'user', 
              content: query 
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const aiReply = response.data.choices[0].message.content.trim();

      // 🚀 Clean & Modern Design (No Box, No Context)
      const text = `> 🤖 *ARSLAN MDX AI*

> 👤 *User:* \`${query}\`
> 💬 *AI:* ${aiReply}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙰𝚁𝚂𝙻𝙰𝙽 𝙼𝙳`;

      // Send without any contextInfo (Removes View Channel)
      await ctx.reply(text);
      
      await ctx.react('✅');

    } catch (error) {
      logger.error(`[AI] Error: ${error.message}`);
      await ctx.react('❌');
      
      let errorMsg = 'Failed to get response from AI.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = 'Invalid OpenAI API Key.';
        } else if (error.response.status === 429) {
          errorMsg = 'OpenAI API rate limit reached or quota exceeded.';
        } else if (error.response.status === 500) {
          errorMsg = 'OpenAI server is down. Try again later.';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out. Please try again.';
      }

      await ctx.reply(`> ❌ *AI Error:* ${errorMsg}`);
    }
  }
};