"use client";

import { useId, type ReactNode } from "react";

import styles from "./Tooltip.module.css";

/**
 * 공용 툴팁. 트리거를 호버하거나(포인터) 포커스하면(키보드) 아래에
 * 말풍선으로 내용을 보여준다 — components/layout/NavPill.tsx의 "Blog
 * 준비 중" 말풍선과 같은 시각 언어를 일반화했다. 나무위키 각주처럼
 * 글 중간에 짧은 보충 설명을 달 때, 또는 다른 호버 설명이 필요한
 * 곳 어디에나 쓸 수 있다.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <span className={`${styles.trigger} ${className ?? ""}`} tabIndex={0} aria-describedby={id}>
      {children}
      <span id={id} role="tooltip" className={styles.bubble}>
        {content}
      </span>
    </span>
  );
}
