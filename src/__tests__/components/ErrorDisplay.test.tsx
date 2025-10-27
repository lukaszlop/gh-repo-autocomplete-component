import {ErrorDisplay} from "@/components/ErrorDisplay";
import type {SearchError} from "@/types/github";
import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";

describe("ErrorDisplay", () => {
  describe("Rendering", () => {
    it("should render error display with message", () => {
      const error: SearchError = {
        type: "network",
        message: "Connection error. Check your internet access.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
    });

    it("should display error message", () => {
      const error: SearchError = {
        type: "server",
        message: "GitHub API is currently unavailable. Please try again later.",
      };

      render(<ErrorDisplay error={error} />);

      const message = screen.getByText(
        /GitHub API is currently unavailable. Please try again later./i
      );
      expect(message).toBeInTheDocument();
    });

    it("should display error icon for errors", () => {
      const error: SearchError = {
        type: "network",
        message: "Connection error.",
      };

      const {container} = render(<ErrorDisplay error={error} />);

      // Find SVG element (lucide-react icons render as SVG)
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Error Types Styling", () => {
    it("should use error styling for network error", () => {
      const error: SearchError = {
        type: "network",
        message: "Connection error.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-red-50", "border-red-200");
    });

    it("should use error styling for server error", () => {
      const error: SearchError = {
        type: "server",
        message: "Server error.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-red-50", "border-red-200");
    });

    it("should use error styling for timeout error", () => {
      const error: SearchError = {
        type: "timeout",
        message: "Request timed out.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-red-50", "border-red-200");
    });

    it("should use error styling for client error", () => {
      const error: SearchError = {
        type: "client",
        message: "Client error.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-red-50", "border-red-200");
    });

    it("should use error styling for generic error", () => {
      const error: SearchError = {
        type: "generic",
        message: "An error occurred.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-red-50", "border-red-200");
    });

    it("should use warning styling for rate limit warning with Polish text", () => {
      const error: SearchError = {
        type: "rate_limit",
        message: "Zbliżasz się do limitu API.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-amber-50", "border-amber-200");
    });

    it("should use error styling for rate limit error without Polish text", () => {
      const error: SearchError = {
        type: "rate_limit",
        message: "API rate limit exceeded.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveClass("bg-red-50", "border-red-200");
    });
  });

  describe("Accessibility", () => {
    it("should have role='alert' for screen readers", () => {
      const error: SearchError = {
        type: "network",
        message: "Connection error.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveAttribute("role", "alert");
    });

    it("should have aria-live='assertive' for urgent announcements", () => {
      const error: SearchError = {
        type: "server",
        message: "Server error.",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toHaveAttribute("aria-live", "assertive");
    });

    it("should hide decorative icon from screen readers", () => {
      const error: SearchError = {
        type: "network",
        message: "Connection error.",
      };

      const {container} = render(<ErrorDisplay error={error} />);

      const icon = container.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty error message", () => {
      const error: SearchError = {
        type: "generic",
        message: "",
      };

      render(<ErrorDisplay error={error} />);

      const errorDisplay = screen.getByTestId("error-display");
      expect(errorDisplay).toBeInTheDocument();
    });

    it("should handle long error messages", () => {
      const error: SearchError = {
        type: "server",
        message:
          "This is a very long error message that should still be displayed correctly within the error display component without breaking the layout or causing any visual issues.",
      };

      render(<ErrorDisplay error={error} />);

      const message = screen.getByText(/This is a very long error message/i);
      expect(message).toBeInTheDocument();
    });

    it("should handle error with reset time", () => {
      const error: SearchError = {
        type: "rate_limit",
        message: "API rate limit exceeded. Please try again in 5 minutes.",
        resetTime: Math.floor(Date.now() / 1000) + 300,
      };

      render(<ErrorDisplay error={error} />);

      const message = screen.getByText(
        /API rate limit exceeded. Please try again in 5 minutes./i
      );
      expect(message).toBeInTheDocument();
    });
  });
});
