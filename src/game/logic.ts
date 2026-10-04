import { ITEMS, SPOTS, STAGES, RANKS, type ItemDef, type SpotDef } from "./data";

export const itemById = (id: string): ItemDef => {
  const found = ITEMS.find((i) => i.id === id);
  if (!found) throw new Error(`unknown item id: ${id}`);
  return found;
};
export const spotById = (id: string): SpotDef => {
  const found = SPOTS.find((s) => s.id === id);
  if (!found) throw new Error(`unknown spot id: ${id}`);
  return found;
};
export const stageByIndex = (i: number): (typeof STAGES)[number] => STAGES[Math.min(i, STAGES.length - 1)];

export type StashStatus = "pending" | "safe" | "risky" | "busted";

export type Stash = {
  uid: string; // 인스턴스 id
  itemId: string;
  spotId: string;
  risk: number;
  status: StashStatus;
  pingAt: number; // ms timestamp — 이때 국소 레이더가 발사됨
};

let uidSeq = 0;
export const newUid = () => `s${++uidSeq}`;

/** 한 곳에 들어간 총 부피 */
export function volumeIn(stashes: Stash[], spotId: string, extra = 0) {
  return (
    stashes.filter((s) => s.spotId === spotId && s.status !== "busted").reduce((a, s) => a + itemById(s.itemId).volume, 0) + extra
  );
}

/**
 * 국소 레이더 위험도(0~100).
 * 은폐력이 낮을수록 / 냄새가 샐수록 / 부피가 넘칠수록 / 납작하지 않은 물건을 얇은 틈에 넣을수록 위험.
 */
export function calcRisk(
  item: ItemDef,
  spot: SpotDef,
  usedVolume: number,
  sensitivity: number,
  roll: number,
): number {
  let risk = (1 - spot.conceal) * 70;
  risk += Math.max(0, item.scent - spot.scentProof) * 18;
  const over = Math.max(0, usedVolume - spot.capacity);
  risk += over * 26;
  if (spot.flatOnly && !item.flat) risk += 46;
  risk *= sensitivity;
  risk += roll * 11;
  return Math.max(1, Math.min(100, Math.round(risk)));
}

export function statusOf(risk: number): StashStatus {
  if (risk >= 59) return "busted"; // 3초 뒤 즉시 튕겨 나옴
  if (risk >= 32) return "risky"; // 아슬아슬 — 최종 스캔에서 걸릴 확률 존재
  return "safe";
}

export function riskLabel(risk: number) {
  if (risk < 32) return { text: "은폐 성공", color: "text-emerald-300", ring: "border-emerald-400/70", bg: "bg-emerald-500" };
  if (risk < 59) return { text: "아슬아슬", color: "text-amber-300", ring: "border-amber-400/70", bg: "bg-amber-500" };
  return { text: "발각!", color: "text-rose-300", ring: "border-rose-400/70", bg: "bg-rose-500" };
}

/** 최종 스캔에서 걸리는가 */
export function finalDetect(risk: number, roll: number) {
  if (risk >= 50) return true;
  if (risk >= 25) return roll < (risk - 25) / 50;
  return false;
}

export type ScanItem = {
  uid: string;
  itemId: string;
  spotId: string | null;
  detected: boolean;
  risk: number;
};

export type ScanResult = {
  items: ScanItem[];
  hidden: number;
  caught: number;
  abandoned: number;
  itemScore: number;
  penalty: number;
  timeBonus: number;
  perfectBonus: number;
  total: number;
  maxTotal: number;
  ratio: number;
  rank: string;
  rankMsg: string;
};

export function runScan(stashes: Stash[], tray: string[], timeLeft: number, rollFn: () => number = Math.random): ScanResult {
  const items: ScanItem[] = [];
  let itemScore = 0;
  let penalty = 0;
  const maxTotal =
    stashes.reduce((a, s) => a + itemById(s.itemId).score, 0) +
    tray.reduce((a, id) => a + itemById(id).score, 0) +
    400 +
    Math.round(timeLeft) * 3;

  for (const s of stashes) {
    const detected = finalDetect(s.risk, rollFn());
    items.push({ uid: s.uid, itemId: s.itemId, spotId: s.spotId, detected, risk: s.risk });
    if (detected) penalty += Math.round(itemById(s.itemId).score * 0.6);
    else itemScore += itemById(s.itemId).score;
  }
  const abandoned = tray.length;
  penalty += tray.reduce((a, id) => a + itemById(id).score, 0);

  const timeBonus = Math.round(timeLeft) * 3;
  const caught = items.filter((i) => i.detected).length;
  const hidden = items.length - caught;
  const perfectBonus = caught === 0 && abandoned === 0 && items.length > 0 ? 400 : 0;
  const total = Math.max(0, itemScore + timeBonus + perfectBonus - penalty);
  const ratio = items.length + abandoned === 0 ? 0 : hidden / (items.length + abandoned);
  const r = RANKS.find((x) => ratio >= x.min) ?? RANKS[RANKS.length - 1];

  return {
    items, hidden, caught, abandoned, itemScore, penalty, timeBonus, perfectBonus,
    total, maxTotal: Math.max(maxTotal, total), ratio, rank: r.rank, rankMsg: r.msg,
  };
}

/** 볼주머니 상태 문구 */
export function cheekWord(n: number) {
  if (n <= 0) return "볼주머니 비었음 — 이제 정리만!";
  if (n === 1) return "마지막 한 입 남았다";
  if (n <= 3) return "볼주머니가 적당히 빵빵";
  return "볼주머니 최대 팽창 — 뺨이 앞을 가린다";
}
