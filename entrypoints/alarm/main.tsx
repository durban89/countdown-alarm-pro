import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import '../popup/style.css';

function AlarmFinishedPage() {
  useEffect(() => {
    // 播放蜂鸣提示音
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let count = 0;

    const playBeep = () => {
      if (count >= 5) return; // 响 5 次
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);

      count++;
      setTimeout(playBeep, 800);
    };

    playBeep();
  }, []);

  return (
    <div className="text-center p-8 max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl animate-fade-in">
      <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30 animate-pulse">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">时间到！</h1>
      <p className="text-slate-400 mb-8">ChronoPulse 倒计时任务已顺利完成。</p>
      <button
        onClick={() => window.close()}
        className="w-full py-3 px-6 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition shadow-lg shadow-rose-600/30 active:scale-95"
      >
        关闭页面
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AlarmFinishedPage />
  </React.StrictMode>
);