/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  😈 INSULT.JS — ARSLAN MDX · SAVAGE ROAST ENGINE (v3 — Nuclear) ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Commands (7): insult · roast · selfroast · compliment ·         ║
 * ║                taunt · savage · duel                             ║
 * ║                                                                  ║
 * ║  👥 Group : @mention ya reply karke target                      ║
 * ║  💬 DM    : jis se chat hai usi pe fire (duel sirf group mein)   ║
 * ║  🛡️ Bot/Owner target → UNO REVERSE (dono haath bandh)           ║
 * ║  💥 Damage meter + 🔥 Combo counter + 💀 Critical hits           ║
 * ║                                                                  ║
 * ║  ⚠️  Disclaimer: Wit aur sarcasm — gaali, family, shakal,         ║
 * ║      mazhab, zaat — kuch nahi. Sirf dimaag pe chot. 🎯           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { normalizeMessageContent } from '@whiskeysockets/baileys';
import { CONFIG } from '../config.js';
import logger from '../utils/logger.js';

// ══════════════════════════════════════════════════════════════════
//  📚  CONTENT POOLS  —  (sharper, shorter, deadlier)
// ══════════════════════════════════════════════════════════════════

const INSULTS = [
  'Tumhari speed dekh ke 2G ne "retire" kar liya 📶',
  'Tumhare dimaag ka RAM 2 MB, aur usme bhi antivirus chal raha hai 🧠',
  'Tum wo ho jo "loading..." pe atak gaya, aur 3 saal se wahi khada hai ⏳',
  'Tumhari akal ka WiFi password bhi bhool gaya — connect hona to door ki baat 🔐',
  'Tum wo notification ho jo sabse pehle "clear" hoti hai 🔕',
  'Tumhari planning itni kharab hai ke GPS ne Google Maps se resignation de di 🗺️',
  'Tum wo ho jis ki "last seen" pe bhi sawaal uth jaate hain 👻',
  'Tumhari logic pe PhD karni ho to "404 — logic not found" milta hai 🎓',
  'Tum itne slow ho ke tumhara reflection bhi aage nikal jaata hai 🪞',
  'Tum wo ho jise "wake up" alarm ne bhi block kar diya ⏰',
  'Tumhari opinion ki speed dial-up internet se bhi slow hai 📞',
  'Tum itne bhulakkar ho ke apna password bhi "forgot password" se reset karte ho 🔑',
  'Tumhari zindagi ka motto: "Kal se pakka" — aur kal kabhi nahi aata 📅',
  'Tum wo ho jis ke ideas pe WiFi bhi "no internet" bol deta hai 🌐',
  'Tumhare jokes pe hasta kaun hai? Bata, uska number do, usay bhi therapy chahiye 😬',
  'Tumhari fitness ka peak: remote uthana bhi "workout" lagta hai 🛋️',
  'Tum wo ho jo "seen" karke reply ka sochta reh jaata hai, aur bhool jaata hai 👀',
  'Tumhari akal ne "error 500" de diya — internal server hi down hai 💻',
  'Tum itne unlucky ho ke tumhare "good luck" message bhi fail ho jaate hain 🍀',
  'Tum wo ho jis ke status pe views bhi "seen" kar ke chup chap nikal jaate hain 👀',
  'Tumhare paas itna time hai ke calendar bhi tumse poochta hai "aaj kya hai?" 🗓️',
  'Tumhari baaton mein dum nahi, bas "hmm" aur "acha" hai 😴',
  'Tum wo ho jise "bekaar" word ne bhi reject kar diya 🚮',
  'Tumhari driving dekh ke traffic light ne bhi "red" pe "pause" kaha 🚦',
  'Tum itne predictable ho ke suspense movie mein bhi tum pehle guess ho jate ho 🎬',
  'Tumhara dimaag airplane mode pe rehta hai — 24/7 ✈️',
  'Tum wo ho jis ke jokes pe "lol" bhi tapak ke girta hai 😂',
  'Tumhari memory RAM jaisi hai — restart pe sab gayab 🔄',
  'Tum itne ajeeb ho ke autocorrect bhi tumhara message dekh ke haar maan leta hai ⌨️',
  'Tumhare decisions pe coin flip bhi bolta hai "bhai, main nahi" 🪙',
  'Tumhari "5 minute" ka matlab duniya ke kisi calendar mein nahi likha 🕐',
  'Tum wo ho jis ki typing speed dekh ke keyboard ne "sue" kar di ⌨️',
  'Tumhari energy 1% pe — aur charger bhi kisi aur ka hai 🔋',
  'Tum itne simple ho ke Google tumhe "did you mean: kuch aur?" bolta hai 🔍',
  'Tum wo ho jise "overthinking" bhi kehta hai — "bhai zyada ho gaya, chill" 🌀',
];

