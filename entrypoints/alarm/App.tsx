import { useEffect, useRef, useState } from "react";

export default function App() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 💡 容错初始化 Web Audio API
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    let count = 0;

    const playBeep = async () => {
      if (count >= 5) return; // 响 5 次

      // 确保 AudioContext 在唤醒状态
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now); // A5 蜂鸣音
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);

      count++;
      timerRef.current = setTimeout(playBeep, 800);
    };

    playBeep();

    // 清理逻辑：切页或关闭时强制关停音频源
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // 点击关闭按钮时：关停蜂鸣音并关闭窗口
  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
    window.close();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-950 font-mono select-none antialiased bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:16px_16px]">
      
      {/* 卡片主容器 */}
      <div className="w-[340px] text-center p-6 bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* 背景微光模糊晕轮 */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* 顶部指示徽标 */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></span>
          <span className="text-[11px] font-bold tracking-widest text-slate-300">
            PULSE <span className="text-rose-400 font-semibold text-[9px] bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/50">ALERT</span>
          </span>
        </div>

        {/* 动态脉冲响铃 Icon */}
        <div className="relative w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <span className="absolute inset-0 rounded-full border border-rose-500/40 animate-ping opacity-75"></span>
          <svg className="w-8 h-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        {/* 标题与描述信息 */}
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-white uppercase font-mono">
          TIME'S UP!
        </h1>
        <p className="text-xs text-slate-400 mb-6 tracking-wide leading-relaxed">
          Your countdown session has completed.
        </p>

        {/* 关闭/确认识别按钮 */}
        <button
          onClick={handleDismiss}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-rose-900/40 active:scale-[0.98] cursor-pointer border border-rose-400/30 tracking-wider uppercase"
        >
          DISMISS ALERT
        </button>
      </div>
    </div>
  );
}