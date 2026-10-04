import type { ItemDef, SpotDef, StageDef } from "../game/data";
import { itemById, cheekWord, volumeIn, type Stash } from "../game/logic";

/* ---------------- 상단 바 ---------------- */
export function TopBar({
  stage, timeLeft, totalScore, bestScore, hidden, caught, onScan, canScan,
}: {
  stage: StageDef;
  timeLeft: number;
  totalScore: number;
  bestScore: number;
  hidden: number;
  caught: number;
  onScan: () => void;
  canScan: boolean;
}) {
  const urgent = timeLeft <= 15;
  const m = Math.floor(timeLeft / 60);
  const s = Math.floor(timeLeft % 60);
  return (
    <header className="z-30 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#0b1224]/90 px-3 py-2 backdrop-blur-md sm:px-5">
      <div className="flex items-center gap-2.5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-xl shadow-lg shadow-orange-900/40">
          🐹
        </div>
        <div className="leading-tight">
          <h1 className="font-cute text-[15px] text-amber-200 sm:text-lg">
            역-숨은그림찾기 <span className="text-white">감추기 마스터</span>
          </h1>
          <p className="text-[10px] text-slate-400 sm:text-[11px]">
            {stage.day} · {stage.robotName} <span className="text-slate-500">{stage.robotModel}</span>
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Stat label="은폐" value={`${hidden}`} tone="text-emerald-300" />
        <Stat label="노출위험" value={`${caught}`} tone="text-rose-300" />
        <Stat label="누적" value={`${totalScore}`} tone="text-amber-200" />
        {bestScore > 0 && <Stat label="최고" value={`${bestScore}`} tone="text-slate-300" />}
        <div
          className={`rounded-xl border px-3 py-1.5 text-center ${urgent ? "border-rose-400/70 bg-rose-500/20 anim-glow" : "border-white/15 bg-white/5"}`}
        >
          <div className="text-[9px] tracking-widest text-slate-400">스캔까지</div>
          <div className={`font-cute text-lg leading-none ${urgent ? "text-rose-200" : "text-cyan-200"}`}>
            {m}:{String(s).padStart(2, "0")}
          </div>
        </div>
        <button
          onClick={onScan}
          disabled={!canScan}
          className={`rounded-xl px-3 py-2 font-cute text-sm transition ${
            canScan
              ? "bg-gradient-to-br from-cyan-400 to-sky-600 text-[#04202b] shadow-lg shadow-cyan-900/40 hover:brightness-110 active:scale-95"
              : "cursor-not-allowed bg-white/5 text-slate-500"
          }`}
        >
          🤖 스캔 유도
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-center sm:block">
      <div className="text-[9px] tracking-widest text-slate-400">{label}</div>
      <div className={`font-cute text-lg leading-none ${tone}`}>{value}</div>
    </div>
  );
}

