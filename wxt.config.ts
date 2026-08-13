import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  webExt: {
    disabled: true, // 禁用 wxt 在容器内自动打开浏览器
  },
  vite: () => ({
    plugins: [tailwindcss()],
    server: {
      host: '0.0.0.0', // 监听所有网络接口
      port: 3000,
      hmr: {
        host: 'localhost', // 告诉宿主机的 Chrome 往 localhost 发起连接
        port: 3000,
      },
    },
  }),
  manifest: {
    name: 'PulseTimer - Sleek Focus & Alarm',
    version: '1.0.0',
    description: 'A sleek, minimalist countdown timer designed for high-focus deep work, quick pomodoros, and daily reminders directly in your browser.',
    permissions: [
      'alarms',          // 👈 核心：允许使用 chrome.alarms
      'storage',         // 存储状态
      'notifications'   // 发送系统通知（可选）
    ],
    icons: {
      "16": "icon/icon-16.png",
      "48": "icon/icon-48.png",
      "128": "icon/icon-128.png"
    },
    action: {
      default_popup: 'bubble.html',
      default_icon: 'icon/icon-128.png',
    },
    web_accessible_resources: [
      {
        resources: ['bubble.html', 'assets/*'],
        matches: ['<all_urls>'],
      },
    ],
    commands: {
      'toggle-panel': {
        suggested_key: {
          default: 'Alt+L',
          mac: 'MacCtrl+L',
        },
        description: 'Toggle Countdown Alarm Panel',
      },
    }
  }
});