const ROASTS = [
  'Tum itne slow ho ke tumhare shadow ne bhi "move on" kar liya 🐌\nAur tum abhi bhi wahi khade ho, soch rahe ho "kya hua?"',
  'Tumhari life ka WiFi full signal pe hai 📶\nProblem: connect karne wala koi nahi.',
  'Tum wo ho jis ki "to-do list" mein sirf ek item hai: *"to-do list banana"* 📝\nAur wo bhi pending hai.',
  'Tumhari akal ka OS update kab se pending hai? 🖥️\nError: "Not enough storage. Delete kuch." — par delete kya karein?',
  'Tum wo hero ho jis ki movie ka trailer 30 seconds, picture 3 hours, aur interval dono ke beech mein 🎬\nAur phir bhi koi na aaya.',
  'Tumhari zindagi ka plan: kal se shuru 🗓️\nKal ka plan: parso se shuru.\nParso ka plan: *pending approval*',
  'Tumhare ideas ke aage Nobel committee ne "no comment" bola 🏅\nAur Einstein ne kaha: "Main chalta hoon, tum ruk jao."',
  'Tumhari confidence 100% hai, results 0% 💯\nBaaki 100 kahan gaya? "Marketing" mein ud gaya.',
  'Tum wo ho jo gym join karta hai selfie ke liye 🏋️\n3 din baad "back pain" ka bahana — 4th din "leg day" — 5th din *ghayab* 👻',
  'Tumhari baaton ka asar: sunne wala "hmm" bol ke phone side pe rakh deta hai 📱\nAur wo tumhare mood ka nahi, apne battery ka soch raha hota hai.',
  'Tum wo ho jo "main busy hoon" bolta hai, aur online shopping karta rehta hai 🛒\nAur boss ko lagta hai kaam kar raha hai.',
  'Tumhari life ka best decision: abhi tak kiya nahi 🤔\nIsi liye to "life" aisi chal rahi hai.',
  'Tum wo ho jise dekh ke "achhe din" bhi bolte hain: "Main nahi aa raha" ☀️\nAur "bure din" bhi: *"main hi hoon"*',
  'Tumhari planning mein 3 backup plans hote hain 🧠\nTeeno fail.\nFourth plan: *"dekha jayega"* — aur woh bhi kaam nahi karta.',
  'Tum wo ho jo "kal se" diet shuru karta hai 🥗\nAur kal "cheat day" hota hai.\nAur phir "kal se" phir aata hai.',
  'Tumhari personality ka rang: beige 🎨\nNa garam, na thanda — bas *"jo tum kaho"*.',
  'Tum wo ho jis ka "swag" sirf caption mein hai 😎\nReal life mein default Windows XP wallpaper lagta hai.',
  'Tumhare jokes ka copyright us zamane ka hai jab internet bhi nahi tha 😂\nAur purane WiFi ne bhi sun kar "no comment" bol diya.',
  'Tumhari memory itni achi hai ke tum bhool jate ho ke *kya bhoolna tha* 🧠\nAur ye bhoolna bhi bhool jate ho.',
  'Tum wo ho jo "5 minute mein aata hoon" bolta hai 🕐\nAur 5 minute ke liye 5 din lagta hai.\nPhir bolta hai: *"Traffic tha"* — raat 2 baje.',
  'Tumhari social life airplane mode pe hai ✈️\nSirf "WiFi connect" ke waqt on hoti hai — aur woh bhi *"wrong password"*',
  'Tum wo ho jise dekh ke "motivation" speakers ne bhi career change kar liya 🎤\nAb woh "how to avoid people like you" pe talks dete hain.',
  'Tumhari zindagi ka sab se bada achievement: "maine aaj alarm band nahi kiya" ⏰\nBaaki sab? *Same as yesterday.*',
  'Tum wo ho jo "acha larka/achi larki" banne ki koshish mein *acha* bhi kho deta hai 🎭\nAur *bura* bhi nahi ban pata.\nBas "theek hai" ban ke reh jata hai.',
  'Tumhari personality ek default ringtone jaisi hai 📞\nSabne suni hui hai, koi pasand nahi karta, koi band bhi nahi karta.',
  'Tum wo ho jis ki "success story" sirf WhatsApp status tak hai 📱\n24 ghante baad delete.\nBaaki life? *Same as before.*',
  'Tumhari akal ko "offline mode" mein bhi "last seen 3 saal pehle" dikhta hai 🕰️\nKyunke *last seen working = never.*',
  'Tum wo ho jo "growth" ka lecture deta hai, aur khud Instagram scroll karta hai 📜\nAur "scroll" ko *research* kehta hai.',
  'Tumhari life ek "pending transaction" hai 💳\nAmount: potential. Status: *frozen since birth.*',
  'Tum wo ho jis ke "2 minutes" ka matlab Google Calendar ne bhi refuse kar diya 🗓️\nKyunke 2 minutes *2 saal* ban jate hain.',
  'Tumhari "smartness" sirf battery saver mode mein active hoti hai 🔋\nAur woh bhi *10% pe* — jab phone marne wala ho.',
];

