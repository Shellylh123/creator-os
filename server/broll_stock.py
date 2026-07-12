#!/usr/bin/env python3.11
"""B-roll 素材检索 / 下载 helper（纯标准库，无第三方依赖）。

被 server/broll.js 用 child_process 调用。两个子命令：

  search  --type <screenshot|chart|footage|diagram> --query "<en>" [--n 3]
          按 type 决定搜视频还是图片；provider 优先 pexels，无 key 退 pixabay。
          只取候选元信息 + 缩略图 URL，**不下载原件**。
          stdout: {"candidates":[{id,thumb_url,download_url,duration,width,height,source}]}

  download --url "<download_url>" --dest "<abs path>"
          下载选中素材到 dest。stdout: {"path":..., "bytes":...}

任何错误都以 {"error": "..."} 打到 stdout 并 exit 1，方便 Node 侧透传给前端。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# type -> 搜图还是搜视频。截图/图表/图示当静态图搜，其余当视频（视频优先）。
IMAGE_TYPES = {"screenshot", "chart", "diagram"}


def load_env() -> None:
    """把项目根 .env 读进 os.environ（已存在的不覆盖）。"""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip("'\"")
        if key and key not in os.environ:
            os.environ[key] = value


def http_get_json(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---------------- Pexels ----------------

def pexels_video(query: str, n: int, api_key: str) -> list[dict]:
    url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
        {"query": query, "per_page": max(n, 3), "orientation": "portrait"}
    )
    data = http_get_json(url, {"Authorization": api_key})
    out = []
    for v in data.get("videos", [])[:n]:
        files = sorted(v.get("video_files", []), key=lambda f: f.get("width") or 0, reverse=True)
        hd = next((f for f in files if f.get("quality") == "hd"), files[0] if files else None)
        if not hd:
            continue
        out.append({
            "id": v.get("id"),
            "thumb_url": v.get("image", ""),
            "download_url": hd["link"],
            "duration": v.get("duration"),
            "width": hd.get("width"),
            "height": hd.get("height"),
            "source": "pexels",
        })
    return out


def pexels_image(query: str, n: int, api_key: str) -> list[dict]:
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": query, "per_page": max(n, 3), "orientation": "portrait"}
    )
    data = http_get_json(url, {"Authorization": api_key})
    out = []
    for p in data.get("photos", [])[:n]:
        src = p.get("src", {})
        out.append({
            "id": p.get("id"),
            "thumb_url": src.get("medium", ""),
            "download_url": src.get("large2x") or src.get("original", ""),
            "duration": None,
            "width": p.get("width"),
            "height": p.get("height"),
            "source": "pexels",
        })
    return out


# ---------------- Pixabay ----------------

def pixabay_video(query: str, n: int, api_key: str) -> list[dict]:
    url = "https://pixabay.com/api/videos/?" + urllib.parse.urlencode(
        {"key": api_key, "q": query, "per_page": max(n, 3), "safesearch": "true"}
    )
    data = http_get_json(url)
    out = []
    for h in data.get("hits", [])[:n]:
        v = h.get("videos", {})
        best = v.get("large") or v.get("medium") or v.get("small") or v.get("tiny")
        if not best:
            continue
        out.append({
            "id": h.get("id"),
            "thumb_url": best.get("thumbnail", ""),
            "download_url": best.get("url"),
            "duration": h.get("duration"),
            "width": best.get("width"),
            "height": best.get("height"),
            "source": "pixabay",
        })
    return out


def pixabay_image(query: str, n: int, api_key: str) -> list[dict]:
    url = "https://pixabay.com/api/?" + urllib.parse.urlencode(
        {"key": api_key, "q": query, "per_page": max(n, 3),
         "safesearch": "true", "image_type": "photo"}
    )
    data = http_get_json(url)
    out = []
    for h in data.get("hits", [])[:n]:
        out.append({
            "id": h.get("id"),
            "thumb_url": h.get("previewURL", ""),
            "download_url": h.get("largeImageURL"),
            "duration": None,
            "width": h.get("imageWidth"),
            "height": h.get("imageHeight"),
            "source": "pixabay",
        })
    return out


def do_search(args) -> None:
    want_image = args.type in IMAGE_TYPES
    pexels_key = os.environ.get("PEXELS_API_KEY")
    pixabay_key = os.environ.get("PIXABAY_API_KEY")

    if not pexels_key and not pixabay_key:
        fail("未配置素材 API key：请在项目根 .env 里设置 PEXELS_API_KEY（或 PIXABAY_API_KEY）。"
             "免费申请：https://www.pexels.com/api/")

    # provider 优先 pexels，失败或无 key 时退 pixabay。
    errors = []
    for provider in ("pexels", "pixabay"):
        key = pexels_key if provider == "pexels" else pixabay_key
        if not key:
            continue
        try:
            if provider == "pexels":
                cands = pexels_image(args.query, args.n, key) if want_image \
                    else pexels_video(args.query, args.n, key)
            else:
                cands = pixabay_image(args.query, args.n, key) if want_image \
                    else pixabay_video(args.query, args.n, key)
            if cands:
                print(json.dumps({"candidates": cands}))
                return
            errors.append(f"{provider}: 无结果")
        except Exception as e:  # noqa: BLE001
            errors.append(f"{provider}: {e}")

    # 两个 provider 都没给出结果 —— 返回空候选而非报错，让单个点降级不影响整批。
    print(json.dumps({"candidates": [], "note": "; ".join(errors)}))


def do_download(args) -> None:
    dest = Path(args.dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(args.url, headers={"User-Agent": "creator-os-broll/0.1"})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
    except Exception as e:  # noqa: BLE001
        fail(f"下载失败：{e}")
    dest.write_bytes(data)
    print(json.dumps({"path": str(dest), "bytes": len(data)}))


def fail(msg: str) -> None:
    print(json.dumps({"error": msg}))
    sys.exit(1)


def main() -> None:
    load_env()
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search")
    s.add_argument("--type", default="footage")
    s.add_argument("--query", required=True)
    s.add_argument("--n", type=int, default=3)
    s.set_defaults(func=do_search)

    d = sub.add_parser("download")
    d.add_argument("--url", required=True)
    d.add_argument("--dest", required=True)
    d.set_defaults(func=do_download)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
