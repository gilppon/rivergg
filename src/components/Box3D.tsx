import type { CSSProperties, ReactNode } from "react";
import { ROOM } from "../game/data";

type BoxProps = {
  u: number; // 바닥 x
  v: number; // 벽에서부터 깊이
  w: number; // 가로
  h: number; // 높이
  d: number; // 깊이
  front?: string;
  top?: string;
  right?: string;
  radius?: number;
  shadow?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
  frontChildren?: ReactNode;
  topChildren?: ReactNode;
  rightChildren?: ReactNode;
  anim?: string;
};

/**
 * CSS 3D 박스. 카메라가 우측 상단에서 들여다보는 디오라마 전용이라
 * 앞면(front) / 윗면(top) / 오른쪽 면(right) 만 렌더링한다.
 */
export function Box3D({
  u, v, w, h, d, front = "bg-slate-200", top = "bg-slate-100", right = "bg-slate-400",
  radius = 6, shadow = true, style, children, frontChildren, topChildren, rightChildren, anim,
}: BoxProps) {
  return (
    <div
      className={`absolute p3d ${anim ?? ""}`}
      style={{
        left: u,
        top: ROOM.H - h,
        width: w,
        height: h,
        transform: `translate3d(0,0,${v}px)`,
        ...style,
      }}
    >
      {/* 윗면 */}
      <div
        className={`absolute ${top}`}
        style={{
          left: 0, top: 0, width: w, height: d,
          transformOrigin: "left top",
          transform: "rotateX(90deg)",
          borderRadius: radius,
        }}
      >
        {topChildren}
      </div>
      {/* 오른쪽 면 */}
      <div
        className={`absolute ${right}`}
        style={{
          left: 0, top: 0, width: d, height: h,
          transformOrigin: "left top",
          transform: `translate3d(${w}px,0,${d}px) rotateY(90deg)`,
          borderRadius: radius,
        }}
      >
        {rightChildren}
      </div>
      {/* 앞면 */}
      <div
        className={`absolute ${front}`}
        style={{
          left: 0, top: 0, width: w, height: h,
          transform: `translateZ(${d}px)`,
          borderRadius: radius,
          overflow: "hidden",
        }}
      >
        {children}
        {frontChildren}
      </div>
      {/* 바닥 그림자 */}
      {shadow && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: -12, top: h,
            width: w + 24,
            height: d,
            transformOrigin: "left top",
            transform: "rotateX(90deg) translateZ(1.5px)",
            background:
              "radial-gradient(60% 70% at 50% 50%, rgba(10,14,30,0.42), rgba(10,14,30,0) 72%)",
            filter: "blur(2px)",
          }}
        />
      )}
    </div>
  );
}

/** 바닥 위에 깔리는 수평 면(카펫 등). hOffset = 바닥에서의 높이 */
export function FloorPlane({
  u, v, w, d, hOffset = 1, className, style, children,
}: {
  u: number; v: number; w: number; d: number; hOffset?: number;
  className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  return (
    <div
      className={`absolute ${className ?? ""}`}
      style={{
        left: u,
        top: ROOM.H,
        width: w,
        height: d,
        transformOrigin: "left top",
        transform: `translate3d(0,${-hOffset}px,${v}px) rotateX(90deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** 카메라를 향해 항상 서 있는 빌보드 (마커, 햄스터, 라벨) */
export function Billboard({
  u, v, y, children, style, className, width,
}: {
  u: number; v: number; y: number; children: ReactNode;
  style?: CSSProperties; className?: string; width?: number;
}) {
  const w0 = width ?? 0;
  return (
    <div
      className={`absolute p3d ${className ?? ""}`}
      style={{
        left: u - w0 / 2,
        top: ROOM.H - y,
        width: w0,
        transform: `translate3d(0,0,${v}px) rotateY(14deg)`,
        transformOrigin: "center bottom",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
