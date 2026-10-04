import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STAGES, SPOTS, type SpotDef } from "./game/data";
import {
  itemById, spotById, volumeIn, calcRisk, statusOf, riskLabel, runScan, newUid,
  type Stash, type ScanResult,
} from "./game/logic";
import { Room, type Ping, type Float } from "./components/Room";
import { TopBar, ItemTray, SpotInfo, LogFeed } from "./components/Panels";
import { IntroModal, StageModal, ResultModal } from "./components/Modals";
import type { HamsterState } from "./components/Hamster";

type Phase = "intro" | "brief" | "play" | "scanning" | "result";

const START = { u: 480, v: 395 };

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stageIndex, setStageIndex] = useState(0);
  const stage = STAGES[Math.min(stageIndex, STAGES.length - 1)];

  const [tray, setTray] = useState<string[]>([]);
  const [stashes, setStashes] = useState<Stash[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverSpot, setHoverSpot] = useState<string | null>(null);
  const [pings, setPings] = useState<Ping[]>([]);
  const [floats, setFloats] = useState<Float[]>([]);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<{ id: string; text: string; tone: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      const v = Number(localStorage.getItem("rivergg-best"));
      return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
    } catch {
      return 0;
    }
  });
  const [robotU, setRobotU] = useState(30);
  const [hamster, setHamster] = useState({
    u: START.u, v: START.v, state: "idle" as HamsterState, holding: null as string | null, pouch: 1,
  });
  const [walkMs, setWalkMs] = useState(700);

  const stashesRef = useRef<Stash[]>([]);
  const hamsterRef = useRef(hamster);
  const pingsRef = useRef<Ping[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => { stashesRef.current = stashes; }, [stashes]);
  useEffect(() => { hamsterRef.current = hamster; }, [hamster]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const setPingsBoth = (next: Ping[]) => {
    pingsRef.current = next;
    setPings(next);
  };

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms) as unknown as number); };
  const activeSpots = useMemo(
    () => stage.spots.map((id) => SPOTS.find((s) => s.id === id)).filter((s): s is SpotDef => !!s),
    [stage],
  );

  /* ---------------- 유틸 ---------------- */
  const addLog = useCallback((text: string, tone = "text-slate-300") => {
    setLogs((p) => [{ id: newUid(), text, tone }, ...p].slice(0, 40));
  }, []);

  const addFloat = useCallback((u: number, v: number, y: number, text: string, tone: string) => {
    const id = newUid();
    setFloats((p) => [...p, { id, u, v, y, text, tone }]);
    later(() => setFloats((p) => p.filter((f) => f.id !== id)), 1500);
  }, []);

  const doShake = () => {
    setShake(true);
    later(() => setShake(false), 460);
  };

  /* ---------------- 라운드 초기화 ---------------- */
  const resetRound = useCallback((idx: number) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const st = STAGES[idx];
    setTray([...st.items]);
    setStashes([]);
    setSelected(null);
    setHoverSpot(null);
    setPings([]);
    setFloats([]);
    setRevealed({});
    setLogs([]);
    setTimeLeft(st.time);
    setBusy(false);
    setResult(null);
    setRobotU(30);
    pingsRef.current = [];
    setHamster({ u: START.u, v: START.v, state: "idle", holding: null, pouch: 1 });
  }, []);

  /* ---------------- 국소 레이더 판정 ---------------- */
  const resolvePing = useCallback((ping: Ping) => {
    const stash = stashesRef.current.find((s) => s.uid === ping.id);
    if (!stash) return;
    const spot = spotById(stash.spotId);
    const item = itemById(stash.itemId);
    const st = statusOf(stash.risk);
    setRevealed((p) => ({ ...p, [spot.id]: stash.risk }));

    if (st === "busted") {
      setStashes((prev) => prev.filter((s) => s.uid !== ping.id));
      setTray((prev) => [...prev, stash.itemId]);
      addFloat(spot.u, spot.v, spot.my + 80, `🚨 ${item.name} 튕겨 나옴!`, "bg-rose-600/95 text-white");
      addLog(`${spot.name} — 위험 ${stash.risk} · ${item.name}이(가) 튕겨 나왔다!`, "text-rose-300");
      doShake();
      setHamster((h) => ({ ...h, state: "sad" }));
      later(() => setHamster((h) => ({ ...h, state: "idle" })), 1400);
    } else {
      setStashes((prev) => prev.map((s) => (s.uid === ping.id ? { ...s, status: st } : s)));
      if (st === "safe") {
        addFloat(spot.u, spot.v, spot.my + 80, `✅ 은폐 성공 (위험 ${stash.risk})`, "bg-emerald-500/95 text-white");
        addLog(`${spot.name} — 위험 ${stash.risk} · 완벽하게 들어갔다`, "text-emerald-300");
      } else {
        addFloat(spot.u, spot.v, spot.my + 80, `⚠ 아슬아슬 (위험 ${stash.risk})`, "bg-amber-500/95 text-black");
        addLog(`${spot.name} — 위험 ${stash.risk} · 틈이 살짝 벌어져 있다`, "text-amber-300");
      }
    }
  }, [addFloat, addLog]);

  /* ---------------- 게임 루프 (0.1초) ---------------- */
  useEffect(() => {
    if (phase !== "play") return;
    const t = window.setInterval(() => {
      setTimeLeft((v) => (v <= 0.1 ? 0 : +(v - 0.1).toFixed(1)));
      const cur = pingsRef.current;
      if (cur.length === 0) return;
      const expired = cur.filter((p) => p.remain <= 100);
      const rest = cur.filter((p) => p.remain > 100).map((p) => ({ ...p, remain: p.remain - 100 }));
      setPingsBoth(rest);
      expired.forEach(resolvePing);
    }, 100);
    return () => clearInterval(t);
  }, [phase, resolvePing]);

  /* 시간 종료 → 자동 스캔 */
  useEffect(() => {
    if (phase === "play" && timeLeft <= 0 && !busy) startScan(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, busy]);

  /* 로봇 스캔 이동 */
  useEffect(() => {
    if (phase !== "scanning") return;
    setRobotU(20);
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 2500);
      setRobotU(20 + k * 900);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /* ---------------- 이동 공통 처리 ---------------- */
  const walkTo = (spot: SpotDef, holding: string | null, after: () => void, holdMs = 700) => {
    setBusy(true);
    const du = spot.u - hamsterRef.current.u;
    const dv = spot.hv - hamsterRef.current.v;
    const dur = Math.max(360, Math.min(980, Math.hypot(du, dv) * 1.15));
    setWalkMs(dur);
    setHamster((h) => ({ ...h, u: spot.u, v: spot.hv, state: "walk", holding }));
    later(() => {
      setHamster((h) => ({ ...h, state: "stuff" }));
      later(() => {
        after();
        setHamster((h) => ({ ...h, state: "idle", holding: null }));
      }, holdMs);
    }, dur);
  };

  /* ---------------- 물건 쑤셔 넣기 ---------------- */
  const onSpotClick = (spot: SpotDef) => {
    if (phase !== "play" || busy) return;
    setHoverSpot(spot.id);

    /* 선택된 물건이 없으면: 마지막 물건을 도로 꺼낸다 */
    if (!selected) {
      const inside = stashes.filter((s) => s.spotId === spot.id && s.status !== "busted");
      if (inside.length === 0) {
        addFloat(spot.u, spot.v, spot.my + 60, "먼저 볼주머니에서 골라라!", "bg-slate-800/95 text-white");
        return;
      }
      const target = inside[inside.length - 1];
      const item = itemById(target.itemId);
      /* 꺼내는 동안에는 국소 레이더가 발사되지 않게 한다 */
      setPingsBoth(pingsRef.current.filter((p) => p.id !== target.uid));
      walkTo(
        spot,
        item.emoji,
        () => {
          if (!stashesRef.current.find((s) => s.uid === target.uid)) {
            setBusy(false);
            return;
          }
          setStashes((prev) => prev.filter((s) => s.uid !== target.uid));
          setTray((prev) => [...prev, item.id]);
          setRevealed((p) => {
            const n = { ...p };
            delete n[spot.id];
            return n;
          });
          setBusy(false);
          addFloat(spot.u, spot.v, spot.my + 60, `도로 꺼냈다 ${item.emoji}`, "bg-slate-900/95 text-white");
          addLog(`${spot.name}에서 ${item.name}을(를) 꺼냈다. 다른 곳을 노려보자.`, "text-slate-300");
        },
        520,
      );
      return;
    }
    const item = itemById(selected);
    const used = volumeIn(stashes, spot.id);
    if (used + item.volume > spot.capacity) {
      addFloat(spot.u, spot.v, spot.my + 60, "더는 안 들어간다…", "bg-rose-600/95 text-white");
      addLog(`${spot.name}은(는) 이미 꽉 찼다 (부피 ${used}/${spot.capacity})`, "text-rose-300");
      return;
    }
    addLog(`굴러리가 ${spot.name}(으)로 엉덩이를 방실방실…`, "text-slate-300");
    walkTo(
      spot,
      item.emoji,
      () => {
        const risk = calcRisk(item, spot, used + item.volume, stage.sensitivity, Math.random());
        const uid = newUid();
        const next = { uid, itemId: item.id, spotId: spot.id, risk, status: "pending" as const, pingAt: Date.now() };
        stashesRef.current = [...stashesRef.current, next];
        setStashes((prev) => [...prev, next]);
        setPingsBoth([...pingsRef.current, { id: uid, spotId: spot.id, remain: 3000, total: 3000 }]);
        setTray((prev) => prev.filter((x) => x !== item.id));
        setSelected(null);
        setBusy(false);
        addFloat(spot.u, spot.v, spot.my + 40, "쑤셔 넣었다! 3초…", "bg-cyan-500/95 text-[#04202b]");
      },
      760,
    );
  };

  /* ---------------- 최종 스캔 ---------------- */
  const startScan = (auto = false) => {
    if (phase !== "play" || busy) return;
    setSelected(null);
    setHoverSpot(null);
    setPingsBoth([]);
    setPhase("scanning");
    addLog(auto ? "시간 종료! 로봇이 강제 스캔을 시작했다" : "로봇을 불렀다 — 전방위 스캔 개시!", "text-cyan-300");
    later(() => {
      const res = runScan(stashesRef.current, tray, timeLeft);
      setResult(res);
      const next = totalScore + res.total;
      setTotalScore(next);
      setBestScore((b) => {
        if (next <= b) return b;
        try {
          localStorage.setItem("rivergg-best", String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      setPhase("result");
      setHamster((h) => ({ ...h, state: res.caught > 0 ? "sad" : "happy" }));
    }, 2800);
  };

  /* ---------------- 흐름 ---------------- */
  const beginStage = (idx: number) => {
    resetRound(idx);
    setPhase("brief");
  };
  const startPlay = () => {
    setPhase("play");
    addLog(`${stage.robotName}이(가) 복도에서 대기 중… 지금이 기회다!`, "text-cyan-200");
  };
  const nextStage = () => {
    const n = Math.min(stageIndex + 1, STAGES.length - 1);
    setStageIndex(n);
    beginStage(n);
  };
  const retryStage = () => beginStage(stageIndex);

  const hiddenCount = stashes.filter((s) => s.status !== "busted").length;
  const pouchRatio = tray.length / Math.max(1, tray.length + stashes.length);
  const armed = phase === "play" && !busy && !!selected;

  return (
    <div className="flex h-screen min-h-[560px] flex-col overflow-hidden bg-[#070b16]">
      <TopBar
        stage={stage}
        timeLeft={timeLeft}
        totalScore={totalScore}
        bestScore={bestScore}
        hidden={hiddenCount}
        caught={stashes.filter((s) => s.status === "risky").length}
        onScan={() => startScan(false)}
        canScan={phase === "play" && !busy}
      />

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ===== 방 ===== */}
        <div className={`relative min-h-[46vh] flex-1 ${shake ? "anim-shake" : ""}`}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 8%,#22304f 0%,#111a2e 45%,#080d18 100%)",
            }}
          />
          <Room
            spots={activeSpots}
            stashes={stashes}
            activeSpot={armed ? hoverSpot : null}
            hoverSpot={hoverSpot}
            onSpotEnter={setHoverSpot}
            onSpotClick={onSpotClick}
            hamster={{ ...hamster, pouch: phase === "play" ? pouchRatio : 1 }}
            pings={pings}
            floats={floats}
            scanning={phase === "scanning"}
            robotU={robotU}
            revealed={revealed}
            armed={armed}
            walkMs={walkMs}
          />

          {/* 뷰포트 프레임 */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ boxShadow: "inset 0 0 130px 34px rgba(4,7,17,.72)" }}
          />
          <div className="pointer-events-none absolute right-3 top-3 z-10 h-7 w-7 border-r-2 border-t-2 border-cyan-300/45" />
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 h-7 w-7 border-b-2 border-r-2 border-cyan-300/30" />
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 h-7 w-7 border-b-2 border-l-2 border-cyan-300/30" />

          {/* 스캔 오버레이 */}
          {phase === "scanning" && (
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              <div
                className="absolute inset-0 opacity-55 anim-radar"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(56,232,255,.42) 0deg, rgba(56,232,255,0) 62deg, rgba(56,232,255,0) 360deg)",
                  maskImage: "radial-gradient(closest-side,#000 40%,transparent 78%)",
                  WebkitMaskImage: "radial-gradient(closest-side,#000 40%,transparent 78%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(56,232,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(56,232,255,.35) 1px,transparent 1px)",
                  backgroundSize: "44px 44px",
                  maskImage: "radial-gradient(closest-side,#000 30%,transparent 75%)",
                  WebkitMaskImage: "radial-gradient(closest-side,#000 30%,transparent 75%)",
                }}
              />
              <div className="anim-scanline absolute inset-y-0 w-[16%] bg-gradient-to-r from-cyan-300/0 via-cyan-300/45 to-cyan-300/0 blur-[2px]" />
              <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-cyan-300/60 bg-black/60 px-4 py-1 font-cute text-[15px] text-cyan-200 anim-glow">
                🤖 {stage.robotName} 전방위 레이더 가동중…
              </div>
            </div>
          )}

          {/* 안내 */}
          {phase === "play" && (
            <div className="pointer-events-none absolute left-3 top-3 z-20 max-w-[280px] rounded-2xl border border-white/10 bg-black/45 p-2.5 backdrop-blur-sm">
              <p className="font-cute text-[12.5px] text-amber-200">
                {selected ? `${itemById(selected).emoji} ${itemById(selected).name} 들고 대기` : "볼주머니에서 물건을 골라라"}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-slate-300">
                {selected
                  ? "빛나는 사각지대를 눌러 쑤셔 넣자. 3초 뒤 그 자리에서 국소 레이더가 발사된다."
                  : "아래 볼주머니에서 물건을 고른 뒤 방 안 마커를 누른다. 물건 없이 누르면 마지막 걸 도로 꺼낸다."}
              </p>
            </div>
          )}

          {phase === "play" && selected && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-4 py-1.5 font-cute text-[13px] text-cyan-100 backdrop-blur-sm">
              🐹 무게 {itemById(selected).volume} · 향 {itemById(selected).scent}
              {itemById(selected).flat ? " · 납작" : ""} — 어디로 숨길까?
            </div>
          )}
        </div>

        {/* ===== 사이드 ===== */}
        <aside className="thin-scroll z-20 w-full shrink-0 space-y-2.5 overflow-y-auto border-t border-white/10 bg-[#080e1c]/90 p-2.5 lg:w-[292px] lg:border-l lg:border-t-0 lg:p-3">
          <SpotInfo
            spot={hoverSpot ? activeSpots.find((s) => s.id === hoverSpot) ?? null : null}
            stashes={stashes}
            selectedItem={selected ? itemById(selected) : null}
          />
          <LogFeed logs={logs} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            <p className="mb-1 font-cute text-[12px] text-slate-200">위험도 계산법</p>
            은폐력 ↓ + 냄새 누출 + 부피 초과 + 납작하지 않은 물건을 얇은 틈에 강요 → 위험도 ↑
            <br />
            <span className="text-emerald-300">31 이하 안전</span> ·{" "}
            <span className="text-amber-300">32~58 아슬아슬</span> ·{" "}
            <span className="text-rose-300">59 이상 즉시 튕김</span>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 lg:block">
            <div className="mb-1 font-cute text-[12px] text-slate-200">오늘의 사각지대</div>
            <div className="flex flex-wrap gap-1">
              {activeSpots.map((s) => {
                const lab = riskLabel(revealed[s.id] ?? -1);
                const known = revealed[s.id] !== undefined;
                return (
                  <span
                    key={s.id}
                    className={`rounded-lg border px-1.5 py-[2px] text-[10px] ${
                      known ? `${lab.ring} ${lab.color}` : "border-white/10 text-slate-400"
                    }`}
                  >
                    {s.emoji} {s.name}
                  </span>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <ItemTray
        items={tray}
        selected={selected}
        onSelect={(id) => setSelected((p) => (p === id ? null : id))}
        disabled={phase !== "play" || busy}
        stashes={stashes}
      />

      {phase === "intro" && (
        <IntroModal
          onStart={() => {
            setStageIndex(0);
            beginStage(0);
          }}
        />
      )}
      {phase === "brief" && <StageModal stage={stage} onStart={startPlay} />}
      {phase === "result" && result && (
        <ResultModal
          res={result}
          isLast={stageIndex >= STAGES.length - 1}
          onNext={nextStage}
          onRetry={retryStage}
        />
      )}
    </div>
  );
}
