import { describe, expect, it } from "vitest";

import { parseWebsite } from "./misc";

describe("misc utilities", () => {
  describe("parseWebsite", () => {
    it("should return empty string for empty input", () => {
      expect(parseWebsite("")).toBe("");
    });

    it("should return empty string for undefined input", () => {
      expect(parseWebsite(undefined)).toBe("");
    });

    it("should return empty string for whitespace-only input", () => {
      expect(parseWebsite("   ")).toBe("");
    });

    it("should add https:// prefix to bare domain", () => {
      expect(parseWebsite("example.com")).toBe("https://example.com");
    });

    it("should keep existing https:// prefix", () => {
      expect(parseWebsite("https://example.com")).toBe("https://example.com");
    });

    it("should apply URL mapping for known domains", () => {
      expect(parseWebsite("https://www.stakelab.fr")).toBe(
        "https://www.stakelab.zone",
      );
    });

    it("should handle http:// prefix by adding https://", () => {
      // Since it doesn't start with https://, it adds the prefix
      expect(parseWebsite("http://example.com")).toBe(
        "https://http://example.com",
      );
    });

    it("should handle URLs with paths", () => {
      expect(parseWebsite("example.com/about")).toBe(
        "https://example.com/about",
      );
    });

    it("should handle URLs with subdomains", () => {
      expect(parseWebsite("www.example.com")).toBe("https://www.example.com");
    });
  });
});
