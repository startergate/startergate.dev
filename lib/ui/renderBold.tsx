import { Fragment, type ReactNode } from "react";

/**
 * "**굵게**" 표기를 <strong>으로 바꿔서 렌더한다. About 문단처럼 핵심
 * 구절만 굵게 표시해야 하는 사전 문자열에 쓴다 (마크다운 라이브러리를
 * 새로 추가하지 않기 위한 최소 구현).
 */
export function renderBold(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{part}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
