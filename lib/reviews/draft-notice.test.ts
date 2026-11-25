import { describe, expect, it } from "vitest";
import { draftNotice } from "./draft-notice";

describe("draftNotice", () => {
  it("says the draft is stored in this browser when it was persisted", () => {
    const notice = draftNotice({ persisted: true, productName: "HubSpot CRM", headline: "Solid" });
    expect(notice.title).toBe("Draft saved in this browser");
    expect(notice.body).toContain("HubSpot CRM");
    expect(notice.body).toContain("Solid");
    expect(notice.body).toContain("stored only in this browser");
    expect(notice.showStorageNotice).toBe(true);
    expect(notice.showSavedLine).toBe(true);
  });

  it("is honest that the draft will be lost when it could not be persisted", () => {
    const notice = draftNotice({ persisted: false, productName: "HubSpot CRM", headline: "Solid" });
    expect(notice.title).toBe("Draft not saved to this browser");
    expect(notice.body).toMatch(/could not be saved in this browser's storage/);
    expect(notice.body).toMatch(/lost when you leave or reload/);
    expect(notice.body).not.toMatch(/is stored only in this browser/);
    expect(notice.showStorageNotice).toBe(false);
    expect(notice.showSavedLine).toBe(false);
  });

  it("never claims review collection is open or the draft was sent", () => {
    for (const persisted of [true, false]) {
      const { body } = draftNotice({ persisted, productName: "X", headline: "Y" });
      expect(body).toMatch(/isn.t open yet|not been submitted|Nothing has been submitted/);
    }
  });
});
