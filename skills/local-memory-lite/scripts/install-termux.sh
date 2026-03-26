#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FAKE_NDK_DIR="$ROOT_DIR/.termux-android-ndk"
CPUFEATURES_DIR="$FAKE_NDK_DIR/sources/android/cpufeatures"

mkdir -p "$CPUFEATURES_DIR"
printf 'Placeholder path for node-gyp on Termux/Android.\n' > "$CPUFEATURES_DIR/README.md"

cd "$ROOT_DIR"
rm -rf node_modules package-lock.json
npm_config_android_ndk_path="$FAKE_NDK_DIR" npm install "$@"

echo "✅ local-memory-lite installed on Termux"
