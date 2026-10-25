import { describe, expect, it } from "vitest";
import { digitsOnly, formatThousands } from "./amount";

describe("campaign target amount formatting", () => {
  it("formats rupiah with Indonesian thousands separators", () => {
    expect(formatThousands("45000000")).toBe("45.000.000");
  });

  it("normalizes formatted input to digits for the API payload", () => {
    expect(digitsOnly("45.000.000")).toBe("45000000");
  });
});
