export type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  twinkle: boolean;
};

/**
 * 시드 기반 선형congruential 생성기로 별 위치를 만든다. 서버 렌더와
 * 클라이언트 하이드레이션이 같은 값을 내야 해서(Math.random이면
 * 둘이 달라져 하이드레이션 경고/깜빡임이 생긴다) 고정 시드를 쓴다.
 */
export function makeStars(seed0: number, count: number): Star[] {
  let seed = seed0;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    const big = rnd() > 0.88;
    const mid = !big && rnd() > 0.5;
    out.push({
      x: Number((rnd() * 100).toFixed(2)),
      y: Number((rnd() * 100).toFixed(2)),
      size: big ? 2.4 : mid ? 1.6 : 1.1,
      opacity: Number((0.25 + rnd() * 0.6).toFixed(2)),
      delay: Number((rnd() * 3.6).toFixed(2)),
      twinkle: big || rnd() > 0.7,
    });
  }
  return out;
}
