<div align="center">

<!-- BANNER IMAGE -->
<img src="https://raw.githubusercontent.com/ArslanTech-dev/ARSLAN_MDX/main/assets/banner.png" alt="ARSLAN MDX Banner" width="100%">

<br><br>

<!-- LOGO & TITLE -->
<img src="https://raw.githubusercontent.com/ArslanTech-dev/ARSLAN_MDX/main/assets/logo.png" alt="ARSLAN MDX Logo" width="120" height="120" style="border-radius: 20px;">

# ⚡A R S L A N  M D X⚡

### *Next-Gen Multi-User WhatsApp Automation & Control Center*

<img src="https://readme-typing-svg.demolab.com/?lines=%E2%9A%A1+Booting+ARSLAN+MDX...;%F0%9F%96%A5%EF%B8%8F+Cyberpunk+Terminal+UI+Online;%F0%9F%9B%A1%EF%B8%8F+Multi-Session+Engine+Activated;%F0%9F%8C%90+100+Global+Nodes+Connected;%F0%9F%94%A5+Crafted+by+ARSLAN+TECH'S&font=Fira+Code&center=true&width=750&height=50&color=8B5CF6&vCenter=true&size=22&pause=900&background=000000" alt="Typing animation"/>

<p align="center">
  <a href="https://arslan-xmd.vercel.app"><b>🌐 Live Pairing Site</b></a> •
  <a href="https://github.com/ArslanTech-dev/ARSLAN_MDX/issues"><b>🐛 Report Bug</b></a> •
  <a href="https://github.com/ArslanTech-dev/ARSLAN_MDX/pulls"><b>✨ Request Feature</b></a>
</p>

