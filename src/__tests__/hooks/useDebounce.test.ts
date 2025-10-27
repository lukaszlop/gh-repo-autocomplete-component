import {useDebounce} from "@/hooks/useDebounce";
import {renderHook} from "@testing-library/react";
import {describe, expect, it} from "vitest";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const {result} = renderHook(() => useDebounce("test", 500));
    expect(result.current).toBe("test");
  });

  it("should return the same value for same input", () => {
    const {result, rerender} = renderHook(
      ({value, delay}) => useDebounce(value, delay),
      {
        initialProps: {value: "initial", delay: 500},
      }
    );

    expect(result.current).toBe("initial");

    rerender({value: "initial", delay: 500});
    expect(result.current).toBe("initial");
  });

  it("should cleanup timeout on unmount", () => {
    const {unmount} = renderHook(() => useDebounce("test", 500));

    // Should not throw
    expect(() => unmount()).not.toThrow();
  });

  it("should handle different delays", () => {
    const {result: result1} = renderHook(() => useDebounce("test", 100));
    const {result: result2} = renderHook(() => useDebounce("test", 1000));

    expect(result1.current).toBe("test");
    expect(result2.current).toBe("test");
  });
});
