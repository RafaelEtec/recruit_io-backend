import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { after, before, describe, test } from "node:test";
import app from "../src/app.js";

type ServerInstance = ReturnType<typeof app.listen>;

let server: ServerInstance;
let baseUrl: string;

before(async () => {
  server = app.listen(0);

  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
});

describe("API endpoints", () => {
  test("GET / deve retornar a mensagem de status", async () => {
    const response = await fetch(baseUrl + "/");

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message, "Recruit.io API online 🚀");
  });

  test("GET /health deve informar que a API está operante", async () => {
    const response = await fetch(baseUrl + "/health");

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
  });

  test("GET /api-docs deve servir a documentação Swagger", async () => {
    const response = await fetch(baseUrl + "/api-docs");

    assert.equal(response.status, 200);
    const contentType = response.headers.get("content-type") ?? "";
    assert.ok(contentType.includes("text/html"));
  });
});
