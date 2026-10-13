/**
 * 목록에서 카드를 눌러 상세로 들어왔는지 추적하는 모듈 전역 플래그.
 * 팝업을 닫을 때 history.back()으로 목록까지 되돌아갈 수 있는지
 * 판단하는 데 쓴다 (spec §2.3). 새 탭/직접 진입이면 false로 시작한다.
 */
let cameFromList = false;

export function markCameFromList() {
  cameFromList = true;
}

export function didComeFromList(): boolean {
  return cameFromList;
}
