import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AdminDashboard from "./AdminDashboard";

describe("AdminDashboard initial render", () => {
  it("renders the admin summary without a selected campaign", () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AdminDashboard),
      ),
    );

    expect(html).toContain("Ringkasan Admin");
  });

  it("renders the campaign review queue without a selected campaign", () => {
    const html = renderToString(
      createElement(
        MemoryRouter,
        null,
        createElement(AdminDashboard, { campaignQueue: true }),
      ),
    );

    expect(html).toContain("Tinjau Kebutuhan Sekolah");
  });
});
