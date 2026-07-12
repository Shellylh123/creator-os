#!/usr/bin/env bash
# B-roll /render 自测：生成测试底片 + 测试素材，跑一次合成，用 ffprobe 校验输出。
# 不依赖任何 API key（只测 ffmpeg 合成链路）。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FFMPEG=/opt/homebrew/bin/ffmpeg
FFPROBE=/opt/homebrew/bin/ffprobe
WORK="$ROOT/workspace/_broll_test"
ASSETS="$WORK/assets"
mkdir -p "$ASSETS"

VIDEO="$WORK/koubo.mp4"        # 20s 竖屏 1080x1440 口播底片（testsrc + 正弦音轨）
IMG="$ASSETS/test_image.png"   # 图片素材
VCLIP="$ASSETS/test_clip.mp4"  # 视频素材

echo "==> 生成 20s 测试底片 1080x1440（带音轨）"
"$FFMPEG" -y -f lavfi -i "testsrc2=size=1080x1440:rate=30:duration=20" \
  -f lavfi -i "sine=frequency=440:duration=20" \
  -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "$VIDEO" >/dev/null 2>&1

echo "==> 生成测试图片素材 800x600"
"$FFMPEG" -y -f lavfi -i "color=c=orange:size=800x600:duration=1" -frames:v 1 "$IMG" >/dev/null 2>&1

echo "==> 生成测试视频素材 5s"
"$FFMPEG" -y -f lavfi -i "testsrc=size=640x480:rate=30:duration=5" \
  -c:v libx264 -pix_fmt yuv420p "$VCLIP" >/dev/null 2>&1

echo "==> 调 /render 合成"
RESP="$(node "$ROOT/scripts/render_smoke.js" "$VIDEO" "$IMG" "$VCLIP")"
echo "    响应: $RESP"

OUT="$WORK/final_broll.mp4"
if [ ! -f "$OUT" ]; then
  echo "FAIL: 未生成 $OUT"; exit 1
fi

echo "==> ffprobe 校验输出"
DUR="$("$FFPROBE" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT")"
RES="$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUT")"
ACODEC="$("$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$OUT" || true)"
echo "    时长=${DUR}s  分辨率=${RES}  音轨=${ACODEC:-无}"

# 断言：分辨率 1080x1440，时长约 20s（19-21），有音轨（证明原声保留）。
[ "$RES" = "1080x1440" ] || { echo "FAIL: 分辨率应为 1080x1440，实际 $RES"; exit 1; }
awk "BEGIN{exit !($DUR>19 && $DUR<21)}" || { echo "FAIL: 时长应约 20s，实际 $DUR"; exit 1; }
[ -n "${ACODEC:-}" ] || { echo "FAIL: 输出丢失原声音轨"; exit 1; }

echo "PASS: B-roll /render 合成链路正常。输出 -> $OUT"
