import { describe, expect, it } from "vitest";
import { PLAN_IDS } from "@/lib/data/content/plans";
import {
  claimSchema,
  COMPANY_SIZE_VALUES,
  CONTACT_TOPIC_OPTIONS,
  contactSchema,
  HONEYPOT_ERROR,
  HONEYPOT_FIELD,
  isHoneypotOnly,
  isHttpUrl,
  PLAN_INTEREST_VALUES,
  vendorInterestSchema,
  newsletterSchema,
  reviewDraftSchema,
  USAGE_LENGTH_OPTIONS,
} from "./validation";

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

const validReview = {
  overall: 4,
  ease: 5,
  value: 3,
  features: 4,
  support: 2,
  headline: "Solid for a small sales team",
  pros: "Easy to set up and the pipeline view is clear.",
  cons: "Reporting needs a higher plan.",
  experience:
    "We moved our small sales team onto it last year and it replaced a shared spreadsheet without much training.",
  usageLength: "6-12-months",
  jobTitle: "Operations lead",
  companySize: "small",
  industry: "Retail",
  [HONEYPOT_FIELD]: "",
};

/** A copy of `object` without `key`. */
function without<T extends object>(object: T, key: keyof T): Partial<T> {
  return Object.fromEntries(Object.entries(object).filter(([k]) => k !== key)) as Partial<T>;
}

function reviewIssuePaths(input: unknown): string[] {
  const result = reviewDraftSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("reviewDraftSchema", () => {
  it("accepts a valid draft", () => {
    const result = reviewDraftSchema.safeParse(validReview);
    expect(result.success).toBe(true);
    expect(result.data?.overall).toBe(4);
  });

  it("accepts a draft without the honeypot key and trims text", () => {
    const result = reviewDraftSchema.safeParse({ ...without(validReview, HONEYPOT_FIELD), headline: "  Solid for a small team  " });
    expect(result.success).toBe(true);
    expect(result.data?.headline).toBe("Solid for a small team");
  });

  it.each(["overall", "ease", "value", "features", "support"] as const)("rejects %s of 6, 0 and 3.5", (key) => {
    for (const bad of [6, 0, 3.5, -1]) {
      expect(reviewDraftSchema.safeParse({ ...validReview, [key]: bad }).success, `${key}=${bad}`).toBe(false);
    }
    expect(reviewIssuePaths({ ...validReview, [key]: 6 })).toEqual([key]);
  });

  it.each(["overall", "ease", "value", "features", "support"] as const)("accepts %s of 1 and 5", (key) => {
    expect(reviewDraftSchema.safeParse({ ...validReview, [key]: 1 }).success).toBe(true);
    expect(reviewDraftSchema.safeParse({ ...validReview, [key]: 5 }).success).toBe(true);
  });

  it("rejects ratings that are not numbers or are missing", () => {
    for (const bad of ["4", "five", null, NaN, Infinity, undefined, true]) {
      expect(reviewDraftSchema.safeParse({ ...validReview, overall: bad }).success, String(bad)).toBe(false);
    }
  });

  it("asks for a rating with a readable message when one is missing", () => {
    const result = reviewDraftSchema.safeParse({ ...validReview, ease: undefined });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/ease of use/i);
  });

  it("requires a headline of 5 to 120 characters", () => {
    expect(reviewDraftSchema.safeParse({ ...validReview, headline: "Four" }).success).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, headline: "Five!" }).success).toBe(true);
    expect(reviewDraftSchema.safeParse({ ...validReview, headline: "x".repeat(120) }).success).toBe(true);
    expect(reviewDraftSchema.safeParse({ ...validReview, headline: "x".repeat(121) }).success).toBe(false);
    // Whitespace does not count.
    expect(reviewDraftSchema.safeParse({ ...validReview, headline: "  ab  " }).success).toBe(false);
  });

  it("requires pros and cons", () => {
    expect(reviewIssuePaths({ ...validReview, pros: "" })).toEqual(["pros"]);
    expect(reviewIssuePaths({ ...validReview, cons: "   " })).toEqual(["cons"]);
  });

  it("requires an experience of at least 50 characters", () => {
    expect(reviewDraftSchema.safeParse({ ...validReview, experience: "x".repeat(49) }).success).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, experience: "x".repeat(50) }).success).toBe(true);
    // Padding with spaces does not reach the minimum.
    expect(
      reviewDraftSchema.safeParse({ ...validReview, experience: `${"x".repeat(30)}${" ".repeat(40)}` }).success,
    ).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, experience: "x".repeat(5001) }).success).toBe(false);
  });

  it("accepts every usage length and company size, and rejects other values", () => {
    for (const option of USAGE_LENGTH_OPTIONS) {
      expect(reviewDraftSchema.safeParse({ ...validReview, usageLength: option.value }).success, option.value).toBe(true);
    }
    for (const size of COMPANY_SIZE_VALUES) {
      expect(reviewDraftSchema.safeParse({ ...validReview, companySize: size }).success, size).toBe(true);
    }
    expect(reviewDraftSchema.safeParse({ ...validReview, usageLength: "forever" }).success).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, usageLength: "" }).success).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, companySize: "huge" }).success).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, companySize: "__proto__" }).success).toBe(false);
  });

  it("covers the same company sizes as the product data", () => {
    expect([...COMPANY_SIZE_VALUES].sort()).toEqual(["enterprise", "mid", "small", "solo"]);
  });

  it("requires a job title and an industry", () => {
    expect(reviewIssuePaths({ ...validReview, jobTitle: "" })).toEqual(["jobTitle"]);
    expect(reviewIssuePaths({ ...validReview, industry: " " })).toEqual(["industry"]);
  });

  it("rejects a filled honeypot", () => {
    expect(reviewDraftSchema.safeParse({ ...validReview, [HONEYPOT_FIELD]: "https://spam.example" }).success).toBe(false);
    expect(reviewIssuePaths({ ...validReview, [HONEYPOT_FIELD]: "x" })).toEqual([HONEYPOT_FIELD]);
  });

  it("drops unknown keys", () => {
    const result = reviewDraftSchema.safeParse({ ...validReview, admin: true });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("admin");
  });

  it("rejects non-objects", () => {
    expect(reviewDraftSchema.safeParse(null).success).toBe(false);
    expect(reviewDraftSchema.safeParse("review").success).toBe(false);
  });
});

