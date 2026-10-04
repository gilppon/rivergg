import { describe, expect, it } from "vitest";
import { calcRisk, finalDetect, runScan, statusOf } from "./logic";
import { ITEMS, SPOTS } from "./data";

const item = ITEMS[0];
const spot = SPOTS[0];

describe("statusOf 경계값", () => {
  it("31 safe, 32 risky, 58 risky, 59 busted", () => {
    expect(statusOf(31)).toBe("safe");
    expect(statusOf(32)).toBe("risky");
    expect(statusOf(58)).toBe("risky");
    expect(statusOf(59)).toBe("busted");
  });
});

describe("finalDetect 경계값", () => {
  it("50 이상 항상 발각", () => {
    expect(finalDetect(50, 0.99)).toBe(true);
  });
  it("25 미만 절대 발각 아님", () => {
    expect(finalDetect(24.9, 0)).toBe(false);
  });
});

describe("calcRisk 범위", () => {
  it("0~100 클램프", () => {
    const r = calcRisk(item, spot, 0, 1.28, 1);
    expect(r).toBeGreaterThanOrEqual(1);
    expect(r).toBeLessThanOrEqual(100);
  });
});

describe("runScan 결정성", () => {
  it("rollFn 주입 시 재현 가능", () => {
    const stashes: Parameters<typeof runScan>[0] = [];
    const a = runScan(stashes, [], 60, () => 0.5);
    const b = runScan(stashes, [], 60, () => 0.5);
    expect(a.total).toBe(b.total);
  });
});
