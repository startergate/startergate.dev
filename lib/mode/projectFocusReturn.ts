/**
 * Module-global note of which project card should get focus back once the
 * popup closes. The list looks the card up by id when the popup goes away
 * (close button, Esc, browser back), which also covers a direct entry where
 * no card opened the popup.
 */
let openerId: string | null = null;

export function rememberProjectOpener(id: string) {
  openerId = id;
}

export function takeProjectOpener(): string | null {
  const id = openerId;
  openerId = null;
  return id;
}
