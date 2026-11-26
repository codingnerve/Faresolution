/**
 * What a screen reader hears after the Save button is pressed. Pure, so the
 * honest case is unit tested: when this browser's storage fails, the saved
 * list is kept in memory only and is lost on reload, which the announcement
 * must say instead of claiming the product is saved in this browser.
 */
export function saveAnnouncement({
  name,
  saved,
  persisted,
}: {
  name: string;
  /** Whether the product is in the saved list after the click. */
  saved: boolean;
  /** Whether that change reached browser storage. */
  persisted: boolean;
}): string {
  const visitOnly = " for this visit only (this browser's storage is unavailable)";
  if (saved) return persisted ? `${name} saved in this browser` : `${name} saved${visitOnly}`;
  return `${name} removed from saved products${persisted ? "" : visitOnly}`;
}