const SAVAGE = [
  '💀 *NUCLEAR HIT*\nTum wo ho jise dekh ke "success" ne bola: "Bhai, main kisi aur ko dhoondta hoon."',
  '☢️ *FATALITY*\nTumhari akal pe patent chahiye — duniya ki pehli *zero-calorie brain.*',
  '🔥 *BURNT TO CRISP*\nTum wo ho jis ke baare mein Google bhi bolta hai: *"Koi relevant result nahi mila."*',
  '⚡ *SHOCK*\nTumhari life ka WiFi full, password bhi sahi — bas *koi connect nahi karna chahta.*',
  '💀 *DEATH BLOW*\nTum wo ho jise dekh ke "effort" ne resignation de di — *"main yahan bekaar hoon."*',
  '☢️ *CLEAN SWEEP*\nTumhari zindagi mein sab kuch hai — *except* talent, akal, aur timing.',
  '🔥 *CRITICAL*\nTumhari soch ka level: WhatsApp status. Depth: 2 lines. Impact: *zero.*',
  '⚡ *SAVAGE*\nTum wo ho jo "smart work" ka lecture deta hai — aur *kaam* bhi nahi karta.',
  '💀 *OBLITERATED*\nTumhari personality "WiFi free trial" jaisi hai — 7 din, phir *expired.*',
  '☢️ *ANNIHILATED*\nTum wo ho jis ke baare mein teachers bhi kehte hain: *"Bachay ne try kiya, bas."*',
  '🔥 *MELTDOWN*\nTumhari akal 2G pe hai, aur *tower bhi gaon mein hai.*',
  '⚡ *THUNDER*\nTum wo ho jo "kal se serious" hota hai — *kal kabhi aata hi nahi.*',
  '💀 *CASKET CLOSED*\nTumhari growth graph dekha? *Flatline* — aur woh bhi *downward.*',
  '☢️ *RADIATION*\nTumhari baaton ka asar: samne wale ka *WiFi bhi disconnect ho jata hai.*',
  '🔥 *SCORCHED*\nTum wo ho jise dekh ke "overthinking" ne bola: *"Bhai, mujhe bhi sikhade."*',
];

