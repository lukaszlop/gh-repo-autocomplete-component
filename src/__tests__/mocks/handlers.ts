import type {GitHubRepository, GitHubUser} from "@/types/github";
import {http, HttpResponse} from "msw";

// Mock data for repositories
export const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: "react",
    full_name: "facebook/react",
    owner: {
      login: "facebook",
      avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
    },
    description:
      "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    html_url: "https://github.com/facebook/react",
    stargazers_count: 220000,
    language: "JavaScript",
    updated_at: "2024-10-27T10:00:00Z",
  },
  {
    id: 2,
    name: "vue",
    full_name: "vuejs/vue",
    owner: {
      login: "vuejs",
      avatar_url: "https://avatars.githubusercontent.com/u/6128107?v=4",
    },
    description:
      "Vue.js is a progressive, incrementally-adoptable JavaScript framework.",
    html_url: "https://github.com/vuejs/vue",
    stargazers_count: 207000,
    language: "TypeScript",
    updated_at: "2024-10-26T10:00:00Z",
  },
  {
    id: 3,
    name: "react-native",
    full_name: "facebook/react-native",
    owner: {
      login: "facebook",
      avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
    },
    description: "A framework for building native apps with React.",
    html_url: "https://github.com/facebook/react-native",
    stargazers_count: 115000,
    language: "C++",
    updated_at: "2024-10-25T10:00:00Z",
  },
];

// Mock data for users
export const mockUsers: GitHubUser[] = [
  {
    login: "torvalds",
    id: 1024025,
    avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
    html_url: "https://github.com/torvalds",
    name: "Linus Torvalds",
    bio: "Creator of Linux and Git",
  },
  {
    login: "gaearon",
    id: 810438,
    avatar_url: "https://avatars.githubusercontent.com/u/810438?v=4",
    html_url: "https://github.com/gaearon",
    name: "Dan Abramov",
    bio: "Working on React",
  },
];

export const handlers = [
  // Search repositories endpoint
  http.get("https://api.github.com/search/repositories", ({request}) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const perPage = url.searchParams.get("per_page");

    if (!query) {
      return HttpResponse.json({message: "Validation Failed"}, {status: 422});
    }

    // Simulate rate limit error
    if (query === "rate-limit-test") {
      return HttpResponse.json(
        {
          message: "API rate limit exceeded",
          documentation_url:
            "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting",
        },
        {status: 403}
      );
    }

    // Simulate network error
    if (query === "network-error") {
      return HttpResponse.error();
    }

    // Filter repositories by query
    const filteredRepos = mockRepositories.filter((repo) =>
      repo.full_name.toLowerCase().includes(query.toLowerCase())
    );

    const limit = perPage ? parseInt(perPage) : 10;

    return HttpResponse.json({
      total_count: filteredRepos.length,
      incomplete_results: false,
      items: filteredRepos.slice(0, limit),
    });
  }),

  // Search users endpoint
  http.get("https://api.github.com/search/users", ({request}) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const perPage = url.searchParams.get("per_page");

    if (!query) {
      return HttpResponse.json({message: "Validation Failed"}, {status: 422});
    }

    // Filter users by query
    const filteredUsers = mockUsers.filter((user) =>
      user.login.toLowerCase().includes(query.toLowerCase())
    );

    const limit = perPage ? parseInt(perPage) : 10;

    return HttpResponse.json({
      total_count: filteredUsers.length,
      incomplete_results: false,
      items: filteredUsers.slice(0, limit),
    });
  }),

  // Get user details endpoint
  http.get("https://api.github.com/users/:username", ({params}) => {
    const {username} = params;
    const user = mockUsers.find((u) => u.login === username);

    if (!user) {
      return HttpResponse.json({message: "Not Found"}, {status: 404});
    }

    return HttpResponse.json(user);
  }),
];
