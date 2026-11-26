import { describe, expect, it } from "vitest";
import { FREE_WEBMAIL_DOMAINS, emailDomain, isFreeWebmail } from "./webmail";

describe("isFreeWebmail", () => {
  it("flags the common free webmail providers", () => {
    for (const domain of ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "icloud.com", "proton.me"]) {
      expect(isFreeWebmail(`someone@${domain}`), domain).toBe(true);
    }
  });

  it("is case-insensitive and ignores surrounding whitespace", () => {
    expect(isFreeWebmail("Someone@GMAIL.COM")).toBe(true);
    expect(isFreeWebmail("  someone@Outlook.com  ")).toBe(true);
  });

  it("flags subdomains of a webmail domain", () => {
    expect(isFreeWebmail("someone@mail.yahoo.com")).toBe(true);
  });

  it("does not flag company domains that merely contain a webmail name", () => {
    expect(isFreeWebmail("someone@notgmail.com")).toBe(false);
    expect(isFreeWebmail("someone@gmail.com.acme.example")).toBe(false);
    expect(isFreeWebmail("someone@my-outlook.com")).toBe(false);
    expect(isFreeWebmail("gmail.com@acme.example")).toBe(false);
  });

  it("does not flag company domains", () => {
    expect(isFreeWebmail("priya@acme-software.example")).toBe(false);
    expect(isFreeWebmail("priya@hubspot.com")).toBe(false);
  });

  it("returns false for anything that is not a valid email", () => {
    for (const value of ["", "   ", "gmail.com", "@gmail.com", "someone@", "some one@gmail.com", "a@b@gmail.com"]) {
      expect(isFreeWebmail(value), JSON.stringify(value)).toBe(false);
    }
    expect(isFreeWebmail(undefined)).toBe(false);
    expect(isFreeWebmail(null)).toBe(false);
    expect(isFreeWebmail(42)).toBe(false);
  });

  it("keeps a lower-case, duplicate-free domain list", () => {
    expect(new Set(FREE_WEBMAIL_DOMAINS).size).toBe(FREE_WEBMAIL_DOMAINS.length);
    for (const domain of FREE_WEBMAIL_DOMAINS) expect(domain).toBe(domain.toLowerCase());
  });
});

describe("emailDomain", () => {
  it("returns the lower-case domain of a valid email, or null", () => {
    expect(emailDomain("Someone@Acme.Example")).toBe("acme.example");
    expect(emailDomain("not an email")).toBeNull();
  });
});