const validContact = {
  name: "Priya Shah",
  email: "priya@example.com",
  product: "hubspot-crm",
  message: "Please correct the pricing facts.",
};

describe("contactSchema", () => {
  it("accepts a valid message, with or without a product", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
    expect(contactSchema.safeParse(without(validContact, "product")).success).toBe(true);
  });

  it("treats an empty product choice as none", () => {
    const result = contactSchema.safeParse({ ...validContact, product: "" });
    expect(result.success).toBe(true);
    expect(result.data?.product).toBeUndefined();
  });

  it("rejects an email without @", () => {
    expect(contactSchema.safeParse({ ...validContact, email: "priya.example.com" }).success).toBe(false);
  });

  it("rejects a message shorter than 10 characters and a missing name", () => {
    expect(contactSchema.safeParse({ ...validContact, message: "Too short" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, message: "Ten chars!" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...validContact, name: " " }).success).toBe(false);
  });

  it("rejects a product that is not a slug, and a filled honeypot", () => {
    expect(contactSchema.safeParse({ ...validContact, product: "Not A Slug" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, [HONEYPOT_FIELD]: "spam" }).success).toBe(false);
  });

  it("defaults the topic to a general question and accepts every listed topic", () => {
    expect(contactSchema.parse(validContact).topic).toBe("general");
    for (const option of CONTACT_TOPIC_OPTIONS) {
      expect(contactSchema.safeParse({ ...validContact, topic: option.value }).success, option.value).toBe(true);
    }
    expect(contactSchema.safeParse({ ...validContact, topic: "sales" }).success).toBe(false);
  });
});

describe("isHttpUrl", () => {
  it("accepts http and https addresses with a dotted host", () => {
    expect(isHttpUrl("https://acme.example")).toBe(true);
    expect(isHttpUrl("http://acme.example/path?x=1")).toBe(true);
    expect(isHttpUrl("HTTPS://Acme.Example")).toBe(true);
  });

  it("rejects other schemes, bare domains and malformed input", () => {
    for (const value of [
      "acme.example",
      "www.acme.example",
      "ftp://acme.example",
      "javascript:alert(1)",
      "mailto:someone@acme.example",
      "data:text/html,hi",
      "https://",
      "https://localhost",
      "https:/acme.example",
      "https://acme .example",
      "",
    ]) {
      expect(isHttpUrl(value), value).toBe(false);
    }
  });
});

const validInterest = {
  name: "Priya Shah",
  email: "priya@acme-software.example",
  company: "Acme Software",
  website: "https://acme-software.example",
  plan: PLAN_IDS[0],
  [HONEYPOT_FIELD]: "",
};