const COMPLIMENTS = [
  'Tum wo ho jis ke aane se group ki raunaq barh jati hai 🌟',
  'Tumhari smile se din ban jata hai, sach mein 😊',
  'Tum itne helpful ho ke Google bhi tumse sawaal poochne aata hai 🧠',
  'Tumhari dosti ek khazana hai, bas ye mat batana kisi ko 💎',
  'Tumhari soch itni achi hai ke ideas khud tumhare paas aate hain 💡',
  'Tum wo ho jo har mehfil ki jaan hai 🎉',
  'Tumhari mehnat dekh kar motivation bhi motivate ho jata hai 💪',
  'Tum itne sacche ho ke sach bhi tumse seekhne aata hai 🌹',
  'Tumhari baat mein wazan hai — jaise sone ki 🥇',
  'Tum wo ho jis ke saath waqt guzarna ek tohfa hai 🎁',
  'Tumhari awaaz mein sukoon hai, jaise baarish ke baad ki mitti 🌧️',
  'Tum itne kamaal ho ke tareef karte karte lafz kam par jate hain ✨',
  'Tumhari hansi sab ka bojh halka kar deti hai 😄',
  'Tum wo ho jis par bharosa karna aasaan hai 🤝',
  'Tumhari simplicity hi tumhari sab se badi khoobsurti hai 🌸',
  'Tum itne mehraban ho ke dua bhi tumhare liye khud nikalti hai 🤲',
  'Tumhari energy dekh kar solar panel bhi hairan hai ☀️',
  'Tum wo star ho jo din mein bhi chamakta hai 🌠',
  'Tumhari soch ka level: High, aur network: *full* 📶',
  'Tum wo ho jis ki wajah se group mein rounaq hai 🔥',
  'Tum jaisa dost qismat walon ko milta hai 🍀',
  'Tum wo ho jo mushkil waqt mein sab se pehle yaad aata hai 🫶',
  'Tumhari parhai, tumhari mehnat, tumhara swag: *sab top class* 🏆',
  'Tum itne acche ho ke bura bolne ka dil hi nahi karta 😇',
  'Tum wo ho jis se mil ke lagta hai: *"duniya abhi bhi achi hai"* 🌍',
];

const TAUNTS = [
  'Waah ji waah! Aaj to bohot "busy" lag rahe ho... *group mein* 😏',
  'Achha? Aap itne samajhdar ho? Pehle bataya hota, hum *seekh lete* 🙄',
  'Aaj kal to bohot bade log ho gaye ho — *"seen"* bhi mehnga ho gaya? 👑',
  'Kya baat hai sahib — sunte ho to sirf wahi jo *tumhe pasand ho* 🎧',
  'Hum to samajhte thay tum sust ho — tum to *professional* nikle 🏅',
  'Aap jaisa expert hota to duniya ka kaam hi khatam ho jata 🌍',
  'Bhai tum to *"ghalti se bhi sahi nahi"* ke champion ho 🏆',
  'Waqt ka khayal rakho — tumhari ghari mein *25 ghante* lagte hain ⌚',
  'Kuch to log kahenge — magar tum *sun hi nahi rahe* 🙉',
  'Hum to sirf soch rahe thay — tum ne to sach mein kar dikhaya... *ulta* 😂',
  'Bohot khoob! Aaj ka *"Idea of the Day"* award aap ko jata hai 🏅',
  'Aap ki is *"samajhdaari"* par to taaliyan banti hain 👏',
  'Thori si akal bhi saath le aate to maza aa jata 🧠',
  'Aap ke aane se pehle group thora zyada shaant tha... aur *sakoon se* 🙃',
  'Tum itne *"important"* ho ke tumhe sab bhool jate hain 😅',
  'Aap ka confidence kamaal hai — kaash *result* bhi hota 📉',
  'Aap ne to sab ko hairan kar diya... ke itni der se *kya kar rahe thay* 🤔',
  'Kya andaaz hai! Zimmedaari se *bhaag* kar kamyabi tak pohanchne ka 🏃',
  'Aaj to sab theek hai — kal se phir wahi tumhari purani *"intezaar"* wali baat ⏳',
  'Kuch logon ki tareef nahi hoti — sirf *shukr* kiya jata hai... ke door hain 🙏',
  'Aap ko dekh ke lagta hai *"kaam"* bhi tumse door bhaagta hai 🏃‍♂️',
  'Aap ki *"mehnat"* ka result: *"chalta hai"* — bas *chalta hi rehta hai* 🚶',
  'Tum wo ho jo *"good news"* bhi suna de to log *"acha, acha"* bol ke nikal jate hain 📰',
  'Aap ka *"expertise"*: 5 minute ka YouTube tutorial, 5 minute ka *"expert"* 🎓',
  'Bohot achha! Aap ki *"leadership"* dekh ke team ne *"resign"* ka soch liya 👥',
];

