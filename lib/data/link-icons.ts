const LINK_ICON_BY_TYPE: Record<string, string> = {
  메일: "externals/paper-plane.png",
  mail: "externals/paper-plane.png",
  linkedin: "externals/linkedin.png",
  rocketpunch: "externals/rocketpunch.png",
  github: "externals/github.png",
  stackshare: "externals/stackshare.png",
  npm: "externals/npm.png",
  "docker hub": "externals/docker.png",
  docker: "externals/docker.png",
  steam: "externals/steam.png",
  discord: "externals/discord.png",
  facebook: "externals/facebook.png",
  twitter: "externals/twitter.png",
  sourcerer: "externals/sourcerer.png",
};

/** 링크/프로젝트 링크의 `type` 문자열로 `public/images/externals/*` 아이콘을 찾는다 (spec §4.1, §6.2). */
export function getLinkIcon(type: string): string | undefined {
  return LINK_ICON_BY_TYPE[type.trim().toLowerCase()];
}
