import {formatStarCount, sortResultsAlphabetically} from "@/lib/utils/format";
import type {SearchResultItem} from "@/types/github";
import {describe, expect, it} from "vitest";

describe("format utilities", () => {
  describe("formatStarCount", () => {
    it("should format numbers less than 1000", () => {
      expect(formatStarCount(0)).toBe("0 ★");
      expect(formatStarCount(123)).toBe("123 ★");
      expect(formatStarCount(999)).toBe("999 ★");
    });

    it("should format thousands with k suffix", () => {
      expect(formatStarCount(1000)).toBe("1k ★");
      expect(formatStarCount(1500)).toBe("1.5k ★");
      expect(formatStarCount(9999)).toBe("10k ★");
      expect(formatStarCount(12345)).toBe("12.3k ★");
    });

    it("should format millions with M suffix", () => {
      expect(formatStarCount(1000000)).toBe("1M ★");
      expect(formatStarCount(1500000)).toBe("1.5M ★");
      expect(formatStarCount(2200000)).toBe("2.2M ★");
    });

    it("should remove trailing .0", () => {
      expect(formatStarCount(1000)).toBe("1k ★");
      expect(formatStarCount(2000000)).toBe("2M ★");
    });
  });

  describe("sortResultsAlphabetically", () => {
    it("should sort results by name alphabetically", () => {
      const results: SearchResultItem[] = [
        {
          id: "1",
          type: "repo",
          name: "zebra-repo",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/zebra-repo",
        },
        {
          id: "2",
          type: "repo",
          name: "alpha-repo",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/alpha-repo",
        },
        {
          id: "3",
          type: "user",
          name: "beta-user",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/beta-user",
        },
      ];

      const sorted = sortResultsAlphabetically(results);

      expect(sorted[0].name).toBe("alpha-repo");
      expect(sorted[1].name).toBe("beta-user");
      expect(sorted[2].name).toBe("zebra-repo");
    });

    it("should sort case-insensitively", () => {
      const results: SearchResultItem[] = [
        {
          id: "1",
          type: "repo",
          name: "Zebra",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/Zebra",
        },
        {
          id: "2",
          type: "repo",
          name: "apple",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/apple",
        },
      ];

      const sorted = sortResultsAlphabetically(results);

      expect(sorted[0].name).toBe("apple");
      expect(sorted[1].name).toBe("Zebra");
    });

    it("should handle numeric strings naturally", () => {
      const results: SearchResultItem[] = [
        {
          id: "1",
          type: "repo",
          name: "item10",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/item10",
        },
        {
          id: "2",
          type: "repo",
          name: "item2",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/item2",
        },
      ];

      const sorted = sortResultsAlphabetically(results);

      expect(sorted[0].name).toBe("item2");
      expect(sorted[1].name).toBe("item10");
    });

    it("should not modify original array", () => {
      const results: SearchResultItem[] = [
        {
          id: "1",
          type: "repo",
          name: "zebra",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/zebra",
        },
        {
          id: "2",
          type: "repo",
          name: "alpha",
          avatarUrl: "https://example.com/avatar.jpg",
          url: "https://github.com/alpha",
        },
      ];

      const originalOrder = results.map((r) => r.name);
      sortResultsAlphabetically(results);

      expect(results.map((r) => r.name)).toEqual(originalOrder);
    });
  });
});
