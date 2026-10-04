/* =========================================================
   역-숨은그림찾기 : 감추기 마스터  —  게임 데이터
   ========================================================= */

/** 방 내부 크기 (CSS 3D 좌표, px) */
export const ROOM = { W: 980, H: 520, D: 430 };
/** 방향 보정값 (씬이 rotateY(-14deg) 이므로 빌보드는 +14deg) */
export const BILLBOARD = 14;

export type ItemDef = {
  id: string;
  name: string;
  emoji: string;
  volume: number; // 부피
  scent: number; // 냄새 강도 0~3
  flat: boolean; // 납작한 물건인가 (카펫·쿠션 아래 가능)
  score: number;
  note: string;
};

export const ITEMS: ItemDef[] = [
  { id: "chip", name: "반쯤 남은 감자칩", emoji: "🍟", volume: 1, scent: 2, flat: true, score: 120, note: "기름 냄새가 은은하게 배어남" },
  { id: "sock", name: "3일 신은 양말", emoji: "🧦", volume: 1, scent: 3, flat: true, score: 150, note: "향의 대가" },
  { id: "choco", name: "녹다 만 초콜릿", emoji: "🍫", volume: 1, scent: 2, flat: false, score: 130, note: "붙는다. 절대 카펫 아래 금지" },
  { id: "tissue", name: "구겨진 휴지 무더기", emoji: "🧻", volume: 2, scent: 0, flat: true, score: 100, note: "냄새는 없지만 부피가 큼" },
  { id: "crumb", name: "과자 부스러기", emoji: "🍪", volume: 1, scent: 1, flat: true, score: 110, note: "쏟아지기 쉬운 최약체" },
  { id: "can", name: "반쯤 남은 콜라 캔", emoji: "🥫", volume: 1, scent: 1, flat: false, score: 140, note: "흔들리면 분수가 된다" },
  { id: "comic", name: "만화책 서른두 권", emoji: "📖", volume: 2, scent: 0, flat: true, score: 90, note: "단단해서 틈을 벌린다" },
  { id: "cable", name: "이어폰·충전선 뭉치", emoji: "🎧", volume: 1, scent: 0, flat: false, score: 120, note: "어차피 3초 뒤 얽혀 있음" },
  { id: "pizza", name: "피자 크러스트 모음", emoji: "🍕", volume: 2, scent: 2, flat: false, score: 170, note: "차마 버리지 못한 슬픔" },
  { id: "lunch", name: "하루 지난 반찬통", emoji: "🍱", volume: 2, scent: 3, flat: false, score: 200, note: "밀봉 없이는 방 전체가 아우성" },
];

export type SpotDef = {
  id: string;
  name: string;
  emoji: string;
  u: number; // 마커 가로 위치 (바닥 x)
  v: number; // 마커 깊이 (벽에서부터)
  my: number; // 마커 높이 (마커 최상단, 바닥에서부터)
  hv: number; // 햄스터가 서는 깊이
  rh: number; // 하이라이트 링 높이 (가구 윗면)
  capacity: number; // 수용 부피
  conceal: number; // 은폐력 0~1
  scentProof: number; // 차단 가능 냄새
  flatOnly?: boolean; // 납작한 물건만
  hint: string;
};

