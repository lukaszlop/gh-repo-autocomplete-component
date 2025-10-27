import {EmptyState} from "@/components/EmptyState";
import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";

describe("EmptyState", () => {
  describe("Rendering", () => {
    it("should render empty state with query", () => {
      render(<EmptyState query='react' />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toBeInTheDocument();
    });

    it("should display the search query in the message", () => {
      const query = "typescript";
      render(<EmptyState query={query} />);

      const message = screen.getByText(
        /No repositories or users found for 'typescript'/i
      );
      expect(message).toBeInTheDocument();
    });

    it("should display search icon", () => {
      const {container} = render(<EmptyState query='test-query' />);

      // Find SVG element (lucide-react icons render as SVG)
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Accessibility", () => {
    it("should have role='status' for screen readers", () => {
      render(<EmptyState query='react' />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveAttribute("role", "status");
    });

    it("should have aria-live='polite' for screen reader announcements", () => {
      render(<EmptyState query='react' />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveAttribute("aria-live", "polite");
    });

    it("should hide decorative icon from screen readers", () => {
      const {container} = render(<EmptyState query='test' />);

      const icon = container.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty query string", () => {
      render(<EmptyState query='' />);

      const message = screen.getByText(
        /No repositories or users found for ''/i
      );
      expect(message).toBeInTheDocument();
    });

    it("should handle long query strings", () => {
      const longQuery =
        "this-is-a-very-long-query-string-that-should-still-display";
      render(<EmptyState query={longQuery} />);

      const message = screen.getByText(
        new RegExp(`No repositories or users found for '${longQuery}'`, "i")
      );
      expect(message).toBeInTheDocument();
    });

    it("should handle special characters in query", () => {
      const specialQuery = "react-native@2.0";
      render(<EmptyState query={specialQuery} />);

      const message = screen.getByText(
        /No repositories or users found for 'react-native@2.0'/i
      );
      expect(message).toBeInTheDocument();
    });
  });
});
