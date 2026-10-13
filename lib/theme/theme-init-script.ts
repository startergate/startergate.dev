/**
 * 첫 페인트 전에 data-theme를 설정해 화면 깜빡임을 막는다 (spec §3.4).
 * 기존 Gatsby 사이트의 gatsby-ssr.js theme-init 스크립트를 그대로 옮겼다.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var sys=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',s||sys);}catch(e){}})();`;
