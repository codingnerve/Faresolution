/**
 * Wording for the confirmation shown after a review draft is saved. Pure, so
 * the honest "could not be saved" case is unit tested: when browser storage is
 * blocked the draft only lives in memory and is lost on reload, and the page
 * must not say otherwise.
 */
export interface DraftNotice {
  title: string;
  body: string;
  /** Show the shared "your entry is stored only in this browser" notice. */
  showStorageNotice: boolean;
  /** Show the "Saved <date>. Clearing your browser data..." line. */
  showSavedLine: boolean;
}

export function draftNotice({
  persisted,
  productName,
  headline,
}: {
  persisted: boolean;
  productName: string;
  headline: string;
}): DraftNotice {
  if (persisted) {
    return {
      title: "Draft saved in this browser",
      body: `Your draft of ${productName}, “${headline}”, is stored only in this browser. Review collection isn’t open yet, so it has not been submitted, published or sent to anyone.`,
      showStorageNotice: true,
      showSavedLine: true,
    };
  }
  return {
    title: "Draft not saved to this browser",
    body: `This draft could not be saved in this browser's storage (it may be blocked); it will be lost when you leave or reload this page. Nothing has been submitted, published or sent to anyone, and review collection isn’t open yet.`,
    showStorageNotice: false,
    showSavedLine: false,
  };
}
