import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";

describe("API", () => {
  it("GET /health returns 200 and ok when database query succeeds", async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rows: [] }),
    };

    const app = createApp({ pool });
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.text).toBe("ok");
    expect(pool.query).toHaveBeenCalledWith("SELECT 1");
  });

  it("POST /notes without title returns 400 and does not call pool.query", async () => {
    const pool = {
      query: vi.fn(),
    };

    const app = createApp({ pool });
    const response = await request(app).post("/notes").send({ content: "hello" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "title is required" });
    expect(pool.query).not.toHaveBeenCalled();
  });
});
