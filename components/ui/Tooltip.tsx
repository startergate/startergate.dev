"use client";

import { useId, type ReactNode } from "react";

import styles from "./Tooltip.module.css";

/**
 * 공용 툴팁. 트리거를 호버하거나(포인터) 포커스하면(키보드) 아래에
 * 말풍선으로 내용을 보여준다 — components/layout/NavPill.tsx의 "Blog
 * 준비 중" 말풍선과 같은 시각 언어를 일반화했다. 나무위키 각주처럼
 * 글 중간에 짧은 보충 설명을 달 때, 또는 다른 호버 설명이 필요한
 * 곳 어디에나 쓸 수 있다.
 *
 * `align="end"`는 말풍선을 트리거 중앙이 아니라 오른쪽 끝에 맞춰
 * 펼친다(화살표도 같이 옮겨 간다) — 트리거가 화면 오른쪽 끝에 붙어
 * 있어 가운데 정렬로는 말풍선이 뷰포트 밖으로 넘어가는 경우에 쓴다
 * (components/home/Hero.tsx의 "서울 상공" 캡션 참고).
 *
 * `side="top"`은 아래 대신 위로 펼친다 — 트리거가 화면 아래쪽 끝
 * 근처에 있어 기본(아래)으로 펼치면 하단 고정 요소(BottomDock 등)와
 * 겹치는 경우에 쓴다(마찬가지로 "서울 상공" 캡션 참고).
 */
export function Tooltip({
  content,
  children,
  className,
  align = "center",
  side = "bottom",
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "center" | "end";
  side?: "bottom" | "top";
}) {
  const id = useId();
  const bubbleClass = [
    styles.bubble,
    align === "end" ? styles.bubbleEnd : "",
    side === "top" ? styles.bubbleTop : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={`${styles.trigger} ${className ?? ""}`} tabIndex={0} aria-describedby={id}>
      {children}
      <span id={id} role="tooltip" className={bubbleClass}>
        {content}
      </span>
    </span>
  );
}
