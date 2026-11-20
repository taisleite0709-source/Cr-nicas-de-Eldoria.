#!/usr/bin/env bash
set -euo pipefail

apk="${1:?informe o APK a instalar}"
activity='com.eldoria.cronicas/.MainActivity'
trap 'adb forward --remove tcp:9222 >/dev/null 2>&1 || true' EXIT

adb install -r "$apk"
adb shell cmd connectivity airplane-mode enable
adb shell input keyevent KEYCODE_WAKEUP
adb shell wm dismiss-keyguard
adb shell am start -W -n "$activity"
pid="$(adb shell pidof com.eldoria.cronicas | tr -d '\r')"
adb forward tcp:9222 "localabstract:webview_devtools_remote_$pid"

if ! node tests/android-webview-smoke.js; then
  adb logcat -d -t 250 -s AndroidRuntime chromium
  exit 1
fi
