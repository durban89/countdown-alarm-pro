<div align="center">

  <!-- Logo -->
  <img src="assets/icon.svg" alt="PulseTimer Logo" width="128" height="128" />

  <h1>PulseTimer</h1>

  <p>
    <b>A sleek, minimalist countdown timer & alarm Chrome extension built with Tailwind CSS v4, WXT, and React.</b>
  </p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/facebook/react"><img src="https://img.shields.io/badge/React-18/19-61DAFB?logo=react&logoColor=black" alt="React" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
    <a href="https://wxt.dev"><img src="https://img.shields.io/badge/WXT-Framework-6366F1" alt="WXT Framework" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL_3.0-green.svg" alt="License" /></a>
  </p>

</div>

---

## 📖 Introduction

**PulseTimer** is a lightweight, distraction-free countdown & alarm extension designed for developers, creators, and focus seekers. Built on a next-gen Web Extensions stack, it delivers instant startup, zero lag, and a high-contrast Slate-950 + Emerald dark-mode aesthetic. 

Whether you are powering through deep-work Pomodoro sessions, timing meeting breaks, or setting precise daily reminders, PulseTimer keeps your workflow in sync directly from your browser.

## ✨ Key Features

- ⚡ **Instant Setup**: Set hours, minutes, and seconds in milliseconds with effortless input controls.
- 🕒 **Background Sync & Reliability**: Powered by Chrome Alarms API, ensuring your timer stays rock-solid accurate even when the popup is closed.
- 🎨 **Tailwind CSS v4 Cyber Design**: Dark-mode primary interface tailored with vibrant Emerald glow effects and smooth transitions.
- 🔔 **Multi-Channel Alerts**: Rich visual countdown completion pages, Web Audio API chime sounds, and native desktop notification popups.
- 🚀 **WXT Next-Gen Architecture**: Minimal memory footprint and lightning-fast popup rendering.
- 🖥️ **Offscreen & Standalone Support**: Seamlessly transitions between quick popup view, dedicated standalone windows, and alert tabs.

## 🛠️ Tech Stack

* **UI Framework**: [React](https://react.dev/)
* **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Extension Framework**: [WXT (Web Extension Tools)](https://wxt.dev/)
* **Background Engine**: Chrome Extension Alarms API & Storage API
* **Audio Engine**: Web Audio API (Oscillator Node)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `>= 18.0.0`
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`

### Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/durban89/countdown-alarm-pro.git
   cd countdown-alarm-pro