export type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  twinkle: boolean;
};

export type Meteor = {
  x: number;
  y: number;
  delay: number;
};

/** components/home/StarField.tsx가 매 루프마다 유성을 다시 둘 때 쓰는 범위 — makeMeteors와 같은 값. */
export const METEOR_X_RANGE: [number, number] = [20, 80];
export const METEOR_Y_RANGE: [number, number] = [4, 34];

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

/**
 * 유성의 첫 시작 위치·지연을 만든다(별과 같은 이유로 시드 고정 —
 * 첫 렌더는 서버/클라이언트가 같아야 한다). 두 번째 루프부터는
 * StarField가 애니메이션이 한 바퀴 끝날 때마다(animationiteration)
 * 순수 클라이언트에서 새 위치로 다시 두므로 여기서는 시드 난수를
 * 그대로 쓴다. 유성을 하나만 둬서 여러 개가 동시에 나타나는 일이
 * 없게 한다 — 궤적 각도·이동 거리는 CSS 쪽 고정값을 쓴다.
 */
export function makeMeteor(seed0: number): Meteor {
  let seed = seed0;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const [xMin, xMax] = METEOR_X_RANGE;
  const [yMin, yMax] = METEOR_Y_RANGE;
  return {
    x: Number((xMin + rnd() * (xMax - xMin)).toFixed(2)),
    y: Number((yMin + rnd() * (yMax - yMin)).toFixed(2)),
    delay: Number((rnd() * 10).toFixed(2)),
  };
}
