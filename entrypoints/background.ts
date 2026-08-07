export default defineBackground(() => {
  // 监听 Alarm 触发事件
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "ChronoPulseTimer") {
      // 1. 更新全局状态为 done
      await storage.setItem("local:timerStatus", "done");
      await storage.setItem("local:targetEndTime", null);

      // 2. 倒计时结束：新开标签页展示提醒
      chrome.tabs.create({
        url: chrome.runtime.getURL("alarm.html"),
        active: true,
      });

      // 3. 推送系统原生通知
      chrome.notifications.create({
        type: "basic",
        iconUrl: "/icon/icon-128.png",
        title: "ChronoPulse 倒计时结束",
        message: "您设置的倒计时已到期！",
      });
    }
  });
});