const jwt = require("jsonwebtoken");
const http = require("http");

const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET || "mysupersecretkey";

// 1x1 PNG (valid)
const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X8ZkAAAAASUVORK5CYII=";

const token = jwt.sign({ id: "000000000000000000000000", role: "user" }, JWT_SECRET, {
  expiresIn: "5m",
});

const body = JSON.stringify({ image });

const req = http.request(
  {
    hostname: "localhost",
    port: PORT,
    path: "/items/analyze-image",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Length": Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      console.log("STATUS", res.statusCode);
      console.log(data);
    });
  }
);

req.on("error", (e) => {
  console.error("REQUEST_ERROR", e);
  process.exitCode = 1;
});

req.write(body);
req.end();

