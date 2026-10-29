/**
 * Module-global note of which project card should get focus back once the
 * list is shown again. A popup opened from the list lives on its own route,
 * so closing it (close button, Esc, browser back) remounts the list and the
 * original card element is gone — the new list looks the card up by id.
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
