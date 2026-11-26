import { describe, expect, it } from "vitest";
import { saveAnnouncement } from "./save-announcement";

describe("saveAnnouncement", () => {
  it("says saved in this browser only when the list reached storage", () => {
    expect(saveAnnouncement({ name: "Asana", saved: true, persisted: true })).toBe("Asana saved in this browser");
    expect(saveAnnouncement({ name: "Asana", saved: false, persisted: true })).toBe("Asana removed from saved products");
  });

  it("says the change lasts for this visit only when storage failed", () => {
    const saved = saveAnnouncement({ name: "Asana", saved: true, persisted: false });
    expect(saved).toBe("Asana saved for this visit only (this browser's storage is unavailable)");
    expect(saved).not.toMatch(/saved in this browser/);
    expect(saveAnnouncement({ name: "Asana", saved: false, persisted: false })).toBe(
      "Asana removed from saved products for this visit only (this browser's storage is unavailable)",
    );
  });
});
