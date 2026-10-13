/**
 * 로고가 없을 때 쓰는 약어 모노그램. 여러 단어면 각 단어 첫 글자 2개,
 * 한 단어면 영문·숫자·#·+ 만 남기고 앞 2글자를 쓴다 (ProjectCard/
 * ProjectModal의 프로젝트 모노그램, 기술 배지의 abbr 대체용).
 */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0] ?? "").replace(/[^A-Za-z0-9#+]/g, "").slice(0, 2).toUpperCase();
}
