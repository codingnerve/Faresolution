import { describe, expect, it } from "vitest";
import { newsletterSchema } from "./validation";

function firstMessage(input: unknown): string | undefined {
  const result = newsletterSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("newsletterSchema", () => {
  it("accepts a valid email", () => {
    const result = newsletterSchema.safeParse({ email: "person@example.com" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ email: "person@example.com" });
  });

  it("trims surrounding whitespace before validating", () => {
    const result = newsletterSchema.safeParse({ email: "  person@example.com \n" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("person@example.com");
  });

  it("rejects an email without @", () => {
    expect(newsletterSchema.safeParse({ email: "person.example.com" }).success).toBe(false);
    expect(firstMessage({ email: "person.example.com" })).toBe("Enter a valid email address.");
  });

  it("asks for an email when empty or whitespace", () => {
    expect(firstMessage({ email: "" })).toBe("Enter your email address.");
    expect(firstMessage({ email: "   " })).toBe("Enter your email address.");
  });

  it("rejects a missing or non-string email", () => {
    expect(newsletterSchema.safeParse({}).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: 42 }).success).toBe(false);
    expect(newsletterSchema.safeParse(null).success).toBe(false);
  });

  it("rejects an address longer than 254 characters", () => {
    const long = `${"a".repeat(250)}@example.com`;
    expect(newsletterSchema.safeParse({ email: long }).success).toBe(false);
  });

  it("drops unknown keys", () => {
    const result = newsletterSchema.safeParse({ email: "person@example.com", admin: true });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ email: "person@example.com" });
  });
});
