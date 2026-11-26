import { describe, expect, it } from "vitest";
import { submissionNotice, type NoticeKind } from "./submission-notice";

const KINDS: NoticeKind[] = ["contact", "claim", "vendor-interest"];

/** Phrases that would claim the entry reached someone. */
const DELIVERY_CLAIM =
  /(?<!nothing )\b(has|have|was|were) (been )?(sent|received|delivered|forwarded|submitted)\b|we('ll| will) (be in touch|reply|respond|contact you|get back)|thanks for (your|the) (message|request)/i;

describe("submissionNotice", () => {
  it("says the entry is stored only in this browser when it was persisted", () => {
    for (const kind of KINDS) {
      const notice = submissionNotice({ kind, persisted: true });
      expect(notice.title, kind).toMatch(/saved in this browser/i);
      expect(notice.showStorageNotice, kind).toBe(true);
      expect(notice.body, kind).toMatch(/not been sent|nothing has been sent|hasn.t been sent/i);
    }
  });

  it("is honest that the entry will be lost when it could not be persisted", () => {
    for (const kind of KINDS) {
      const notice = submissionNotice({ kind, persisted: false });
      expect(notice.title, kind).toMatch(/not saved/i);
      expect(notice.title, kind).not.toMatch(/saved in this browser/i);
      expect(notice.body, kind).toMatch(/could not be saved/);
      expect(notice.body, kind).toMatch(/lost when you leave or reload/);
      expect(notice.body, kind).not.toMatch(/is stored only in this browser/);
      expect(notice.showStorageNotice, kind).toBe(false);
    }
  });

  it("never claims the entry was sent, received or will be answered", () => {
    for (const kind of KINDS) {
      for (const persisted of [true, false]) {
        const { title, body } = submissionNotice({ kind, persisted, productName: "HubSpot CRM" });
        expect(`${title} ${body}`, `${kind}/${persisted}`).not.toMatch(DELIVERY_CLAIM);
      }
    }
  });

  it("names the product when one is given", () => {
    expect(submissionNotice({ kind: "claim", persisted: true, productName: "Asana" }).body).toContain("Asana");
    expect(submissionNotice({ kind: "contact", persisted: true, productName: "Asana" }).body).toContain("Asana");
  });

  it("says claims are not reviewed or verified yet, and the programme opens at launch", () => {
    const { body } = submissionNotice({ kind: "claim", persisted: true, productName: "Asana" });
    expect(body).toMatch(/at launch/);
    expect(body).toMatch(/not been reviewed or verified|no listing has been changed/i);
    expect(submissionNotice({ kind: "vendor-interest", persisted: true }).body).toMatch(/at launch/);
  });

  it("says no account is created for vendor interest", () => {
    expect(submissionNotice({ kind: "vendor-interest", persisted: true }).body).toMatch(/no account/i);
  });
});