<!-- BADGES -->
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-000000?style=for-the-badge&logo=nodedotjs&logoColor=8B5CF6)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-v7.0-000000?style=for-the-badge&logo=whatsapp&logoColor=8B5CF6)](https://github.com/WhiskeySockets/Baileys)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://arslan-xmd.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge&logoColor=8B5CF6)](LICENSE)

![Stars](https://img.shields.io/github/stars/ArslanTech-dev/ARSLAN_MDX?style=for-the-badge&color=8b5cf6&labelColor=000000&logo=github)
![Forks](https://img.shields.io/github/forks/ArslanTech-dev/ARSLAN_MDX?style=for-the-badge&color=8b5cf6&labelColor=000000&logo=github)
![Last Commit](https://img.shields.io/github/last-commit/ArslanTech-dev/ARSLAN_MDX?style=for-the-badge&color=8b5cf6&labelColor=000000&logo=github)

</div>

---

## 🚀 About ARSLAN MDX

**ARSLAN MDX** is an **Enterprise-Grade Automation Infrastructure** for WhatsApp — not just a bot. Built with a cyberpunk/terminal-inspired interface, it manages multiple WhatsApp sessions simultaneously with high stability and minimal latency.

It includes advanced anti-spam modules and a simulated 100-node network dashboard for monitoring system health at scale.

> *"Engineered to perfection. Built for absolute performance."*

---

## 🖥️ Interactive Terminal Preview

<div align="center">
<img src="https://readme-typing-svg.demolab.com/?lines=root%40arslan-mdx%3A~%24+node+index.js;%3E+Loading+cyberpunk+UI+module...;%3E+Connecting+to+Baileys+socket...;%3E+Session+1+%E2%9C%93+%7C+Session+2+%E2%9C%93+%7C+Session+3+%E2%9C%93;%3E+100+Global+Nodes+%E2%80%94+Status%3A+ONLINE+%F0%9F%9F%A2;%3E+Anti-Delete+%E2%9C%93+%7C+Anti-Call+%E2%9C%93+%7C+Anti-Link+%E2%9C%93;%3E+ARSLAN+MDX+is+fully+operational+%E2%9A%A1&font=Fira+Code&center=true&width=780&height=50&color=8B5CF6&vCenter=true&size=18&pause=700&background=000000" alt="Interactive terminal animation"/>
</div>

```javascript
// server.js — Multi-session orchestration engine
const sessions = new Map();

async function bootSession(userId) {
  console.log(`[BOOT] Initializing session for ${userId}...`);
  const sock = await startBaileysSocket(userId);
  sessions.set(userId, sock);
  console.log(`[READY] Session ${userId} is live ⚡`);
}

async function bootAllNodes() {
  console.log('🌐 Spinning up 100 global nodes...');
  for (let i = 1; i <= 100; i++) {
    await simulateNode(i);
  }
  console.log('✅ All nodes synced — ARSLAN MDX online');
}

bootAllNodes();
```

---

## 💎 Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🖥️ Ultra-Advanced UI</h3>
      <ul>
        <li>Matrix Rain Background</li>
        <li>Interactive Live Terminal</li>
        <li>BIOS Boot Sequence (Preloader)</li>
        <li>Cyberpunk Dark Theme</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🛡️ Enterprise Security</h3>
      <ul>
        <li><b>Anti-Delete:</b> Recover deleted messages.</li>
        <li><b>Anti-Call:</b> Auto-reject spam calls.</li>
        <li><b>Anti-Link:</b> Group protection.</li>
        <li><b>Cloud-Safe:</b> Zero permission crashes.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚡ Multi-Session Engine</h3>
      <ul>
        <li>Handle up to 10 WhatsApp accounts.</li>
        <li>Independent plugin execution per user.</li>
        <li>Powered by <code>ms-nicky-baileys</code>.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🌐 100 Global Nodes</h3>
      <ul>
        <li>Simulated network dashboard.</li>
        <li>Real-time latency & CPU stats.</li>
        <li>Auto server load balancing.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,vercel,html,css,js,git,github&theme=dark" alt="Tech Stack" />
</div>

- **Backend:** Node.js, Express.js, `@whiskeysockets/baileys` (via `ms-nicky` fork)
- **Frontend:** Pure HTML/CSS/JS (Zero React, Zero Vite — 100% Vanilla)
- **Database:** Local JSON via `fs-extra` (Cloud-Safe `/tmp` storage)
- **Deployment:** Pxxl / nodeX (Backend) + Vercel (Frontend)

---

## 🚀 Quick Start (Local Testing)

<div align="center">
<img src="https://readme-typing-svg.demolab.com/?lines=%24+git+clone+github.com%2FArslanTech-dev%2FARSLAN_MDX.git;%24+cd+ARSLAN_MDX;%24+npm+install+--legacy-peer-deps;%24+npm+start;%E2%9C%85+Engine+started+on+port+3000&font=Fira+Code&center=true&width=780&height=45&color=8B5CF6&vCenter=true&size=17&pause=900&background=000000" alt="Quick start terminal animation"/>
</div>

```bash
# 1. Clone the repository
git clone https://github.com/ArslanTech-dev/ARSLAN_MDX.git
cd ARSLAN_MDX

# 2. Install dependencies (Legacy peer deps required for Baileys)
npm install --legacy-peer-deps

# 3. Start the engine
npm start
```

### 🔐 Pairing a Session

1. Open the local server or the [Live Pairing Site](https://arslan-xmd.vercel.app)
2. Enter your WhatsApp number with country code
3. Choose **QR Code** or **Pairing Code** method
4. Scan or enter the code in WhatsApp → **Linked Devices**
5. Session goes live instantly — repeat for up to 10 accounts

---

## ☁️ Deployment

ARSLAN MDX runs on a split architecture — backend engine separate from the frontend dashboard:

```yaml
Backend:   Pxxl / nodeX   (long-running Node.js process)
Frontend:  Vercel          (static dashboard + pairing UI)
Sessions:  Persistent storage required for /tmp session data
Port:      3000 (default) or host-provided PORT
```

```bash
npm install -g pm2
pm2 start server.js --name arslan-mdx
pm2 save
pm2 startup
```

---

## 🧬 Roadmap

- [x] Cyberpunk terminal UI
- [x] Multi-session engine (up to 10 accounts)
- [x] Anti-Delete, Anti-Call, Anti-Link modules
- [x] 100 simulated global nodes dashboard
- [ ] Real-time analytics export
- [ ] Mobile-responsive control panel
- [ ] Role-based admin permissions
- [ ] Plugin marketplace

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit and test your changes
4. Push the branch
5. Open a pull request

---

## ⚠️ Disclaimer

This project is **not affiliated with, endorsed by, or connected to WhatsApp Inc. or Meta**. Use responsibly and at your own risk. Automating WhatsApp may violate its Terms of Service.

---

## 📜 License

This project is licensed under the **MIT License** — free to use, modify, and distribute with proper credit.

---

## 👤 About the Developer

<div align="center">

<img src="https://github.com/ArslanTech-dev.png" width="140" style="border-radius:50%; border:3px solid #8b5cf6"/>

<img src="https://readme-typing-svg.demolab.com/?lines=Hi+%F0%9F%91%8B%2C+I'm+Arslan;AI+Assistant+Programmer;AI+Developer;Bots+Developer&font=Fira+Code&center=true&width=550&height=42&color=8b5cf6&vCenter=true&size=18&pause=1000&background=000000" alt="Developer typing bio"/>

</div>

```yaml
Name:       Arslan
Age:        17
Country:    Pakistan
City:       Bahawalpur
Education:  ICS — Punjab College, Hasilpur
Roles:      AI Assistant Programmer | AI Developer | Bots Developer
Goal:       AI/ML Engineer @ Microsoft / Google
Brand:      ARSLAN TECH'S
```

<div align="center">

📧 **Email:** arslanchkpt@gmail.com
📱 **Contact:** +92 308 4991001
🔗 **GitHub:** [@ArslanTech-dev](https://github.com/ArslanTech-dev)

[![Gmail](https://img.shields.io/badge/Gmail-000000?style=for-the-badge&logo=gmail&logoColor=8B5CF6)](mailto:arslanchkpt@gmail.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-000000?style=for-the-badge&logo=whatsapp&logoColor=8B5CF6)](https://wa.me/923084991001)
[![GitHub](https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=8B5CF6)](https://github.com/ArslanTech-dev)

</div>

---

<div align="center">

**Powered by ARSLAN TECH'S**

</div>