describe("vendorInterestSchema", () => {
  it("accepts a valid entry, with or without a website", () => {
    expect(vendorInterestSchema.safeParse(validInterest).success).toBe(true);
    expect(vendorInterestSchema.safeParse(without(validInterest, "website")).success).toBe(true);
    const empty = vendorInterestSchema.safeParse({ ...validInterest, website: "   " });
    expect(empty.success).toBe(true);
    expect(empty.data?.website).toBeUndefined();
  });

  it("trims text and the website", () => {
    const result = vendorInterestSchema.safeParse({
      ...validInterest,
      name: "  Priya Shah ",
      website: "  https://acme-software.example  ",
    });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Priya Shah");
    expect(result.data?.website).toBe("https://acme-software.example");
  });

  it("accepts only http and https websites", () => {
    for (const website of ["acme.example", "ftp://acme.example", "javascript:alert(1)", "https://localhost"]) {
      const result = vendorInterestSchema.safeParse({ ...validInterest, website });
      expect(result.success, website).toBe(false);
      expect(result.error?.issues[0]?.path, website).toEqual(["website"]);
    }
    expect(vendorInterestSchema.safeParse({ ...validInterest, website: "http://acme.example" }).success).toBe(true);
  });

  it("limits the website length", () => {
    const website = `https://acme.example/${"x".repeat(300)}`;
    expect(vendorInterestSchema.safeParse({ ...validInterest, website }).success).toBe(false);
  });

  it("requires a name, a valid email and a company", () => {
    for (const key of ["name", "email", "company"] as const) {
      expect(vendorInterestSchema.safeParse({ ...validInterest, [key]: "" }).success, key).toBe(false);
      expect(vendorInterestSchema.safeParse(without(validInterest, key)).success, key).toBe(false);
    }
    expect(vendorInterestSchema.safeParse({ ...validInterest, email: "priya.acme.example" }).success).toBe(false);
  });

  it("accepts every plan and 'not sure yet', and rejects other plans", () => {
    expect([...PLAN_INTEREST_VALUES]).toEqual([...PLAN_IDS, "undecided"]);
    for (const plan of PLAN_INTEREST_VALUES) {
      expect(vendorInterestSchema.safeParse({ ...validInterest, plan }).success, plan).toBe(true);
    }
    expect(vendorInterestSchema.safeParse({ ...validInterest, plan: "platinum" }).success).toBe(false);
    expect(vendorInterestSchema.safeParse({ ...validInterest, plan: "" }).success).toBe(false);
    expect(vendorInterestSchema.safeParse(without(validInterest, "plan")).success).toBe(false);
  });

  it("rejects a filled honeypot, and accepts the same entry once it is cleared", () => {
    const tripped = vendorInterestSchema.safeParse({ ...validInterest, [HONEYPOT_FIELD]: "autofilled" });
    expect(tripped.success).toBe(false);
    expect(tripped.error?.issues.map((issue) => issue.path.join("."))).toEqual([HONEYPOT_FIELD]);
    expect(vendorInterestSchema.safeParse({ ...validInterest, [HONEYPOT_FIELD]: "" }).success).toBe(true);
  });

  it("drops unknown keys", () => {
    const result = vendorInterestSchema.safeParse({ ...validInterest, admin: true });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("admin");
  });
});

const validClaim = {
  product: "hubspot-crm",
  name: "Priya Shah",
  email: "priya@acme-software.example",
  company: "Acme Software",
  role: "Head of Product",
  note: "We maintain the listing for the EU market.",
};

describe("claimSchema", () => {
  it("accepts a valid claim, with or without a note", () => {
    expect(claimSchema.safeParse(validClaim).success).toBe(true);
    expect(claimSchema.safeParse(without(validClaim, "note")).success).toBe(true);
    expect(claimSchema.safeParse({ ...validClaim, note: "" }).success).toBe(true);
  });

  it("requires the product, name, company and role", () => {
    for (const key of ["product", "name", "company", "role"] as const) {
      expect(claimSchema.safeParse({ ...validClaim, [key]: "" }).success, key).toBe(false);
      expect(claimSchema.safeParse({ ...validClaim, [key]: undefined }).success, key).toBe(false);
    }
  });

  it("rejects an email without @ and a filled honeypot", () => {
    expect(claimSchema.safeParse({ ...validClaim, email: "priya.acme.example" }).success).toBe(false);
    expect(claimSchema.safeParse({ ...validClaim, [HONEYPOT_FIELD]: "spam" }).success).toBe(false);
  });

  it("limits the note length", () => {
    expect(claimSchema.safeParse({ ...validClaim, note: "x".repeat(1001) }).success).toBe(false);
  });
});

describe("honeypot", () => {
  it("uses a key that autofill and bots do not treat as a URL or contact field", () => {
    expect(HONEYPOT_FIELD).not.toMatch(/website|url|site|email|phone|name|address|company/i);
  });

  it("is only a honeypot trip when the honeypot is the sole invalid field", () => {
    expect(isHoneypotOnly({ [HONEYPOT_FIELD]: { message: "x" } })).toBe(true);
    expect(isHoneypotOnly({ [HONEYPOT_FIELD]: { message: "x" }, headline: { message: "y" } })).toBe(false);
    expect(isHoneypotOnly({ headline: { message: "y" } })).toBe(false);
    expect(isHoneypotOnly({})).toBe(false);
  });

  it("a filled honeypot is rejected, and the same draft saves once it is cleared (retry)", () => {
    expect(reviewDraftSchema.safeParse({ ...validReview, [HONEYPOT_FIELD]: "autofilled" }).success).toBe(false);
    expect(reviewDraftSchema.safeParse({ ...validReview, [HONEYPOT_FIELD]: "" }).success).toBe(true);
  });

  it("has a neutral, actionable message that does not mention bots or spam", () => {
    expect(HONEYPOT_ERROR).toBe("We couldn't save this. Please try again.");
    expect(HONEYPOT_ERROR).not.toMatch(/bot|spam|hidden|honeypot/i);
  });

  it("does not name a form type, so every form can show it", () => {
    expect(HONEYPOT_ERROR).not.toMatch(/draft|message|claim|interest/i);
  });
});
