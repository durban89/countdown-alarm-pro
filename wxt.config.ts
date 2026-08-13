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
    version: '1.0.1',
    description: "A sleek, minimalist countdown timer & alarm for deep work, quick pomodoros, and daily browser reminders.",
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
      default_icon: 'icon/icon-128.png',
    },
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
