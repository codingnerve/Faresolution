/**
 * Wording for the confirmation shown after the contact, listing claim and
 * vendor interest forms are submitted. Pure, so the honest cases are unit
 * tested: nothing is ever sent (the demo is not connected to email), and when
 * browser storage is blocked the entry lives only in memory and is lost on
 * reload, which the page must say. Same pattern as `lib/reviews/draft-notice.ts`.
 */

export type NoticeKind = "contact" | "claim" | "vendor-interest";

export interface SubmissionNotice {
  title: string;
  body: string;
  /** Show the shared "This demo isn't connected to email yet..." notice. */
  showStorageNotice: boolean;
}

const NOUN: Record<NoticeKind, { title: string; lower: string }> = {
  contact: { title: "Message", lower: "message" },
  claim: { title: "Claim request", lower: "claim request" },
  "vendor-interest": { title: "Interest", lower: "entry" },
};

export function submissionNotice({
  kind,
  persisted,
  productName,
}: {
  kind: NoticeKind;
  persisted: boolean;
  productName?: string | null;
}): SubmissionNotice {
  const noun = NOUN[kind];
  if (!persisted) {
    return {
      title: `${noun.title} not saved`,
      body: `Your ${noun.lower} could not be saved in this browser's storage (it may be blocked), so it will be lost when you leave or reload this page. Nothing has been sent to Faresolution or to any vendor: this demo isn't connected to email yet.`,
      showStorageNotice: false,
    };
  }
  const title = `${noun.title} saved in this browser`;
  if (kind === "contact") {
    const vendorLine = productName
      ? ` It has not been passed to the vendor of ${productName} either; for a demo today, use the vendor's own website.`
      : "";
    return {
      title,
      body: `Your message has not been sent to anyone.${vendorLine} Nobody will reply to it from this demo.`,
      showStorageNotice: true,
    };
  }
  if (kind === "claim") {
    const product = productName ? ` for ${productName}` : "";
    return {
      title,
      body: `Your claim request${product} has not been sent, reviewed or verified, and no listing has been changed. Listing claims open at launch, when ownership will be checked before any change is made.`,
      showStorageNotice: true,
    };
  }
  return {
    title,
    body: "Your entry has not been sent to anyone and no account has been created. The vendor programme opens at launch; plans, pricing and how to join will be announced then.",
    showStorageNotice: true,
  };
}
