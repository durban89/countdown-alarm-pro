import { useEffect, useState } from "react";

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

  // 2. 处于 running 状态时，在 Popup 视图层面启动 100ms 级别的平滑渲染圈/数字更新
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

    // 清除既有 Alarm 并建立新 Alarm
    await chrome.alarms.clear("ChronoPulseTimer");
    chrome.alarms.create("ChronoPulseTimer", { when: targetEndTime });

    // 持久化状态
    await storage.setItem("local:timerStatus", "running");
    await storage.setItem("local:targetEndTime", targetEndTime);

    setRemainingMs(durationMs);
    setStatus("running");
  };

  // 控制逻辑：暂停
  const pause = async () => {
    if (status !== "running") return;

    // 清除后台定时任务
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

  const badge =
    status === "running"
      ? "运行中"
      : status === "paused"
        ? "已暂停"
        : status === "done"
          ? "已结束"
          : "待开始";

  return (
    <div className="w-[340px] p-4 bg-slate-950 text-slate-100 select-none">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">ChronoPulse</div>
            <div className="text-base font-semibold text-slate-100">倒计时闹钟</div>
          </div>
          <div
            className={[
              "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
              status === "running"
                ? "text-cyan-300 border-cyan-800/60 bg-cyan-950/40 animate-pulse"
                : status === "paused"
                  ? "text-amber-300 border-amber-800/60 bg-amber-950/40"
                  : status === "done"
                    ? "text-rose-300 border-rose-800/60 bg-rose-950/40"
                    : "text-slate-400 border-slate-800 bg-slate-800/40",
            ].join(" ")}
          >
            {badge}
          </div>
        </div>

        {/* Display Timer */}
        <div className="mb-5 text-center py-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
          <div className="text-[11px] text-slate-400 mb-0.5">剩余时间</div>
          <div className="text-4xl font-mono font-bold tabular-nums tracking-tight text-white">
            {formatTime(remainingMs)}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <label className="block">
            <div className="text-[11px] text-slate-400 mb-1 text-center">小时</div>
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
              className="w-full text-center rounded-lg bg-slate-800/60 border border-slate-700/60 py-1.5 text-sm outline-none focus:border-cyan-500 disabled:opacity-40"
            />
          </label>

          <label className="block">
            <div className="text-[11px] text-slate-400 mb-1 text-center">分钟</div>
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
              className="w-full text-center rounded-lg bg-slate-800/60 border border-slate-700/60 py-1.5 text-sm outline-none focus:border-cyan-500 disabled:opacity-40"
            />
          </label>

          <label className="block">
            <div className="text-[11px] text-slate-400 mb-1 text-center">秒</div>
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
              className="w-full text-center rounded-lg bg-slate-800/60 border border-slate-700/60 py-1.5 text-sm outline-none focus:border-cyan-500 disabled:opacity-40"
            />
          </label>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {status === "running" ? (
            <button
              onClick={pause}
              className="rounded-xl bg-amber-600 hover:bg-amber-500 py-2 text-xs font-semibold text-white transition active:scale-95"
            >
              暂停
            </button>
          ) : status === "paused" ? (
            <button
              onClick={resume}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white transition active:scale-95"
            >
              继续
            </button>
          ) : (
            <button
              onClick={start}
              disabled={(h * 3600 + m * 60 + sec) <= 0}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 py-2 text-xs font-semibold text-white transition active:scale-95"
            >
              开始
            </button>
          )}

          <button
            onClick={reset}
            disabled={status === "idle" && remainingMs === (h * 3600 + m * 60 + sec) * 1000}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 py-2 text-xs font-medium text-slate-300 transition active:scale-95"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
}