/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎵 SPOTIFY.JS — ARSLAN MDX · Spotify Data & Lyrics Fetcher      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  API: Sportify API by Casper Tech (No Key Required)              ║
 * ║  Commands: spotify (sp), lyrics                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import axios from 'axios';
import logger from '../utils/logger.js';

const API_BASE = 'https://sportify.xcasper.space/api';

// ═══════════════════════════════════════════════════════════════════
// 🔤 BOLD SERIF FONT
// ═══════════════════════════════════════════════════════════════════
const BOLD = {
  '0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗',
  'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
  'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
  'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
  'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
  'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
  'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳',
};
const bold = (s) => String(s).replace(/[0-9A-Za-z]/g, (c) => BOLD[c] || c);

// ═══════════════════════════════════════════════════════════════════
// ⏱️ COOLDOWN (5s per user)
// ═══════════════════════════════════════════════════════════════════
const cooldown = new Map();
const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
function onCooldown(ctx) {
  const key = digits(ctx.sender) || ctx.from;
  const now = Date.now();
  if (now - (cooldown.get(key) || 0) < 5000) return true;
  cooldown.set(key, now);
  if (cooldown.size > 500) cooldown.delete(cooldown.keys().next().value);
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// 🎵 HELPER: Search Track
// ═══════════════════════════════════════════════════════════════════
async function searchSpotifyTrack(query) {
    const res = await axios.get(`${API_BASE}/search`, {
        params: { q: query, type: 'track', limit: 1 },
        timeout: 15000
    });
    
    if (res.data?.success && res.data?.track) {
        return res.data.track;
    }
    // Fallback if the API returns an array under a different key
    if (res.data?.tracks?.items?.length > 0) {
        return res.data.tracks.items[0];
    }
    throw new Error('No results found on Spotify.');
}

// ═══════════════════════════════════════════════════════════════════
// 1. SPOTIFY (.sp) — Song Info + 30s Preview + Lyrics
// ═══════════════════════════════════════════════════════════════════
export const spotify = {
    name: 'spotify',
    aliases: ['sp', 'spot'],
    async run(ctx) {
        let query = ctx.args.join(' ').trim();
        if (!query) return ctx.reply(`> 🎵 *${bold('USAGE')}*\n> ╰─➤ \`.spotify <song name>\``);

        if (onCooldown(ctx)) return;
        try { await ctx.react('🎵'); } catch {}

        let waitMsg;
        try {
            waitMsg = await ctx.reply(`> 🎵 *${bold('SPOTIFY SEARCH')}*\n> ╰─➤ \`${query}...\``);
        } catch (e) {}

        try {
            const track = await searchSpotifyTrack(query);
            
            // Extract details
            const title = track.name || track.title || 'Unknown';
            const artist = track.artists?.map(a => a.name).join(', ') || track.artist || 'Unknown';
            const album = track.album?.name || track.album || 'Unknown';
            const cover = track.album?.images?.[0]?.url || track.thumbnail || null;
            const previewUrl = track.preview_url || track.preview || null;
            const spotifyUrl = track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`;
            const trackId = track.id;

            // Fetch Lyrics (if track ID exists)
            let lyricsText = '';
            if (trackId) {
                try {
                    const lyrRes = await axios.get(`${API_BASE}/lyrics/${trackId}`, { timeout: 10000 });
                    if (lyrRes.data?.success && lyrRes.data?.lyrics) {
                        // Take first 300 chars of lyrics for caption
                        lyricsText = `\n\n> 📜 *${bold('LYRICS PREVIEW')}*\n> ${lyrRes.data.lyrics.substring(0, 300).replace(/\n/g, '\n> ')}...`;
                    }
                } catch (e) {
                    logger.warn(`[SPOTIFY] Lyrics not found for ${trackId}`);
                }
            }

            const caption = 
                `> 🎵 *${bold('SPOTIFY TRACK')}*\n` +
                `> ────────────────\n` +
                `> 🎤 \`Title  : ${title}\`\n` +
                `> 👤 \`Artist : ${artist}\`\n` +
                `> 💿 \`Album  : ${album}\`\n` +
                `> 🔗 \`Link   : ${spotifyUrl}\`\n` +
                `> ────────────────` +
                lyricsText +
                `\n> 💫 _POWERED BY ARSLAN MD_ 💫`;

            if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});

            // Send with Preview Audio if available
            if (previewUrl) {
                const audioMsg = await ctx.send({
                    audio: { url: previewUrl },
                    mimetype: 'audio/mp4',
                    fileName: `${title} (Preview).mp3`
                });
                await ctx.send({ 
                    image: cover ? { url: cover } : undefined, 
                    text: caption 
                }, { quoted: audioMsg });
            } else {
                // Just image + caption if no audio preview
                if (cover) {
                    await ctx.send({ image: { url: cover }, caption: caption });
                } else {
                    await ctx.reply(caption);
                }
            }

            try { await ctx.react('✅'); } catch {}
        } catch (err) {
            logger.error(`[SPOTIFY] Error: ${err.message}`);
            if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
            try { await ctx.react('❌'); } catch {}
            await ctx.reply(`> ❌ *${bold('NOT FOUND')}*\n> ╰─➤ ${err.message}`);
        }
    }
};

// ═══════════════════════════════════════════════════════════════════
// 2. LYRICS (.lyrics) — Full Synced Lyrics
// ═══════════════════════════════════════════════════════════════════
export const lyrics = {
    name: 'lyrics',
    aliases: ['lyric', 'lirik'],
    async run(ctx) {
        let query = ctx.args.join(' ').trim();
        if (!query) return ctx.reply(`> 📜 *${bold('USAGE')}*\n> ╰─➤ \`.lyrics <song name>\``);

        if (onCooldown(ctx)) return;
        try { await ctx.react('📜'); } catch {}

        let waitMsg;
        try {
            waitMsg = await ctx.reply(`> 📜 *${bold('SEARCHING LYRICS')}*\n> ╰─➤ \`${query}...\``);
        } catch (e) {}

        try {
            const track = await searchSpotifyTrack(query);
            const trackId = track.id;
            const title = track.name || track.title || query;

            if (!trackId) throw new Error('Could not find track ID.');

            const lyrRes = await axios.get(`${API_BASE}/lyrics/${trackId}`, { timeout: 15000 });
            
            if (!lyrRes.data?.success || !lyrRes.data?.lyrics) {
                throw new Error('Lyrics not available for this track.');
            }

            if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});

            const caption = 
                `> 📜 *${bold('LYRICS')}*: ${title}\n` +
                `> ────────────────\n` +
                `${lyrRes.data.lyrics}\n` +
                `> ────────────────\n` +
                `> 💫 _POWERED BY ARSLAN MD_ 💫`;

            await ctx.reply(caption);
            try { await ctx.react('✅'); } catch {}
        } catch (err) {
            logger.error(`[LYRICS] Error: ${err.message}`);
            if (waitMsg) await ctx.sock.sendMessage(ctx.from, { delete: waitMsg.key }).catch(() => {});
            try { await ctx.react('❌'); } catch {}
            await ctx.reply(`> ❌ *${bold('ERROR')}*\n> ╰─➤ ${err.message}`);
        }
    }
};