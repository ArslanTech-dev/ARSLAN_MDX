/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔘 NATIVEFLOW.JS — ARSLAN MDX · Working Interactive Buttons     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Command: .flow                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { generateMessageID } from '@whiskeysockets/baileys';
import logger from '../utils/logger.js';

export const flow = {
  name: 'flow',
  aliases: ['button', 'native'],
  async run(ctx) {
    try {
      await ctx.react('🔘');

      // 1. Message Payload
      const interactiveMessage = {
        header: {
          title: "ARSLAN MDX",
          subtitle: "Premium Bot Features"
        },
        body: {
          text: "Hello! Welcome to ARSLAN MDX.\n\nNeeche diye gaye buttons par click karein:"
        },
        footer: {
          text: "© POWERED BY ARSLAN TECH"
        },
        nativeFlowMessage: {
          buttons: [
            // 🔗 Button 1: URL (Link kholne ke liye)
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🌐 Visit Website",
                url: "https://arslan-md.apps.bot-hosting.cloud" //   website ka link dalein
              })
            },
            // 💬 Button 2: Quick Reply (Text wapis bhejne ke liye)
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "👋 Say Hello",
                id: "hello_btn"
              })
            }
          ]
        }
      };

      // 2. Relay Nodes
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
                    name: "mixed" // 'mixed' matlab alag alag type ke buttons ek sath
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
      logger.error(`[NATIVEFLOW] Error: ${err.message}`);
      await ctx.react('❌');
      await ctx.reply(`> ❌ *Failed to send Native Flow.*\n> ╰─➤ ${err.message}`);
    }
  }
};