const REVERSE_INTROS = [
  '↩️ *UNO REVERSE!* Bot ya malik par try? Ulta tum par 😎',
  '🛡️ *Shield Active!* Bot ya malik ko roast karne chale thay? Pehle *khud* ko dekho 😏',
  '🔁 *Reverse Card!* Ye cmd bot pe nahi chalti — ab *tum* bhugto 😄',
  '⚡ *DEFLECTED!* Tum ne socha bot ko burn karoge? *Plot twist* — tum khud burn ho rahe ho 🔥',
  '🎯 *HEADSHOT — TUM PE!* Bot ka aim tumhari taraf mura, aur *tum* gir gaye 💀',
  '🪞 *MIRROR MODE!* Bot pe roast? Ye mirror hai — ab *tumhari* baari aayi 😏',
  '🧨 *BACKFIRE!* Bot pe attack? Ye *bumerang* hai — wapas tumhare paas aaya 💥',
  '🛑 *ACCESS DENIED!* Bot aur malik *protected zone* hain — tum *open field* mein ho 🎯',
];

// ══════════════════════════════════════════════════════════════════
//  🧠  HELPERS
// ══════════════════════════════════════════════════════════════════

const lastPick = new Map();
function pick(name, pool) {
  let i = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && i === lastPick.get(name)) i = (i + 1) % pool.length;
  lastPick.set(name, i);
  return pool[i];
}

const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

// 🙋 Cmd dene wala kaun? (DM mein linked number khud likhe to ctx.sender chat wala dost hota hai,
// isliye us case mein bot ka apna number use karte hain)
function requesterJid(ctx) {
  if (!ctx.isGroup && ctx.msg?.key?.fromMe === true && digits(ctx.botNumber)) {
    return `${digits(ctx.botNumber)}@s.whatsapp.net`;
  }
  return ctx.sender;
}

// 🎯 Target dhoondo: @mention → reply wala → DM partner
function getTarget(ctx) {
  try {
    const content = normalizeMessageContent(ctx.msg?.message) || ctx.msg?.message || {};
    const info = Object.values(content)
      .find((v) => v && typeof v === 'object' && v.contextInfo)?.contextInfo;
    const mentioned = info?.mentionedJid?.[0];
    if (mentioned) return mentioned;
    if (info?.quotedMessage && info.participant) return info.participant;
  } catch (err) {
    logger.error(`[INSULT] target parse failed: ${err.message}`);
  }
  if (!ctx.isGroup) return ctx.from;
  return null;
}

// 🛡️ Bot ya owner protect zone?
function isProtected(ctx, targetJid) {
  const t = digits(targetJid);
  const requesterIsAdminSide = ctx.msg?.key?.fromMe === true || ctx.isOwner;
  if (requesterIsAdminSide) return false;
  return t === digits(ctx.botNumber) || t === digits(CONFIG.OWNER_NUMBER);
}

