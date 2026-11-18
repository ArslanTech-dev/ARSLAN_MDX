/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔘 NATIVEFLOW.JS — ARSLAN MDX · WhatsApp Native Flow Button     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Command: .flow                                                 ║
 * ║  Description: Sends an interactive Native Flow message with      ║
 * ║               an in-app_signup button.                           ║
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

      // 1. Message Payload (Jo tumne diya)
      const interactiveMessage = {
        header: {
          title: "ARSLAN MDX",
          subtitle: "Premium Features"
        },
        body: {
          text: "Hello! Welcome to ARSLAN MDX. Click the button below to continue."
        },
        footer: {
          text: "Powered by ARSLAN TECH"
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "inapp_signup",
              buttonParamsJson: JSON.stringify({
                // Agar koi specific data bhejna ho to yahan dalein
              })
            }
          ]
        }
      };

      // 2. Relay Nodes (WhatsApp ko batane ke liye ke ye Native Flow hai)
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

      // 3. Message ID generate karo
      const msgId = generateMessageID();

      // 4. Message send karo
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