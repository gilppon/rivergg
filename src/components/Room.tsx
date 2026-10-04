import { useEffect, useMemo, useRef, useState } from "react";
import { ROOM, BILLBOARD, type SpotDef } from "../game/data";
import { Box3D, Billboard, FloorPlane } from "./Box3D";
import { Hamster, type HamsterState } from "./Hamster";
import { itemById } from "../game/logic";
import type { Stash } from "../game/logic";

const BOOKS = ["#e2604f", "#f0a03c", "#6fae67", "#4f9aa6", "#9a76d8", "#e57f4f", "#3f6b78", "#c85a86"];

export type Ping = { id: string; spotId: string; remain: number; total: number };
export type Float = { id: string; u: number; v: number; y: number; text: string; tone: string };

export type RoomProps = {
  spots: SpotDef[];
  stashes: Stash[];
  activeSpot: string | null;
  hoverSpot: string | null;
  onSpotEnter: (id: string | null) => void;
  onSpotClick: (spot: SpotDef) => void;
  hamster: { u: number; v: number; state: HamsterState; holding: string | null; pouch: number };
  pings: Ping[];
  floats: Float[];
  scanning: boolean;
  robotU: number;
  revealed: Record<string, number>; // spotId -> 보여줄 위험도
  armed: boolean;
  walkMs: number;
};

