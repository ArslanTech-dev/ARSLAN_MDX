/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔘 NATIVEFLOW2.JS — ARSLAN MDX · Ultra Advanced Interactive     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Command: .advflow / .nf2                                        ║
 * ║  Features: URL, Copy, Call, Quick Reply & Dropdown Menu          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { generateMessageID } from '@whiskeysockets/baileys';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

export const advflow = {
  name: 'advflow',
  aliases: ['nf2', 'ultraflow'],
  async run(ctx) {
    try {
      await ctx.react('🚀');

      // User ka naam nikaalo (agar available ho)
      const pushName = ctx.msg.pushName || 'User';

      const interactiveMessage = {
        header: {
          title: "ARSLAN MDX ULTRA",
          subtitle: "Advanced Native Flow"
        },
        body: {
          text: `Hello *${pushName}*! 👋\nWelcome to the most advanced interactive menu.\n\nNeeche diye gaye buttons aur menu ka istemal karein:`
        },
        footer: {
          text: "© POWERED BY ARSLAN TECH"
        },
        nativeFlowMessage: {
          buttons: [
            // 1. URL Button
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🌐 Join Channel",
                url: "https://whatsapp.com/channel/0029VbDu9GHB4hdY2mcGCH0u" // Apna channel link dalein
              })
            },
            // 2. Quick Reply Button
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "⚡ Ping Bot",
                id: `${CONFIG.PREFIX}ping` // Click karne par .ping trigger hoga
              })
            },
            // 3. Copy Button
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: "📋 Copy Prefix",
                copy_code: CONFIG.PREFIX
              })
            },
            // 4. Call Button
            {
              name: "cta_call",
              buttonParamsJson: JSON.stringify({
                display_text: "📞 Call Owner",
                phone_number: `+${CONFIG.OWNER_NUMBER}`
              })
            },
            // 5. Single Select Dropdown Menu (Most Advanced)
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "📜 Open Main Menu",
                sections: [
                  {
                    title: "Bot Commands",
                    highlight_label: "Popular",
                    rows: [
                      {
                        header: "🎵 Music",
                        title: "Play Song",
                        description: "Download music from Spotify/Saavn",
                        id: `${CONFIG.PREFIX}play Kesariya`
                      },
                      {
                        header: "🖼️ Stickers",
                        title: "Make Sticker",
                        description: "Convert image to sticker",
                        id: `${CONFIG.PREFIX}sticker`
                      }
                    ]
                  },
                  {
                    title: "Information",
                    rows: [
                      {
                        header: "🤖 Bot Info",
                        title: "Check Bot Details",
                        description: "Uptime, Memory and Version",
                        id: `${CONFIG.PREFIX}info`
                      }
                    ]
                  }
                ]
              })
            }
          ]
        }
      };

      // Relay Nodes
      const relayNodes = [
        {
          tag: "biz",
          attrs: {},
          content: [
            {
              tag: "interactive",
              attrs: {
                type: "native_flow",
                v: "1"
              },
              content: [
                {
                  tag: "native_flow",
                  attrs: {
                    v: "9",
                    name: "mixed"
                  }
                }
              ]
            }
          ]
        }
      ];

      const msgId = generateMessageID();

      await ctx.sock.relayMessage(ctx.from, { interactiveMessage }, {
        messageId: msgId,
        additionalNodes: relayNodes
      });

      await ctx.react('✅');
    } catch (err) {
      logger.error(`[NATIVEFLOW2] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send Ultra Flow.*\n> ╰─➤ ${err.message}`);
    }
  }
};