/* ---------------- 볼주머니 트레이 ---------------- */
export function ItemTray({
  items, selected, onSelect, disabled, stashes,
}: {
  items: string[];
  selected: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
  stashes: Stash[];
}) {
  const max = items.length + stashes.length || 1;
  const pouch = items.length / max;
  return (
    <div className="z-30 border-t border-white/10 bg-[#080e1c]/95 px-3 py-2.5 backdrop-blur-md sm:px-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-cute text-[13px] text-amber-200">볼주머니</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-500"
            style={{ width: `${Math.max(3, pouch * 100)}%` }}
          />
        </div>
        <span className="hidden text-[11px] text-slate-400 sm:block">{cheekWord(items.length)}</span>
      </div>
      <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
        {items.length === 0 && (
          <div className="flex h-[74px] w-full items-center justify-center rounded-xl border border-dashed border-emerald-400/40 bg-emerald-500/10 text-[12px] text-emerald-200">
            볼주머니 비움! 이제 로봇을 불러볼까?
          </div>
        )}
        {items.map((id) => {
          const it = itemById(id);
          const on = selected === id;
          return (
            <button
              key={id}
              onClick={() => !disabled && onSelect(id)}
              disabled={disabled}
              className={`group relative w-[122px] shrink-0 rounded-2xl border p-2 text-left transition ${
                on
                  ? "border-cyan-300 bg-cyan-500/20 shadow-[0_0_18px_rgba(56,232,255,.45)] -translate-y-1"
                  : "border-white/12 bg-white/5 hover:border-amber-300/60 hover:-translate-y-0.5"
              } ${disabled ? "opacity-45" : ""}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[26px] leading-none">{it.emoji}</span>
                {on && <span className="rounded bg-cyan-300 px-1 text-[9px] font-bold text-[#04202b]">선택</span>}
              </div>
              <div className="mt-1 truncate text-[11px] font-bold text-slate-100">{it.name}</div>
              <div className="mt-1 flex items-center gap-1">
                <Tag>부피{it.volume}</Tag>
                {it.scent > 0 ? <Tag tone={it.scent >= 3 ? "bg-rose-500/30 text-rose-200" : "bg-amber-500/25 text-amber-200"}>💨{it.scent}</Tag> : null}
                {it.flat && <Tag tone="bg-sky-500/25 text-sky-200">납작</Tag>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Tag({ children, tone = "bg-white/10 text-slate-300" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`rounded px-1 text-[9px] font-bold leading-4 ${tone}`}>{children}</span>;
}

/* ---------------- 사각지대 정보 카드 ---------------- */
export function SpotInfo({
  spot, stashes, selectedItem,
}: {
  spot: SpotDef | null;
  stashes: Stash[];
  selectedItem: ItemDef | null;
}) {
  if (!spot) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-slate-400">
        <p className="mb-1 font-cute text-[13px] text-slate-200">사각지대를 노려라</p>
        방 안의 <b className="text-cyan-200">마커</b>에 물건을 쑤셔 넣는다. 넣고 3초 뒤 그 자리에서{" "}
        <b className="text-cyan-200">국소 레이더</b>가 발사된다 — 위험도가 높으면 그대로 튕겨 나온다.
        <br />
        마커에 마우스를 올리면 은폐력·냄새 차단·수용 공간을 확인할 수 있다.
      </div>
    );
  }
  const used = volumeIn(stashes, spot.id);
  const warn: string[] = [];
  if (selectedItem) {
    if (used + selectedItem.volume > spot.capacity) warn.push("부피가 넘친다 — 다른 곳으로!");
    if (selectedItem.scent > spot.scentProof) warn.push("냄새가 밖으로 샌다 (💨 밀폐 필요)");
    if (spot.flatOnly && !selectedItem.flat) warn.push("여기는 납작한 물건만 들어간다!");
  }
  const hiddenHere = stashes.filter((s) => s.spotId === spot.id && s.status !== "busted");

  return (
    <div className="rounded-2xl border border-cyan-300/25 bg-cyan-500/[0.07] p-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{spot.emoji}</span>
        <span className="font-cute text-[15px] text-white">{spot.name}</span>
        <span className="ml-auto rounded-md bg-black/40 px-1.5 py-[2px] text-[10px] text-cyan-200">
          {used}/{spot.capacity} 부피
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{spot.hint}</p>
      <div className="mt-2 space-y-1.5">
        <Bar label="은폐력" v={spot.conceal} from="from-emerald-400" to="to-emerald-200" />
        <Bar label="냄새 차단" v={spot.scentProof / 3} from="from-rose-500" to="to-amber-300" />
      </div>
      {hiddenHere.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {hiddenHere.map((s) => (
            <span key={s.uid} className="rounded-md border border-white/15 bg-black/30 px-1.5 text-[10px] text-slate-200">
              {itemById(s.itemId).emoji} {itemById(s.itemId).name}
            </span>
          ))}
        </div>
      )}
      {warn.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {warn.map((w) => (
            <li key={w} className="rounded-lg bg-rose-500/20 px-2 py-1 text-[11px] text-rose-200">
              ⚠ {w}
            </li>
          ))}
        </ul>
      ) : selectedItem ? (
        <div className="mt-2 rounded-lg bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-200">
          ✅ {selectedItem.name} — 들어갈 수 있다. 햄스터 엉덩이를 믿어라!
        </div>
      ) : null}
    </div>
  );
}

function Bar({ label, v, from, to }: { label: string; v: number; from: string; to: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[10px] text-slate-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
        <div className={`h-full rounded-full bg-gradient-to-r ${from} ${to}`} style={{ width: `${Math.min(100, v * 100)}%` }} />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] text-slate-400">{Math.round(v * 100)}</span>
    </div>
  );
}

/* ---------------- 로그 ---------------- */
export function LogFeed({ logs }: { logs: { id: string; text: string; tone: string }[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-2.5">
      <div className="mb-1 font-cute text-[12px] text-slate-300">감추기 기록</div>
      <div className="thin-scroll h-[92px] space-y-1 overflow-y-auto pr-1">
        {logs.length === 0 && <p className="text-[11px] text-slate-500">아직 조용하다….</p>}
        {logs.map((l, i) => (
          <p key={l.id} className={`text-[11px] leading-tight ${i === 0 ? "opacity-100" : "opacity-60"} ${l.tone}`}>
            · {l.text}
          </p>
        ))}
      </div>
    </div>
  );
}
