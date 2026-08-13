import { useEffect, useState } from "react";
import { storage } from "#imports"; // 确保导入你的存储库

type Status = "idle" | "running" | "paused" | "done";

function formatTime(ms: number) {
  const t = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(t / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const [h, setH] = useState(0);
  const [m, setM] = useState(1);
  const [sec, setSec] = useState(0);

  const [status, setStatus] = useState<Status>("idle");
  const [remainingMs, setRemainingMs] = useState<number>(60000); // 默认 1 分钟

  // 1. 恢复与同步后台倒计时状态
  useEffect(() => {
    const syncState = async () => {
      const savedStatus = (await storage.getItem<Status>("local:timerStatus")) || "idle";
      const targetEndTime = await storage.getItem<number>("local:targetEndTime");
      const pausedRemaining = await storage.getItem<number>("local:pausedRemaining");

      setStatus(savedStatus);

      if (savedStatus === "running" && targetEndTime) {
        const now = Date.now();
        const left = Math.max(0, targetEndTime - now);
        setRemainingMs(left);
      } else if (savedStatus === "paused" && pausedRemaining) {
        setRemainingMs(pausedRemaining);
      }
    };

    syncState();
  }, []);

  // 2. 处于 running 状态时启动 Popup 平滑更新
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(async () => {
      const targetEndTime = await storage.getItem<number>("local:targetEndTime");
      if (!targetEndTime) return;

      const left = targetEndTime - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        setStatus("done");
        clearInterval(interval);
      } else {
        setRemainingMs(left);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [status]);

  const canEdit = status === "idle" || status === "done";

  // 控制逻辑：启动
  const start = async () => {
    const durationMs = (h * 3600 + m * 60 + sec) * 1000;
    if (durationMs <= 0) return;

    const targetEndTime = Date.now() + durationMs;

    await chrome.alarms.clear("ChronoPulseTimer");
    chrome.alarms.create("ChronoPulseTimer", { when: targetEndTime });

    await storage.setItem("local:timerStatus", "running");
    await storage.setItem("local:targetEndTime", targetEndTime);

    setRemainingMs(durationMs);
    setStatus("running");
  };

  // 控制逻辑：暂停
  const pause = async () => {
    if (status !== "running") return;

    await chrome.alarms.clear("ChronoPulseTimer");

    const targetEndTime = await storage.getItem<number>("local:targetEndTime");
    const currentLeft = targetEndTime ? Math.max(0, targetEndTime - Date.now()) : remainingMs;

    await storage.setItem("local:timerStatus", "paused");
    await storage.setItem("local:pausedRemaining", currentLeft);
    await storage.setItem("local:targetEndTime", null);

    setRemainingMs(currentLeft);
    setStatus("paused");
  };

  // 控制逻辑：继续
  const resume = async () => {
    if (status !== "paused") return;

    const pausedRemaining = (await storage.getItem<number>("local:pausedRemaining")) || remainingMs;
    if (pausedRemaining <= 0) return;

    const targetEndTime = Date.now() + pausedRemaining;

    chrome.alarms.create("ChronoPulseTimer", { when: targetEndTime });

    await storage.setItem("local:timerStatus", "running");
    await storage.setItem("local:targetEndTime", targetEndTime);

    setRemainingMs(pausedRemaining);
    setStatus("running");
  };

  // 控制逻辑：重置
  const reset = async () => {
    await chrome.alarms.clear("ChronoPulseTimer");

    await storage.setItem("local:timerStatus", "idle");
    await storage.setItem("local:targetEndTime", null);
    await storage.setItem("local:pausedRemaining", null);

    const initialMs = (h * 3600 + m * 60 + sec) * 1000;
    setRemainingMs(initialMs);
    setStatus("idle");
  };

  // 英文状态指示标签
  const badgeMap = {
    running: { text: "RUNNING", class: "text-emerald-400 border-emerald-800/60 bg-emerald-950/80 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.3)]" },
    paused: { text: "PAUSED", class: "text-amber-400 border-amber-800/60 bg-amber-950/80" },
    done: { text: "TIME UP", class: "text-rose-400 border-rose-800/60 bg-rose-950/80 animate-bounce" },
    idle: { text: "READY", class: "text-slate-400 border-slate-800 bg-slate-900/60" },
  };

  const currentBadge = badgeMap[status];

  return (
    <div className="w-[340px] p-4 bg-slate-950 text-slate-100 font-mono select-none antialiased border border-slate-800/80 rounded-2xl shadow-2xl">
      <div className="space-y-4">
        
        {/* Header：品牌徽记指示灯 + 运行状态 Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest text-slate-200">
              PULSE <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">TIMER</span>
            </span>
          </div>

          {/* 状态指示框 */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wider transition-all ${currentBadge.class}`}>
            {currentBadge.text}
          </span>
        </div>

        {/* Display Timer：倒计时面板 */}
        <div className="py-3 px-4 bg-slate-900/90 rounded-xl border border-slate-800/80 text-center relative overflow-hidden shadow-inner">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1">
            REMAINING TIME
          </div>
          <div className="text-4xl font-bold tabular-nums tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.25)]">
            {formatTime(remainingMs)}
          </div>
        </div>

        {/* Inputs：时间输入框 */}
        <div className="grid grid-cols-3 gap-2">
          <label className="block bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-1 text-center tracking-wider">HRS</div>
            <input
              type="number"
              min={0}
              value={h}
              disabled={!canEdit}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value || 0));
                setH(val);
                if (canEdit) setRemainingMs((val * 3600 + m * 60 + sec) * 1000);
              }}
              className="w-full text-center rounded-lg bg-slate-950/80 border border-slate-800 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-40 transition-all"
            />
          </label>

          <label className="block bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-1 text-center tracking-wider">MINS</div>
            <input
              type="number"
              min={0}
              max={59}
              value={m}
              disabled={!canEdit}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value || 0));
                setM(val);
                if (canEdit) setRemainingMs((h * 3600 + val * 60 + sec) * 1000);
              }}
              className="w-full text-center rounded-lg bg-slate-950/80 border border-slate-800 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-40 transition-all"
            />
          </label>

          <label className="block bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-1 text-center tracking-wider">SECS</div>
            <input
              type="number"
              min={0}
              max={59}
              value={sec}
              disabled={!canEdit}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value || 0));
                setSec(val);
                if (canEdit) setRemainingMs((h * 3600 + m * 60 + val) * 1000);
              }}
              className="w-full text-center rounded-lg bg-slate-950/80 border border-slate-800 py-1 text-xs text-slate-100 outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-40 transition-all"
            />
          </label>
        </div>

        {/* Action Controls：核心按钮组 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {status === "running" ? (
            <button
              onClick={pause}
              className="rounded-xl bg-amber-600/90 hover:bg-amber-500 py-2 text-xs font-semibold text-white transition active:scale-95 shadow-xs cursor-pointer border border-amber-500/30"
            >
              PAUSE
            </button>
          ) : status === "paused" ? (
            <button
              onClick={resume}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition active:scale-95 shadow-xs cursor-pointer border border-emerald-500/30"
            >
              RESUME
            </button>
          ) : (
            <button
              onClick={start}
              disabled={(h * 3600 + m * 60 + sec) <= 0}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 py-2 text-xs font-semibold text-white transition active:scale-95 shadow-xs cursor-pointer border border-emerald-500/30"
            >
              START
            </button>
          )}

          <button
            onClick={reset}
            disabled={status === "idle" && remainingMs === (h * 3600 + m * 60 + sec) * 1000}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800/80 py-2 text-xs font-medium text-slate-300 transition active:scale-95 cursor-pointer"
          >
            RESET
          </button>
        </div>

      </div>
    </div>
  );
}