// ⏱️ Cooldown (3s per user)
const cooldown = new Map();
function onCooldown(ctx) {
  const key = digits(requesterJid(ctx)) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 3000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// 💥 Burn tracker (combo counter)
const burnCounts = new Map();
const BURN_WINDOW_MS = 10 * 60 * 1000; // 10 min window

function trackBurn(targetJid) {
  const key = digits(targetJid);
  const now = Date.now();
  const entry = burnCounts.get(key) || { count: 0, lastTs: 0 };
  if (now - entry.lastTs > BURN_WINDOW_MS) entry.count = 0;
  entry.count += 1;
  entry.lastTs = now;
  burnCounts.set(key, entry);
  if (burnCounts.size > 500) burnCounts.delete(burnCounts.keys().next().value); // memory cap
  return entry.count;
}

// 💥 Damage meter (60–99%)
function rollDamage() {
  return Math.floor(Math.random() * 40) + 60;
}

// 🔥 Combo badge
function comboBadge(count) {
  if (count >= 5) return `\n\n💀 *CRITICAL HIT* — ${count}x BURNED IN A ROW!`;
  if (count === 4) return `\n\n☢️ *COMBO x${count}* — insaan jal raha hai 🔥`;
  if (count === 3) return `\n\n🔥 *COMBO x3* — triple whammy!`;
  if (count === 2) return `\n\n⚡ *COMBO x2* — double tap!`;
  return '';
}

// 📝 Final message builder
function format(ctx, emoji, title, targetJid, body, { nice = false, damage = null, combo = 0 } = {}) {
  const tag = ctx.isGroup && targetJid ? `@${digits(targetJid)}\n` : '';
  const note = nice ? '' : '_Mazaq hai, dil pe mat lena_ 😄\n';
  const dmgLine = damage ? `💥 *Damage:* ${damage}%\n` : '';
  const comboLine = comboBadge(combo);
  return (
    `${emoji} *${title}*\n\n` +
    `${tag}${body}` +
    `${comboLine}\n\n` +
    `${dmgLine}` +
    `${note}` +
    `> © Powered by ARSLAN MD`
  );
}

// 🛡️ UNO REVERSE — bot/owner par try karne wale par roast ulta
async function sendReverse(ctx) {
  const intro = pick('reverse', REVERSE_INTROS);
  const mine = requesterJid(ctx);
  const burn = pick('roast', ROASTS);
  const dmg = rollDamage();
  const combo = trackBurn(mine);
  const body =
    `${intro}\n\n` +
    `${ctx.isGroup ? `@${digits(mine)}\n` : ''}${burn}` +
    `${comboBadge(combo)}\n\n` +
    `💥 *Damage:* ${dmg}%\n\n` +
    `> © Powered by ARSLAN MD`;
  return ctx.reply(`😈 *UNO REVERSE*\n\n${body}`, { mentions: [mine] });
}

// ══════════════════════════════════════════════════════════════════
//  🏭  COMMAND FACTORY
// ══════════════════════════════════════════════════════════════════

function createFunCommand({
  name, aliases, emoji, title,
  pool,
  needsTarget = true,
  selfOnly = false,
}) {
  return {
    name,
    aliases,
    async run(ctx) {
      let target = selfOnly ? requesterJid(ctx) : getTarget(ctx);

      // Group mein target nahi mila
      if (!target && needsTarget) {
        if (name === 'compliment') {
          target = requesterJid(ctx);
        } else {
          return ctx.reply(
            `${emoji} *${title}*\n\n` +
            `Kisi ko *@mention* karo ya uske message ko reply karke *${ctx.prefix}${name}* likho.\n` +
            `Khud ko roast karna ho to: *${ctx.prefix}selfroast*\n` +
            `Nuclear mode: *${ctx.prefix}savage @user*`
          );
        }
      }

      if (onCooldown(ctx)) return;

      try {
        await ctx.react(emoji);

        // 🛡️ Bot / owner ko target kiya → UNO REVERSE
        if (name !== 'compliment' && !selfOnly && isProtected(ctx, target)) {
          return await sendReverse(ctx);
        }

        const body = pick(name, pool);

        // 💥 Non-compliment pe damage meter + combo counter
        const isBurn = !['compliment'].includes(name);
        const damage = isBurn ? rollDamage() : null;
        const combo = isBurn && target ? trackBurn(target) : 0;

        const text = format(ctx, emoji, title, target, body, {
          nice: name === 'compliment',
          damage,
          combo,
        });

        await ctx.reply(text, { mentions: target ? [target] : [] });
      } catch (err) {
        logger.error(`[INSULT] ${name} failed: ${err.message}`);
      }
    }
  };
}

// ══════════════════════════════════════════════════════════════════
//  📦  COMMANDS
// ══════════════════════════════════════════════════════════════════

export const insult = createFunCommand({
  name: 'insult',
  aliases: ['beizzati', 'burn'],
  emoji: '😈',
  title: 'INSULT',
  pool: INSULTS,
});

export const roast = createFunCommand({
  name: 'roast',
  aliases: ['bhunai', 'burnroast'],
  emoji: '🔥',
  title: 'ROAST',
  pool: ROASTS,
});

export const selfroast = createFunCommand({
  name: 'selfroast',
  aliases: ['roastme'],
  emoji: '🪞',
  title: 'SELF ROAST',
  pool: ROASTS,
  selfOnly: true,
});

export const compliment = createFunCommand({
  name: 'compliment',
  aliases: ['tareef'],
  emoji: '💖',
  title: 'COMPLIMENT',
  pool: COMPLIMENTS,
});

export const taunt = createFunCommand({
  name: 'taunt',
  aliases: ['taana'],
  emoji: '😏',
  title: 'TAUNT',
  pool: TAUNTS,
});

// 🔥 NEW — Nuclear mode
export const savage = createFunCommand({
  name: 'savage',
  aliases: ['nuke', 'destroy'],
  emoji: '☢️',
  title: 'SAVAGE MODE',
  pool: SAVAGE,
});

// ⚔️ NEW — Duel (dono taraf roast) — sirf group mein
export const duel = {
  name: 'duel',
  aliases: ['battle', '1v1'],
  async run(ctx) {
    if (!ctx.isGroup) {
      return ctx.reply(
        `⚔️ *DUEL*\n\n` +
        `Duel sirf *group* mein chalta hai — muqabale ke liye do log chahiye 😄\n` +
        `DM mein *${ctx.prefix}roast* ya *${ctx.prefix}savage* use karo.`
      );
    }

    const target = getTarget(ctx);
    if (!target) {
      return ctx.reply(
        `⚔️ *DUEL*\n\n` +
        `Kisi ko *@mention* karo ya reply karke *${ctx.prefix}duel* likho.\n` +
        `Dono ko ek saath roast milega 🔥`
      );
    }

    const mine = requesterJid(ctx);
    if (digits(target) === digits(mine)) {
      return ctx.reply(`⚔️ *DUEL*\n\nKhud se duel? Iske liye *${ctx.prefix}selfroast* hai 😄`);
    }

    if (onCooldown(ctx)) return;

    try {
      await ctx.react('⚔️');

      // 🛡️ Bot / owner ke saath duel nahi → UNO REVERSE
      if (isProtected(ctx, target)) return await sendReverse(ctx);

      const myRoast = pick('savage', SAVAGE);
      const theirRoast = pick('savage', SAVAGE);

      const body =
        `⚔️ *ROAST DUEL*\n\n` +
        `👤 *@${digits(mine)}* ko:\n> ${theirRoast}\n\n` +
        `🎯 *@${digits(target)}* ko:\n> ${myRoast}\n\n` +
        `──────────────\n` +
        `💥 *Winner:* Audience 😂\n` +
        `💀 *Loser:* Dono\n\n` +
        `> © Powered by ARSLAN MD`;

      await ctx.reply(body, { mentions: [mine, target] });
      await ctx.react('🔥');
    } catch (err) {
      logger.error(`[INSULT] duel failed: ${err.message}`);
    }
  },
};
