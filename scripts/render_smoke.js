// 冒烟测试用的临时 harness：把 broll 路由挂到随机端口，POST 一次 /render，打印结果后退出。
// 不改 server/index.js。被 scripts/test_broll.sh 调用。
// 用法: node render_smoke.js <videoPath> <imageAsset> <videoAsset>
const express = require("express");
const http = require("http");
const broll = require("../server/broll");

const [, , videoPath, imageAsset, videoAsset] = process.argv;

const app = express();
app.use(express.json());
app.use("/api/broll", broll);

const server = app.listen(0, () => {
  const port = server.address().port;
  const payload = JSON.stringify({
    projectId: "_broll_test",
    videoPath,
    items: [
      { start: 2, end: 6, assetPath: imageAsset, mode: "pip" },   // 图片 + 画中画
      { start: 10, end: 15, assetPath: videoAsset, mode: "full" }, // 视频 + 全屏插入
    ],
  });

  const req = http.request(
    { host: "127.0.0.1", port, path: "/api/broll/render", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } },
    (resp) => {
      let body = "";
      resp.on("data", (c) => (body += c));
      resp.on("end", () => {
        console.log(body);
        server.close();
        process.exit(resp.statusCode === 200 ? 0 : 1);
      });
    },
  );
  req.on("error", (e) => { console.error(e); process.exit(1); });
  req.write(payload);
  req.end();
});
