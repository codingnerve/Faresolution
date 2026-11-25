import type { Block } from "../types";

// Small constructors that keep the article files readable.
export const h2 = (text: string): Block => ({ type: "h2", text });
export const h3 = (text: string): Block => ({ type: "h3", text });
export const p = (text: string): Block => ({ type: "p", text });
export const ul = (...items: string[]): Block => ({ type: "ul", items });
export const callout = (title: string, text: string): Block => ({ type: "callout", title, text });
