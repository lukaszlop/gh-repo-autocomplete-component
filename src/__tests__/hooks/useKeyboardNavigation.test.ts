import {useKeyboardNavigation} from "@/hooks/useKeyboardNavigation";
import {act, renderHook} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";

describe("useKeyboardNavigation", () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe("Initialization", () => {
    it("should initialize with activeIndex -1", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      expect(result.current.activeIndex).toBe(-1);
    });

    it("should provide all required functions", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      expect(typeof result.current.handleKeyDown).toBe("function");
      expect(typeof result.current.resetActiveIndex).toBe("function");
      expect(typeof result.current.setActiveIndex).toBe("function");
    });
  });

  describe("Arrow Down Navigation", () => {
    it("should move to first item when pressing ArrowDown from -1", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(0);
    });

    it("should move to next item when pressing ArrowDown", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(1);
      });

      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.activeIndex).toBe(2);
    });

    it("should wrap to first item when pressing ArrowDown on last item", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(4); // Last item
      });

      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.activeIndex).toBe(0);
    });
  });

  describe("Arrow Up Navigation", () => {
    it("should move to last item when pressing ArrowUp from -1", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      const event = {
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(4);
    });

    it("should move to previous item when pressing ArrowUp", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      const event = {
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.activeIndex).toBe(1);
    });

    it("should wrap to last item when pressing ArrowUp on first item", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(0); // First item
      });

      const event = {
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(result.current.activeIndex).toBe(4);
    });
  });

  describe("Enter Key Selection", () => {
    it("should call onSelect with active index when pressing Enter", () => {
      const onSelect = vi.fn();
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect,
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      const event = {
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it("should call onSelect with 0 when pressing Enter without active index", () => {
      const onSelect = vi.fn();
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect,
          isOpen: true,
        })
      );

      const event = {
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(onSelect).toHaveBeenCalledWith(0);
    });

    it("should not call onSelect when pressing Enter with no items", () => {
      const onSelect = vi.fn();
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 0,
          onSelect,
          isOpen: true,
        })
      );

      const event = {
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("Escape Key", () => {
    it("should reset active index when pressing Escape", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      expect(result.current.activeIndex).toBe(2);

      const event = {
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(-1);
    });

    it("should call onEscape callback when pressing Escape", () => {
      const onEscape = vi.fn();
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
          onEscape,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      const event = {
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onEscape).toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(-1);
    });

    it("should not fail when pressing Escape without onEscape callback", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      const event = {
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      expect(() => {
        act(() => {
          result.current.handleKeyDown(event);
        });
      }).not.toThrow();

      expect(result.current.activeIndex).toBe(-1);
    });
  });

  describe("Reset Active Index", () => {
    it("should reset active index to -1", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(3);
      });

      expect(result.current.activeIndex).toBe(3);

      act(() => {
        result.current.resetActiveIndex();
      });

      expect(result.current.activeIndex).toBe(-1);
    });
  });

  describe("Set Active Index", () => {
    it("should update active index", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      expect(result.current.activeIndex).toBe(2);
    });
  });

  describe("Open State Effects", () => {
    it("should reset active index when dropdown closes", () => {
      const {result, rerender} = renderHook(
        ({isOpen}) =>
          useKeyboardNavigation({
            itemsCount: 5,
            onSelect: vi.fn(),
            isOpen,
          }),
        {initialProps: {isOpen: true}}
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      expect(result.current.activeIndex).toBe(2);

      rerender({isOpen: false});

      expect(result.current.activeIndex).toBe(-1);
    });

    it("should reset active index when items count becomes 0", () => {
      const {result, rerender} = renderHook(
        ({itemsCount}) =>
          useKeyboardNavigation({
            itemsCount,
            onSelect: vi.fn(),
            isOpen: true,
          }),
        {initialProps: {itemsCount: 5}}
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      expect(result.current.activeIndex).toBe(2);

      rerender({itemsCount: 0});

      expect(result.current.activeIndex).toBe(-1);
    });

    it("should not handle keyboard events when dropdown is closed", () => {
      const onSelect = vi.fn();
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect,
          isOpen: false,
        })
      );

      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(-1);
    });

    it("should not handle keyboard events when items count is 0", () => {
      const onSelect = vi.fn();
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 0,
          onSelect,
          isOpen: true,
        })
      );

      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(-1);
    });
  });

  describe("Auto-scroll", () => {
    it("should call scrollIntoView when active index changes", () => {
      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      vi.spyOn(document, "getElementById").mockReturnValue(
        mockElement as unknown as HTMLElement
      );

      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      expect(document.getElementById).toHaveBeenCalledWith("result-2");
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        block: "nearest",
        behavior: "smooth",
      });

      vi.restoreAllMocks();
    });

    it("should not call scrollIntoView when element does not exist", () => {
      vi.spyOn(document, "getElementById").mockReturnValue(null);

      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      expect(document.getElementById).toHaveBeenCalledWith("result-2");

      vi.restoreAllMocks();
    });

    it("should not call scrollIntoView when dropdown is closed", () => {
      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      vi.spyOn(document, "getElementById").mockReturnValue(
        mockElement as unknown as HTMLElement
      );

      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: false,
        })
      );

      act(() => {
        result.current.setActiveIndex(2);
      });

      // activeIndex resets to -1 when isOpen is false
      expect(document.getElementById).not.toHaveBeenCalled();
      expect(mockElement.scrollIntoView).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single item list", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 1,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      const eventDown = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(eventDown);
      });

      expect(result.current.activeIndex).toBe(0);

      const eventDownAgain = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(eventDownAgain);
      });

      // Should wrap back to 0
      expect(result.current.activeIndex).toBe(0);
    });

    it("should ignore unhandled keys", () => {
      const {result} = renderHook(() =>
        useKeyboardNavigation({
          itemsCount: 5,
          onSelect: vi.fn(),
          isOpen: true,
        })
      );

      const event = {
        key: "Tab",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result.current.activeIndex).toBe(-1);
    });
  });
});
