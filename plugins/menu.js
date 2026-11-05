/**
 * ═══════════════════════════════════════════════════════════════════
 * 📜 MENU.JS — ARSLAN MDX Master Menu
 * ═══════════════════════════════════════════════════════════════════
 * Sends the menu with the logo image.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { formatUptime } from '../utils/helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

const startTime = Date.now();
const prefix = CONFIG.PREFIX || '.';

export const menu = {
  name: 'menu',
  aliases: ['help', 'commands'],
  async run(ctx) {
    await ctx.react('📜');
    
    const uptime = formatUptime(Date.now() - startTime);
    
    const text = `─❍══ ⃟ ⃟ ⃟       ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. 𝐎𝐰𝐧𝐞𝐫 : ARSLAN
┇◆┋. 𝐌𝐨𝐝𝐞 : 𝐩𝐮𝐛𝐥𝐢𝐜
┇◆┋. 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}
┇◆┋. 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 : 7.0.0 𝐁ᴇᴛᴀ
┇◆┋. 𝐑𝐮𝐧𝐭𝐢𝐦𝐞 : ${uptime}
┇◆┋. 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 : 150+
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (FLEX COMMANDS)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. flexmoney
┇◆┋. flexcar
┇◆┋. king
┇◆┋. flexbot
┇◆┋. flexsaba
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (OWNER SPECIAL)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. me
┇◆┋. attitude
┇◆┋. myquote
┇◆┋. mystatus
┇◆┋. sabalove
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (DOWNLOADER)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. tiktok
┇◆┋. tiktok2
┇◆┋. tiktok3
┇◆┋. igdl
┇◆┋. igdl2
┇◆┋. igdl3
┇◆┋. fb
┇◆┋. ytpost
┇◆┋. mediafire
┇◆┋. megadl
┇◆┋. gitclone
┇◆┋. pinterest
┇◆┋. ttmp3
┇◆┋. igmp3
┇◆┋. video
┇◆┋. capcut
┇◆┋. drama
┇◆┋. tsticker
┇◆┋. tts
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (VIRAL MEME)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. obhai
┇◆┋. paisa
┇◆┋. pawri
┇◆┋. awara
┇◆┋. tatya
┇◆┋. rasode
┇◆┋. bakchodi
┇◆┋. roast
┇◆┋. sadak
┇◆┋. rishtedar
┇◆┋. cringe
┇◆┋. react
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (AI)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. gpt
┇◆┋. chatgpt
┇◆┋. gemini
┇◆┋. claudeai
┇◆┋. deepseek
┇◆┋. codeai
┇◆┋. bot
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (GROUP)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. tagall
┇◆┋. kick
┇◆┋. promote
┇◆┋. demote
┇◆┋. hidetag
┇◆┋. tagadmins
┇◆┋. ginfo
┇◆┋. add
┇◆┋. invite
┇◆┋. link
┇◆┋. join
┇◆┋. leave
┇◆┋. mute
┇◆┋. unmute
┇◆┋. revoke
┇◆┋. poll
┇◆┋. newgc
┇◆┋. delete
┇◆┋. acceptall
┇◆┋. rejectall
┇◆┋. requests
┇◆┋. updategdesc
┇◆┋. updategname
┇◆┋. antibot
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (SETTINGS)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. welcome
┇◆┋. goodbye
┇◆┋. antilink
┇◆┋. antidelete
┇◆┋. autoread
┇◆┋. autoreact
┇◆┋. anticall
┇◆┋. autotyping
┇◆┋. online
┇◆┋. mode
┇◆┋. prefix
┇◆┋. settings
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (PSYCHIC & BRAIN)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. brainscan
┇◆┋. iqtest
┇◆┋. mindreader
┇◆┋. soulmate
┇◆┋. future
┇◆┋. aura
┇◆┋. destiny
┇◆┋. psychic
┇◆┋. personality
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (HACKER VIBE)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. whois
┇◆┋. dns
┇◆┋. phone
┇◆┋. hashcrack
┇◆┋. hack
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (LOVE — SABA × JANU)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. saba
┇◆┋. sabalove
┇◆┋. janu
┇◆┋. janulove
┇◆┋. couple
┇◆┋. romance
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (SAFE ROMANCE)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. sabakiss
┇◆┋. kiss
┇◆┋. hug
┇◆┋. cuddle
┇◆┋. pat
┇◆┋. love
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (COUPLE — ARSLAN × SABA)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. couple
┇◆┋. couplequote
┇◆┋. couplelove
┇◆┋. couplevibe
┇◆┋. lovestatus
┇◆┋. lovemeter
┇◆┋. heartbeat
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (AESTHETIC)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. aesthetic
┇◆┋. mood
┇◆┋. aestheticcolor
┇◆┋. aestheticquote
┇◆┋. aestheticwall
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (ANIMATION)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. gif
┇◆┋. randomgif
┇◆┋. neon
┇◆┋. glitch
┇◆┋. matrix
┇◆┋. typing
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (TERMUX STYLE)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. termux
┇◆┋. neofetch
┇◆┋. whoami
┇◆┋. ip
┇◆┋. cal
┇◆┋. cpuinfo
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (PROFILE — DP)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. getdp
┇◆┋. getgdp
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (MORE PLUGINS)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. sticker
┇◆┋. weather
┇◆┋. crypto
┇◆┋. lyrics
┇◆┋. translate
┇◆┋. joke
┇◆┋. fact
┇◆┋. anime
┇◆┋. movie
┇◆┋. quote
┇◆┋. reddit
┇◆┋. meme
┇◆┋. aiimage
┇◆┋. wiki
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (SYSTEM)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. vv
┇◆┋. vv2
┇◆┋. vv3
┇◆┋. block
┇◆┋. unblock
┇◆┋. pair
┇◆┋. status
┇◆┋. fullpp
┇◆┋. forward
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (UTILITY)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. uptime
┇◆┋. praytime
┇◆┋. timenow
┇◆┋. date
┇◆┋. calculate
┇◆┋. readmore
┇◆┋. report
┇◆┋. time
┇◆┋. img
┇◆┋. yts
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

╭─❍══ ⃟ ⃟ ⃟   (MAIN)   ⃟ ⃟ ⃟══⊷❍
┇◆╭┉┉┉┉┉┉┉┉┉┉━┈᛭
┇◆┋. menu
┇◆┋. help
┇◆┋. ping
┇◆┋. ping2
┇◆┋. alive
┇◆┋. owner
┇◆┋. repo
┇◆┋. githubstalk
┇◆╰┉┉┉┉┉┉┉┉┉┉┉┉┉━┈⊷
╰═══════════════════⍟

© POWERED BY ARSLAN MD`;

    try {
      if (await fs.pathExists(LOGO_PATH)) {
        await ctx.send({
          image: fs.readFileSync(LOGO_PATH),
          caption: text,
          mimetype: 'image/png'
        });
      } else {
        await ctx.reply(text);
      }
    } catch (err) {
      await ctx.reply(text);
    }
  }
};