export function Room(props: RoomProps) {
  const { spots, stashes, activeSpot, hoverSpot, onSpotEnter, onSpotClick, hamster, pings, floats, scanning, robotU, revealed, armed, walkMs } = props;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const fit = () => {
      const k = Math.min(el.clientWidth / 1110, el.clientHeight / 745);
      setScale(Math.max(0.28, Math.min(1.12, k)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const usedVolMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stashes) {
      if (s.status === "busted") continue;
      m.set(s.spotId, (m.get(s.spotId) ?? 0) + itemById(s.itemId).volume);
    }
    return m;
  }, [stashes]);
  const usedVol = (spotId: string) => usedVolMap.get(spotId) ?? 0;

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden" style={{ perspective: "1500px", perspectiveOrigin: "50% 2%" }}>
      <div
        className="absolute left-1/2 top-[47%] p3d"
        style={{ transform: `translate(-50%,-50%) scale3d(${scale},${scale},${scale})`, transformStyle: "preserve-3d" }}
      >
        <div
          className="relative p3d no-sel"
          style={{ width: ROOM.W, height: ROOM.H, transform: `rotateY(-${BILLBOARD}deg)` }}
        >
          {/* ============ 뒷벽 ============ */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,#fbf4e9 0%,#f3e6d4 55%,#e7d5bd 100%)",
              boxShadow: "inset 0 -18px 40px rgba(120,90,60,.13)",
            }}
          >
            {/* 몰딩 */}
            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/90 to-[#e2cead]" />
            <div className="absolute inset-x-0 bottom-0 h-[86px] bg-gradient-to-b from-[#dcc6a6] to-[#cbb18e] border-t border-white/40" />
            {/* 창문 */}
            <div className="absolute" style={{ left: 78, top: 74, width: 290, height: 250 }}>
              <div className="absolute inset-0 rounded-md bg-[#fff8e6] shadow-[0_10px_30px_rgba(120,90,60,.25)] border-[10px] border-[#fbfaf7]" />
              <div
                className="absolute inset-[10px] rounded-sm"
                style={{
                  background:
                    "linear-gradient(180deg,#bfe6ff 0%,#e8f6ff 52%,#d5efc9 52%,#bfe3b2 100%)",
                }}
              >
                <div className="absolute left-[10%] top-[16%] text-lg">☁️</div>
                <div className="absolute left-[52%] top-[9%] text-sm">☁️</div>
                <div className="absolute right-[12%] top-[24%] text-base">☀️</div>
              </div>
              <div className="absolute left-1/2 top-[10px] bottom-[10px] w-[9px] -translate-x-1/2 bg-[#fbfaf7]" />
              <div className="absolute top-1/2 left-[10px] right-[10px] h-[9px] -translate-y-1/2 bg-[#fbfaf7]" />
              <div className="absolute -bottom-3 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-b-lg bg-[#e2cead]" />
            </div>
            {/* 커튼 */}
            <div className="absolute anim-sway" style={{ left: 34, top: 60, width: 54, height: 350, transformOrigin: "50% 0%" }}>
              <div
                className="h-full w-full rounded-b-lg"
                style={{
                  background:
                    "repeating-linear-gradient(90deg,#7fa8c9 0 7px,#8fb6d6 7px 14px,#6d97ba 14px 20px)",
                  boxShadow: "inset -6px 0 12px rgba(30,50,70,.25)",
                }}
              />
            </div>
            <div className="absolute anim-sway" style={{ left: 352, top: 60, width: 54, height: 350, transformOrigin: "50% 0%", animationDelay: "-1.6s" }}>
              <div
                className="h-full w-full rounded-b-lg"
                style={{
                  background:
                    "repeating-linear-gradient(90deg,#7fa8c9 0 7px,#8fb6d6 7px 14px,#6d97ba 14px 20px)",
                  boxShadow: "inset 6px 0 12px rgba(30,50,70,.25)",
                }}
              />
            </div>
            {/* 액자 (책장 위쪽) */}
            <div className="absolute rounded-lg border-[7px] border-[#8b6b4a] bg-[#fdfaf3] shadow-lg" style={{ left: 452, top: 52, width: 104, height: 128 }}>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🐹</div>
            </div>
            <div className="absolute rounded-lg border-[7px] border-[#a3855f] bg-[#fdfaf3] shadow-lg" style={{ left: 576, top: 74, width: 96, height: 96 }}>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🌿</div>
            </div>
            {/* 벽시계 */}
            <div className="absolute rounded-full bg-[#fffdf7] border-[6px] border-[#6f5c48] shadow-lg flex items-center justify-center" style={{ left: 760, top: 46, width: 78, height: 78 }}>
              <div className="text-[10px] font-bold text-[#6f5c48]">12</div>
              <div className="absolute h-[22px] w-[3px] bg-[#43362a] rounded" style={{ top: 16, transformOrigin: "bottom" }} />
              <div className="absolute h-[17px] w-[3px] bg-[#43362a] rounded" style={{ top: 21, left: 32, transform: "rotate(120deg)", transformOrigin: "50% 100%" }} />
              <div className="absolute h-2 w-2 rounded-full bg-[#c94f4f]" />
            </div>
            {/* 오른쪽 어두운 컷트림 */}
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#00000022] to-transparent" />
          </div>

          {/* ============ 왼쪽 벽 ============ */}
          <div
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: ROOM.D,
              height: ROOM.H,
              transformOrigin: "left top",
              transform: `translate3d(0,0,${ROOM.D}px) rotateY(90deg)`,
              background: "linear-gradient(90deg,#e9dcc6 0%,#f6eede 45%,#f9f3e7 100%)",
              boxShadow: "inset -14px 0 30px rgba(120,90,60,.14)",
            }}
          >
            {/* 현관문 */}
            <div className="absolute rounded-t-md bg-gradient-to-b from-[#dfe7ef] to-[#c3cfdb] border-[6px] border-[#f4efe4]" style={{ left: 62, top: 96, width: 176, height: 424 }}>
              <div className="absolute left-1/2 top-6 h-[130px] w-[92px] -translate-x-1/2 rounded bg-[#b9c8d6]/70 border-2 border-[#9fb1c2]" />
              <div className="absolute left-1/2 top-[186px] h-[130px] w-[92px] -translate-x-1/2 rounded bg-[#b9c8d6]/70 border-2 border-[#9fb1c2]" />
              <div className="absolute right-3 top-[220px] h-3 w-3 rounded-full bg-[#f0d78a]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[86px] bg-gradient-to-b from-[#dcc6a6] to-[#cbb18e] border-t border-white/40" />
          </div>

          {/* ============ 바닥 ============ */}
          <div
            className="absolute"
            style={{
              left: 0,
              top: ROOM.H,
              width: ROOM.W,
              height: ROOM.D,
              transformOrigin: "left top",
              transform: "rotateX(90deg)",
              background:
                "linear-gradient(180deg,#c99a63 0%,#d8ac74 40%,#cfa068 100%)",
            }}
          >
            {/* 원목 마루 무늬 */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg,rgba(90,55,25,.30) 0 2px,transparent 2px 58px),repeating-linear-gradient(90deg,rgba(90,55,25,.16) 0 2px,transparent 2px 132px)",
              }}
            />
            {/* 창문빛 */}
            <div
              className="absolute opacity-40"
              style={{
                left: 60, top: 20, width: 330, height: 300, transform: "skewX(-16deg)",
                background: "radial-gradient(closest-side,rgba(255,250,215,.85),rgba(255,250,215,0))",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#8a5f36]/50 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#4a3220]/40 to-transparent" />
          </div>

          {/* ============ 가구 ============ */}
          {/* 카펫 */}
          <FloorPlane u={40} v={250} w={262} d={132} hOffset={2} className="rounded-[10px]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%,#f0e2cd 0%,#e6cfae 62%,#d8bb92 100%)",
              boxShadow: "0 0 0 8px #c9a678 inset, 0 0 0 12px #efe0c6 inset",
            }}
          >
            <div className="absolute inset-[26px] rounded-full border-2 border-dashed border-[#c09a6c]/60" />
          </FloorPlane>

          {/* 침대 */}
          <Box3D
            u={30} v={20} w={330} d={230} h={100}
            front="bg-gradient-to-b from-[#c9a273] to-[#a97f4f]"
            top="bg-gradient-to-b from-[#f6f1e6] to-[#e8dfd0]"
            right="bg-gradient-to-b from-[#a37a4c] to-[#8b6539]"
            radius={8}
          >
            <div className="absolute inset-0">
              {/* 매트리스 */}
              <div className="absolute left-2 right-2 top-2 bottom-[26px] rounded-[6px] bg-gradient-to-b from-[#fdfbf5] to-[#e9e2d3]" />
              {/* 이불 */}
              <div className="absolute left-0 right-0 top-[16px] bottom-[26px] rounded-b-[6px]"
                style={{ background: "linear-gradient(180deg,#8fd0d8 0%,#7bbcc6 55%,#6aa7b2 100%)" }}>
                <div className="absolute inset-x-0 top-0 h-3 bg-white/35" />
                <div className="absolute inset-x-0 bottom-0 h-6 bg-[#5d97a1]/70" />
              </div>
              {/* 프레임 */}
              <div className="absolute inset-x-0 bottom-0 h-[26px] bg-gradient-to-b from-[#b98d5c] to-[#8f6840] rounded-b-[8px]" />
            </div>
          </Box3D>
          {/* 침대 베개 (윗면 위 아이템) */}
          <FloorPlane u={252} v={34} w={104} d={70} hOffset={103} className="rounded-[16px]"
            style={{ background: "linear-gradient(180deg,#ffffff,#ece4d4)", boxShadow: "0 4px 8px rgba(0,0,0,.15)" }} />

          {/* 책장 */}
          <Box3D
            u={430} v={10} w={300} d={70} h={310}
            front="bg-gradient-to-b from-[#e8d9bd] to-[#cbb693]"
            top="bg-gradient-to-b from-[#f2e7d2] to-[#dccbb0]"
            right="bg-gradient-to-b from-[#b39a76] to-[#8f7a5d]"
            radius={6}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-[8px] rounded bg-[#6b4f33]/85" />
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="absolute left-[10px] right-[10px]" style={{ top: 16 + row * 72, height: 58 }}>
                  <div className="absolute inset-0 flex items-end gap-[3px] px-1">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const k = (row * 16 + i) % BOOKS.length;
                      const h = 38 + ((i * 37 + row * 13) % 18);
                      const lean = (i * 29 + row * 7) % 11 === 0;
                      return (
                        <div key={i}
                          style={{
                            width: 11 + ((i * 3) % 6),
                            height: h,
                            background: BOOKS[k],
                            borderRadius: "2px 2px 0 0",
                            transform: lean ? "rotate(9deg) translateY(3px)" : undefined,
                            transformOrigin: "bottom left",
                            boxShadow: "inset -3px 0 0 rgba(0,0,0,.18)",
                          }} />
                      );
                    })}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-[6px] bg-[#8a6a4a]" />
                </div>
              ))}
            </div>
          </Box3D>

          {/* 소파 */}
          <Box3D
            u={430} v={220} w={350} d={150} h={115}
            front="bg-gradient-to-b from-[#5f7f8c] to-[#48626d]"
            top="bg-gradient-to-b from-[#7fa2ae] to-[#6a8b98]"
            right="bg-gradient-to-b from-[#3f5761] to-[#33464f]"
            radius={10}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-x-[6px] top-[10px] bottom-[26px] flex gap-[6px]">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex-1 rounded-[10px]"
                    style={{ background: `linear-gradient(180deg,#8fb4c0,#6d919d)` }} />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-[26px] bg-gradient-to-b from-[#4b6570] to-[#3a4f58] rounded-b-[10px]" />
            </div>
          </Box3D>
          {/* 소파 등받이 (윗면 뒤쪽) */}
          <FloorPlane u={436} v={222} w={338} d={40} hOffset={118} className="rounded-[10px]"
            style={{ background: "linear-gradient(180deg,#8fb4c0,#658793)", boxShadow: "0 4px 10px rgba(0,0,0,.2)" }} />

          {/* 책상 */}
          <Box3D
            u={800} v={40} w={150} d={190} h={110}
            front="bg-gradient-to-b from-[#e6d3b3] to-[#c9b28c]"
            top="bg-gradient-to-b from-[#f6ecd8] to-[#e5d6ba]"
            right="bg-gradient-to-b from-[#c4ac86] to-[#a08b6a]"
            radius={6}
          >
            <div className="absolute inset-0">
              <div className="absolute left-0 right-0 top-0 h-[16px] bg-[#fbf3e2]" />
              <div className="absolute left-[10px] right-[10px] top-[26px] bottom-[16px] rounded bg-[#d9c7a6] border border-[#b49b74]" />
              <div className="absolute left-1/2 top-[52px] h-3 w-14 -translate-x-1/2 rounded bg-[#8a6f4c]" />
              <div className="absolute inset-x-0 bottom-0 h-[16px] bg-[#b89c72]" />
            </div>
          </Box3D>
          {/* 서랍장 */}
          <Box3D
            u={790} v={270} w={150} d={110} h={150}
            front="bg-gradient-to-b from-[#f0e2ca] to-[#d8c6a8]"
            top="bg-gradient-to-b from-[#fbf5e7] to-[#e8dcc4]"
            right="bg-gradient-to-b from-[#c2ae8c] to-[#a89473]"
            radius={8}
          >
            <div className="absolute inset-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="absolute left-[8px] right-[8px] rounded-[5px] border border-[#b6a281] bg-gradient-to-b from-[#fdf8ec] to-[#e9dcc2]"
                  style={{ top: 8 + i * 46, height: 38 }}>
                  <div className="absolute left-1/2 top-1/2 h-[5px] w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a58a5f]" />
                </div>
              ))}
            </div>
          </Box3D>

          {/* 화분 */}
          <Box3D
            u={320} v={270} w={90} d={90} h={100}
            front="bg-gradient-to-b from-[#d98b5f] to-[#b9683f]"
            top="bg-gradient-to-b from-[#8a6a4a] to-[#6f543a]"
            right="bg-gradient-to-b from-[#b56e45] to-[#96532f]"
            radius={12}
          />
          {/* 방석 */}
          <Box3D
            u={110} v={270} w={120} d={110} h={50}
            front="bg-gradient-to-b from-[#e2705f] to-[#c25445]"
            top="bg-gradient-to-b from-[#f08a76] to-[#e06b58]"
            right="bg-gradient-to-b from-[#c65847] to-[#a5443a]"
            radius={22}
          />

          {/* 화분 잎 (빌보드) */}
          <Billboard u={348} v={286} y={168} width={140}>
            <div className="flex justify-center">
              <div className="anim-sway text-[54px] leading-none" style={{ transformOrigin: "50% 92%" }}>🌿</div>
            </div>
          </Billboard>

          {/* 책상 위 조명 + 책 (빌보드) */}
          <Billboard u={872} v={120} y={150} width={150}>
            <div className="flex justify-center gap-3">
              <div className="text-[34px] leading-none">💡</div>
              <div className="text-[26px] leading-none">📖</div>
            </div>
          </Billboard>

          {/* ============ 사각지대 마커 ============ */}
          {spots.map((s) => {
            const vol = usedVol(s.id);
            const full = vol >= s.capacity;
            const st = stashes.filter((x) => x.spotId === s.id && x.status !== "busted");
            const isHover = hoverSpot === s.id;
            const isActive = activeSpot === s.id;
            const ping = pings.find((p) => p.spotId === s.id);
            const risk = revealed[s.id];
            const stink = st.some((x) => itemById(x.itemId).scent > s.scentProof);
            return (
              <div key={s.id} className="pointer-events-none absolute inset-0 p3d">
                {/* 바닥 하이라이트 */}
                <FloorPlane
                  u={s.u - 52} v={s.v - 52} w={104} d={104} hOffset={s.rh}
                  className="rounded-full"
                  style={{
                    background: isActive
                      ? "radial-gradient(closest-side,rgba(56,232,255,.55),rgba(56,232,255,0))"
                      : isHover
                        ? "radial-gradient(closest-side,rgba(255,214,102,.5),rgba(255,214,102,0))"
                        : "radial-gradient(closest-side,rgba(255,255,255,.22),rgba(255,255,255,0))",
                    transition: "background .2s",
                  }}
                />
                <Billboard u={s.u} v={s.v} y={s.my + 8} width={172} className="pointer-events-auto">
                  <button
                    type="button"
                    aria-label={`${s.name} 숨기기${armed ? " (선택 가능)" : ""}`}
                    className="flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 anim-marker"
                    onMouseEnter={() => onSpotEnter(s.id)}
                    onMouseLeave={() => onSpotEnter(null)}
                    onFocus={() => onSpotEnter(s.id)}
                    onBlur={() => onSpotEnter(null)}
                    onClick={() => onSpotClick(s)}
                    style={{ cursor: armed ? "pointer" : "default" }}
                  >
                    {/* 스템 */}
                    <div className="h-5 w-[2px] bg-gradient-to-b from-white/15 to-white/70" />
                    <div className="flex items-center gap-1">
                      {/* 국소 레이더 카운트다운 */}
                      {ping && (
                        <div className="relative h-8 w-8">
                          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="rgba(0,0,0,.5)" stroke="rgba(255,255,255,.2)" strokeWidth="4" />
                            <circle
                              cx="18" cy="18" r="15" fill="none" stroke="#38e8ff" strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={`${(ping.remain / ping.total) * 94.2} 94.2`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-cute text-[11px] text-cyan-200">
                            {Math.ceil(ping.remain / 1000)}
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-cyan-300/70 anim-ping-ring" />
                        </div>
                      )}

                      <div
                        className={`relative flex items-center gap-1.5 rounded-xl border px-2 py-1 backdrop-blur-md transition ${
                          isActive
                            ? "border-cyan-300 bg-cyan-500/30 shadow-[0_0_22px_rgba(56,232,255,.7)]"
                            : isHover
                              ? "border-amber-300/90 bg-amber-400/25"
                              : "border-white/25 bg-black/35"
                        }`}
                      >
                        <span className="text-xl leading-none">{s.emoji}</span>
                        <span className="font-cute text-[15px] leading-none text-white">{s.name}</span>
                        {full && (
                          <span className="rounded bg-rose-500/90 px-1 text-[10px] font-bold leading-4 text-white">꽉</span>
                        )}
                        {stink && <span className="anim-stink absolute -top-3.5 right-0 text-[11px]">💨</span>}
                      </div>

                      {/* 위험도 공개 */}
                      {risk !== undefined && !ping && (
                        <div
                          className={`rounded-md px-1 py-[2px] font-cute text-[13px] leading-none ${
                            risk < 32
                              ? "bg-emerald-500/85 text-white"
                              : risk < 59
                                ? "bg-amber-500/90 text-black"
                                : "bg-rose-600/90 text-white"
                          }`}
                        >
                          {risk}
                        </div>
                      )}
                    </div>

                    {/* 숨긴 물건들 */}
                    {st.length > 0 && (
                      <div className="mt-0.5 flex items-center gap-0.5">
                        {st.map((x) => (
                          <span
                            key={x.uid}
                            className={`rounded-md border px-[3px] text-[13px] leading-5 ${
                              x.status === "safe"
                                ? "border-emerald-400/70 bg-emerald-500/25"
                                : x.status === "risky"
                                  ? "border-amber-400/70 bg-amber-500/25"
                                  : "border-white/20 bg-black/40"
                            }`}
                            title={itemById(x.itemId).name}
                          >
                            {itemById(x.itemId).emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 용량 게이지 */}
                    <div className="mt-1 h-[5px] w-[70px] overflow-hidden rounded-full bg-black/45">
                      <div
                        className={`h-full rounded-full transition-all ${full ? "bg-rose-400" : "bg-cyan-300"}`}
                        style={{ width: `${Math.min(100, (vol / s.capacity) * 100)}%` }}
                      />
                    </div>
                  </button>
                </Billboard>
              </div>
            );
          })}

          {/* ============ 햄스터 ============ */}
          <Billboard
            u={hamster.u}
            v={hamster.v}
            y={128}
            width={160}
            style={{ transition: `left ${walkMs}ms linear, transform ${walkMs}ms linear` }}
          >
            <div className={`flex justify-center ${hamster.state === "walk" ? "anim-hop" : ""}`}>
              <Hamster size={148} state={hamster.state} pouch={hamster.pouch} holding={hamster.holding} />
            </div>
          </Billboard>

          {/* ============ 청소 로봇 (빌보드) ============ */}
          {scanning && (
            <Billboard u={robotU} v={404} y={196} width={210} className="anim-pop">
              <div className="flex flex-col items-center">
                <div className="h-4 w-[3px] bg-slate-400" />
                <div className="h-3.5 w-3.5 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]" />
                <div className="mt-0.5 w-[152px] rounded-2xl border-2 border-slate-200/70 bg-gradient-to-b from-slate-50 to-slate-300 p-2 shadow-2xl">
                  <div className="flex h-9 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0d1522]">
                    <div className="anim-eye flex gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#38e8ff]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]" />
                    </div>
                  </div>
                  <div className="mt-1.5 rounded bg-cyan-400/85 text-center font-cute text-[10px] leading-4 text-[#062028]">
                    SCANNING
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-400/50">
                    <div className="anim-dash h-full w-full" />
                  </div>
                </div>
                <div className="h-4 w-[124px] rounded-b-xl bg-slate-500" />
                <div className="h-3 w-[110px] rounded-full bg-black/30 blur-[2px]" />
              </div>
            </Billboard>
          )}

          {/* ============ 피드백 텍스트 ============ */}
          {floats.map((f) => (
            <Billboard key={f.id} u={f.u} v={f.v} y={f.y} width={240}>
              <div className="flex justify-center">
                <div className={`anim-float-up whitespace-nowrap rounded-lg px-2 py-[2px] font-cute text-[15px] ${f.tone}`}>
                  {f.text}
                </div>
              </div>
            </Billboard>
          ))}
        </div>
      </div>
    </div>
  );
}