export const SPOTS: SpotDef[] = [
  {
    id: "bedGap",
    name: "침대 틈새",
    emoji: "🛏️",
    u: 70, v: 120, my: 195, hv: 262, rh: 102,
    capacity: 3, conceal: 0.9, scentProof: 2,
    hint: "매트리스와 벽 사이 4cm. 햄스터 몸통 크기라 딱.",
  },
  {
    id: "cushion",
    name: "방석 밑",
    emoji: "🟥",
    u: 170, v: 322, my: 145, hv: 395, rh: 52,
    capacity: 2, conceal: 0.93, scentProof: 1,
    hint: "두꺼운 폭신 방석. 무게가 눌러주지만 냄새는 새어 나온다.",
  },
  {
    id: "shelfBooks",
    name: "책장 책 뒤",
    emoji: "📚",
    u: 575, v: 45, my: 405, hv: 110, rh: 312,
    capacity: 2, conceal: 0.7, scentProof: 1,
    hint: "시리즈물 만화를 세워두면 틈이 숨는다. 다만 로봇은 책장을 좋아한다.",
  },
  {
    id: "drawer",
    name: "서랍장 안",
    emoji: "🗄️",
    u: 865, v: 322, my: 245, hv: 395, rh: 152,
    capacity: 3, conceal: 0.96, scentProof: 3,
    hint: "밀폐 서랍! 냄새 완전 차단. 단, 로봇이 서랍을 열 확률도 있다.",
  },
  {
    id: "sofaGap",
    name: "소파 쿠션 틈",
    emoji: "🛋️",
    u: 600, v: 292, my: 215, hv: 385, rh: 120,
    capacity: 2, conceal: 0.86, scentProof: 2,
    hint: "쿠션을 다시 눌러두면 틈이 사라진다. 동전의 성지.",
  },
  {
    id: "rug",
    name: "카펫 아래",
    emoji: "🟫",
    u: 250, v: 352, my: 195, hv: 395, rh: 6,
    capacity: 2, conceal: 0.55, scentProof: 0, flatOnly: true,
    hint: "납작한 것만! 볼륨 있는 물건을 넣으면 카펫이 봉곳해진다.",
  },
  {
    id: "curtain",
    name: "커튼 뒤",
    emoji: "🪟",
    u: 372, v: 90, my: 195, hv: 390, rh: 5,
    capacity: 2, conceal: 0.72, scentProof: 0,
    hint: "주름 안에 숨기 좋지만 천은 냄새를 그대로 뿜는다.",
  },
  {
    id: "plant",
    name: "화분 밑 받침",
    emoji: "🪴",
    u: 362, v: 318, my: 195, hv: 378, rh: 102,
    capacity: 1, conceal: 0.62, scentProof: 1,
    hint: "받침과 화분 사이 아주 얇은 공간. 하나가 한계.",
  },
  {
    id: "deskDrawer",
    name: "책상 2단 서랍",
    emoji: "💡",
    u: 872, v: 130, my: 205, hv: 395, rh: 112,
    capacity: 2, conceal: 0.9, scentProof: 2,
    hint: "문구 서랍. 클립과 지우개가 이미 지키고 있다.",
  },
];

export type StageDef = {
  id: number;
  day: string;
  robotName: string;
  robotModel: string;
  sensitivity: number; // 로봇 감도 (1 = 기준)
  time: number; // 제한 시간(초)
  items: string[];
  spots: string[];
  brief: string;
};

export const STAGES: StageDef[] = [
  {
    id: 1,
    day: "1일차",
    robotName: "미니멀",
    robotModel: "MODEL M-1 · 기본 감도",
    sensitivity: 0.75,
    time: 95,
    items: ["tissue", "comic", "chip", "cable"],
    spots: ["bedGap", "cushion", "shelfBooks", "drawer", "sofaGap", "deskDrawer"],
    brief: "새 가족이 도착했다. 아직 눈이 흐릿한 입문용 로봇. 볼주머니 속 잡동사니를 사각지대에 쑤셔 넣어라!",
  },
  {
    id: 2,
    day: "4일차",
    robotName: "스캐너",
    robotModel: "MODEL S-4 · 냄새 센서 탑재",
    sensitivity: 1.0,
    time: 85,
    items: ["chip", "sock", "choco", "crumb", "can", "comic"],
    spots: ["bedGap", "cushion", "shelfBooks", "drawer", "sofaGap", "deskDrawer", "rug", "curtain"],
    brief: "햄스터 냄새를 학습한 놈이 왔다. 후각 센서가 달렸으니 냄새 강한 물건은 밀폐 공간으로!",
  },
  {
    id: 3,
    day: "9일차 · 최종",
    robotName: "오버홀",
    robotModel: "MODEL Ω · 전방위 레이더",
    sensitivity: 1.28,
    time: 78,
    items: ["sock", "lunch", "pizza", "can", "choco", "tissue", "cable", "crumb"],
    spots: [
      "bedGap", "cushion", "shelfBooks", "drawer", "sofaGap", "deskDrawer", "rug", "curtain", "plant",
    ],
    brief: "감추기 마스터 시험. 최고 감도의 레이더가 방 전체를 훑는다. 겹치지 않게, 넘치지 않게, 냄새를 묶어라.",
  },
];

export const RANKS: { min: number; rank: string; msg: string }[] = [
  { min: 0.92, rank: "S", msg: "완벽한 감추기. 로봇이 눈물을 흘리며 물러났다." },
  { min: 0.75, rank: "A", msg: "상당히 깔끔하다. 햄스터 감각이 아깝지 않다." },
  { min: 0.55, rank: "B", msg: "무난한 은폐. 몇 개는 어렴풋이 드러났다." },
  { min: 0.3, rank: "C", msg: "로봇이 웃었다. 방석 밑을 다시 공부하자." },
  { min: -1, rank: "D", msg: "그냥 방 한복판에 둔 것만 못하다…." },
];
