import { useState } from "react";
import type { StageDef } from "../game/data";
import { itemById, type ScanResult } from "../game/logic";

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040711]/85 p-3 backdrop-blur-sm">
      <div
        className={`anim-pop thin-scroll max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-white/12 bg-gradient-to-b from-[#101a30] to-[#0a1120] p-5 shadow-2xl sm:p-7 ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function IntroModal({ onStart }: { onStart: () => void }) {
  return (
    <Shell wide>
      <div className="flex flex-col items-center text-center">
        <div className="mb-1 flex items-center gap-2 font-cute text-[13px] tracking-[0.3em] text-cyan-300">
          REVERSE HIDDEN-OBJECT
        </div>
        <h2 className="font-cute text-3xl text-amber-200 sm:text-4xl">역-숨은그림찾기</h2>
        <h3 className="font-cute text-xl text-white sm:text-2xl">감추기 마스터 · Hide The Mess</h3>
        <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-slate-300">
          어지러운 방에서 물건을 <b className="text-white">찾는</b> 게임은 이제 지겹다.
          <br />
          여기선 <b className="text-amber-200">완벽하게 정돈된 방</b>이 무대고, 당신은 그 완벽함을{" "}
          <b className="text-rose-300">몰래 망치는</b> 사막햄스터 <b className="text-white">굴러리</b>다.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card icon="🐹" title="① 볼주머니 선택">
          아래 볼주머니에서 쑤셔 넣을 잡동사니 하나를 고른다. 부피·냄새·납작함이 성패를 가른다.
        </Card>
        <Card icon="🕳️" title="② 사각지대에 밀어넣기">
          방석 밑, 침대 틈새, 책 뒤, 카펫 아래… 마커를 누르면 굴러리가 달려가{" "}
          <b>엉덩이를 방실방실</b> 흔들며 깊숙이 밀어 넣는다.
        </Card>
        <Card icon="🤖" title="③ 3초 후 국소 레이더">
          넣은 자리에서 3초 뒤 레이더가 발사된다. 위험도 59 이상이면 즉시 튕겨 나온다! 전부 숨기면 최종 스캔.
        </Card>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-amber-300/25 bg-amber-400/[0.07] p-3 text-[11.5px] text-amber-100/90 sm:grid-cols-2">
        <p>💡 <b>은폐력</b>이 낮은 곳은 숨겨도 들통나기 쉽다.</p>
        <p>💨 냄새 센 물건은 <b>밀폐 서랍</b> 같은 곳으로.</p>
        <p>📦 한 곳에 <b>부피가 넘치면</b> 틈이 벌어진다.</p>
        <p>🟫 카펫 아래는 <b>납작한 물건</b>만 가능.</p>
      </div>

      <button
        onClick={onStart}
        className="mt-5 w-full rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 py-3.5 font-cute text-lg text-[#2a1500] shadow-lg shadow-orange-900/40 transition hover:brightness-110 active:scale-[0.98]"
      >
        볼주머니 불러들이기 🐹
      </button>
    </Shell>
  );
}

function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-cute text-[13.5px] text-cyan-200">{title}</span>
      </div>
      <p className="text-[11.5px] leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}

export function StageModal({ stage, onStart }: { stage: StageDef; onStart: () => void }) {
  return (
    <Shell>
      <div className="text-center">
        <div className="font-cute text-[12px] tracking-[0.3em] text-cyan-300">{stage.day}</div>
        <h2 className="mt-1 font-cute text-3xl text-white">AI 청소 로봇 「{stage.robotName}」 입실</h2>
        <p className="mt-1 text-[11px] text-slate-400">{stage.robotModel} · 감도 ×{stage.sensitivity}</p>
        <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-slate-300">{stage.brief}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Mini label="남은 시간" value={`${stage.time}초`} />
        <Mini label="잡동사니" value={`${stage.items.length}개`} />
        <Mini label="사각지대" value={`${stage.spots.length}곳`} />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {stage.items.map((id) => {
          const it = itemById(id);
          return (
            <span key={id} className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-200">
              {it.emoji} {it.name}
            </span>
          );
        })}
      </div>
      <button
        onClick={onStart}
        className="mt-5 w-full rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-600 py-3 font-cute text-lg text-[#04202b] shadow-lg shadow-cyan-900/40 transition hover:brightness-110 active:scale-[0.98]"
      >
        감추기 시작!
      </button>
    </Shell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 py-2">
      <div className="text-[9px] tracking-widest text-slate-400">{label}</div>
      <div className="font-cute text-lg text-amber-200">{value}</div>
    </div>
  );
}

export function ResultModal({
  res, isLast, onNext, onRetry,
}: {
  res: ScanResult;
  isLast: boolean;
  onNext: () => void;
  onRetry: () => void;
}) {
  const rankColor =
    res.rank === "S" ? "from-amber-200 to-amber-500 text-[#3a2400]"
    : res.rank === "A" ? "from-cyan-200 to-sky-500 text-[#04202b]"
    : res.rank === "B" ? "from-emerald-200 to-emerald-500 text-[#04201a]"
    : res.rank === "C" ? "from-orange-200 to-orange-500 text-[#331700]"
    : "from-rose-200 to-rose-600 text-[#3a0410]";
  const [shared, setShared] = useState(false);
  const shareText =
    `[역-숨은그림찾기] ${res.rank}랭크 · ${res.total}점 · ` +
    `은폐 ${res.hidden} · 적발 ${res.caught} #숨은그림찾기`;
  const share = () => {
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string }) => Promise<void> };
    if (typeof nav.share === "function") {
      nav.share({ title: "역-숨은그림찾기", text: shareText }).catch(() => { /* dismissed */ });
      return;
    }
    navigator.clipboard?.writeText(shareText).then(() => {
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    }).catch(() => { /* noop */ });
  };

  return (
    <Shell wide>
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="font-cute text-[12px] tracking-[0.3em] text-cyan-300">SCAN COMPLETE</div>
        <div
          className={`grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br font-cute text-5xl shadow-xl ${rankColor}`}
        >
          {res.rank}
        </div>
        <p className="mt-1 text-[12.5px] text-slate-300">{res.rankMsg}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Box label="무사 은폐" v={`${res.hidden}개`} c="text-emerald-300" />
        <Box label="적발" v={`${res.caught}개`} c="text-rose-300" />
        <Box label="방치" v={`${res.abandoned}개`} c="text-amber-300" />
        <Box label="획득 점수" v={`${res.total}`} c="text-cyan-200" />
      </div>

      <div className="mt-3 space-y-1 rounded-2xl border border-white/10 bg-black/25 p-3 text-[12px]">
        <Row l="물건 은폐 점수" v={`+${res.itemScore}`} />
        <Row l="남은 시간 보너스" v={`+${res.timeBonus}`} />
        {res.perfectBonus > 0 && <Row l="완벽 은폐 보너스" v={`+${res.perfectBonus}`} />}
        <Row l="적발·방치 페널티" v={`-${res.penalty}`} bad />
        <div className="mt-1 border-t border-white/10 pt-1">
          <Row l="합계" v={`${res.total}`} big />
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 font-cute text-[13px] text-slate-200">판독 결과</div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {res.items.map((it) => {
            const item = itemById(it.itemId);
            const spot = it.spotId;
            return (
              <div
                key={it.uid}
                className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-[11.5px] ${
                  it.detected ? "border-rose-400/40 bg-rose-500/12 text-rose-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="flex-1 truncate">{item.name}</span>
                <span className="rounded bg-black/40 px-1 text-[10px] text-slate-300">위험 {it.risk}</span>
                <span>{it.detected ? "🚨 적발" : "✅ 은폐"}</span>
                {!spot && <span className="text-[10px] text-slate-400">바닥</span>}
              </div>
            );
          })}
          {res.abandoned > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-2 py-1.5 text-[11.5px] text-amber-100 sm:col-span-2">
              <span className="text-lg">🫥</span>
              <span className="flex-1">볼주머니에 남긴 채 스캔 — 방 한복판에 둔 것과 같다 ({res.abandoned}개)</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onRetry}
          className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 font-cute text-[15px] text-slate-200 transition hover:bg-white/10 active:scale-[0.98]"
        >
          같은 날 다시 감추기
        </button>
        <button
          onClick={share}
          className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 font-cute text-[15px] text-slate-200 transition hover:bg-white/10 active:scale-[0.98]"
        >
          {shared ? "복사됨!" : "기록 공유"}
        </button>
        {isLast ? (
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 py-3 text-center font-cute text-[15px] text-[#2a1500]">
            🏆 감추기 마스터 인증!
          </div>
        ) : (
          <button
            onClick={onNext}
            className="flex-1 rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-600 py-3 font-cute text-[15px] text-[#04202b] shadow-lg shadow-cyan-900/40 transition hover:brightness-110 active:scale-[0.98]"
          >
            다음 날로 →
          </button>
        )}
      </div>
    </Shell>
  );
}

function Box({ label, v, c }: { label: string; v: string; c: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 py-2 text-center">
      <div className="text-[9px] tracking-widest text-slate-400">{label}</div>
      <div className={`font-cute text-xl ${c}`}>{v}</div>
    </div>
  );
}

function Row({ l, v, bad, big }: { l: string; v: string; bad?: boolean; big?: boolean }) {
  return (
    <div className={`flex justify-between ${big ? "font-cute text-[15px] text-white" : "text-slate-300"}`}>
      <span>{l}</span>
      <span className={bad ? "text-rose-300" : big ? "text-amber-200" : "text-slate-200"}>{v}</span>
    </div>
  );
}
