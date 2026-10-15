type LinkIcon = { src: string; background?: string; padding?: number };

const LINK_ICON_BY_TYPE: Record<string, LinkIcon> = {
  // 메일은 아이콘 없이 "@" 글자만 쓴다 (components/home/Links.tsx 참고).
  // GitHub·LinkedIn 로고는 흰색 한 가지뿐이라 고정 배경이 없으면
  // 라이트 테마에서 거의 안 보였다 — 각각 브랜드 색으로 고정했다.
  // 원본 이미지 자체가 가장자리까지 그림이 꽉 차 있어서(여백 0),
  // 원형 배지에서 모서리가 그대로 잘렸다 — padding(px)으로 이 로고들만
  // 안쪽에 여백을 준다(일괄 CSS가 아니라 로고별로 필요한 만큼만).
  linkedin: { src: "externals/linkedin.png", background: "#0A66C2", padding: 5 },
  rocketpunch: { src: "externals/rocketpunch.png" },
  github: { src: "externals/github.png", background: "#171515", padding: 4 },
  stackshare: { src: "externals/stackshare.png" },
  npm: { src: "externals/npm.png" },
  "docker hub": { src: "externals/docker.png", background: "#0db7ed", padding: 5 },
  docker: { src: "externals/docker.png", background: "#0db7ed", padding: 5 },
  steam: { src: "externals/steam.png" },
  discord: { src: "externals/discord.png", background: "#5865F2" },
  facebook: { src: "externals/facebook.png" },
  twitter: { src: "externals/twitter.png", background: "#1DA1F2" },
  sourcerer: { src: "externals/sourcerer.png" },
};

/** 링크/프로젝트 링크의 `type` 문자열로 `public/images/externals/*` 아이콘(과 필요하면 고정 배경색)을 찾는다 (spec §4.1, §6.2). */
export function getLinkIcon(type: string): LinkIcon | undefined {
  return LINK_ICON_BY_TYPE[type.trim().toLowerCase()];
}
