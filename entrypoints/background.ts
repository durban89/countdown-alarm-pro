// 💡 定义统一的 Alarm 定时任务 Key，与 App.tsx 保持一致
const TIMER_ALARM_NAME = "PulseTimerAlarm";

export default defineBackground(() => {
  // 监听 Alarm 定时器触发事件
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    // 兼容新旧 Alarm 名称，防止老版本升级用户出现定时器失效
    if (alarm.name === TIMER_ALARM_NAME || alarm.name === "ChronoPulseTimer") {
      
      // 1. 持久化存储更新：将全局倒计时状态置为 done
      await storage.setItem("local:timerStatus", "done");
      await storage.setItem("local:targetEndTime", null);

      // 2. 倒计时结束：自动打开全新的 Alert 提醒标签页
      const alertUrl = chrome.runtime.getURL("alarm.html");
      try {
        await chrome.tabs.create({
          url: alertUrl,
          active: true,
        });
      } catch (err) {
        console.error("[PulseTimer] Failed to create alert tab:", err);
      }

      // 3. 推送系统原生通知 (使用全英文极客风格)
      chrome.notifications.create({
        type: "basic",
        iconUrl: "/icon/icon-128.png",
        title: "⚡ PulseTimer - Time's Up!",
        message: "Your countdown session has completed.",
        priority: 2, // 提高通知优先级，确保在系统侧及时弹出
      });
    }
  });
});