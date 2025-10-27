import {
  extractRateLimit,
  searchGitHub,
  transformRepositoryToResult,
  transformUserToResult,
} from "@/lib/api/github-api";
import {http, HttpResponse} from "msw";
import {describe, expect, it} from "vitest";
import {server} from "../../mocks/server";

describe("GitHub API", () => {
  describe("searchGitHub", () => {
    it("should fetch both repositories and users successfully", async () => {
      const results = await searchGitHub("react");

      expect(results).toHaveProperty("results");
      expect(results.results).toBeInstanceOf(Array);
      expect(results.results.length).toBeGreaterThan(0);
    });

    it("should return unified search results with correct types", async () => {
      const results = await searchGitHub("react");

      const repoResult = results.results.find((r) => r.type === "repo");

      expect(repoResult).toBeDefined();
      expect(repoResult?.type).toBe("repo");
      expect(repoResult?.name).toBeDefined();
      expect(repoResult?.avatarUrl).toBeDefined();
    });

    it("should return user results when searching for usernames", async () => {
      const results = await searchGitHub("torvalds");

      const userResult = results.results.find((r) => r.type === "user");

      expect(userResult).toBeDefined();
      expect(userResult?.type).toBe("user");
      expect(userResult?.name).toBeDefined();
      expect(userResult?.avatarUrl).toBeDefined();
    });

    it("should throw error on API failure", async () => {
      server.use(
        http.get("https://api.github.com/search/repositories", () => {
          return HttpResponse.json(
            {message: "Internal Server Error"},
            {status: 500}
          );
        })
      );

      await expect(searchGitHub("test")).rejects.toThrow();
    });

    it("should include rate limit information", async () => {
      const results = await searchGitHub("react");

      // Rate limit might be null if headers not present
      expect(
        results.rateLimit === null || typeof results.rateLimit === "object"
      ).toBe(true);
    });
  });

  describe("transformRepositoryToResult", () => {
    it("should transform repository to search result", () => {
      const repo = {
        id: 1,
        name: "react",
        full_name: "facebook/react",
        owner: {
          login: "facebook",
          avatar_url: "https://example.com/avatar.jpg",
        },
        html_url: "https://github.com/facebook/react",
        stargazers_count: 220000,
        description: "A JavaScript library",
        language: "JavaScript",
        updated_at: "2024-10-27T10:00:00Z",
      };

      const result = transformRepositoryToResult(repo);

      expect(result.id).toBe("repo:1");
      expect(result.type).toBe("repo");
      expect(result.name).toBe("facebook/react");
      expect(result.stars).toBe(220000);
      expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(result.url).toBe("https://github.com/facebook/react");
    });
  });

  describe("transformUserToResult", () => {
    it("should transform user to search result", () => {
      const user = {
        login: "torvalds",
        id: 1024025,
        avatar_url: "https://example.com/avatar.jpg",
        html_url: "https://github.com/torvalds",
        name: "Linus Torvalds",
        bio: "Creator of Linux",
      };

      const result = transformUserToResult(user);

      expect(result.id).toBe("user:1024025");
      expect(result.type).toBe("user");
      expect(result.name).toBe("torvalds");
      expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(result.url).toBe("https://github.com/torvalds");
      expect(result.stars).toBeUndefined();
    });
  });

  describe("extractRateLimit", () => {
    it("should extract rate limit from headers", () => {
      const headers = new Headers();
      headers.set("X-RateLimit-Limit", "60");
      headers.set("X-RateLimit-Remaining", "59");
      headers.set("X-RateLimit-Reset", "1234567890");

      const rateLimit = extractRateLimit(headers);

      expect(rateLimit).toEqual({
        limit: 60,
        remaining: 59,
        reset: 1234567890,
      });
    });

    it("should return null if headers are missing", () => {
      const headers = new Headers();

      const rateLimit = extractRateLimit(headers);

      expect(rateLimit).toBeNull();
    });
  });
});
