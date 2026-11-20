#!/usr/bin/env bash
set -euo pipefail

apk="${1:?informe o APK a instalar}"
activity='com.eldoria.cronicas/.MainActivity'
screen="$(mktemp)"
trap 'rm -f "$screen"' EXIT

find_text() {
  local expected="$1"
  local attempt
  for attempt in {1..6}; do
    if adb shell uiautomator dump /sdcard/eldoria-ui.xml >/dev/null &&
      adb exec-out cat /sdcard/eldoria-ui.xml > "$screen"; then
      if python3 - "$screen" "$expected" <<'PY'
import re
import sys
import xml.etree.ElementTree as ET

xml, label = sys.argv[1:]
for node in ET.parse(xml).iter('node'):
    if label in (node.get('text'), node.get('content-desc')):
        bounds = list(map(int, re.findall(r'\d+', node.attrib['bounds'])))
        print((bounds[0] + bounds[2]) // 2, (bounds[1] + bounds[3]) // 2)
        break
else:
    sys.exit(1)
PY
      then return 0
      fi
    fi
    sleep 2
  done
  printf 'Elemento ausente na interface Android: %s\n' "$expected" >&2
  return 1
}

adb install -r "$apk"
adb shell cmd connectivity airplane-mode enable
adb shell input keyevent KEYCODE_WAKEUP
adb shell wm dismiss-keyguard
adb shell am start -W -n "$activity"
read -r x y < <(find_text 'NOVA AVENTURA')
adb shell input tap "$x" "$y"
find_text 'ESCOLHER CLASSE' >/dev/null
adb shell input keyevent KEYCODE_HOME
adb shell am start -W -n "$activity"
find_text 'ESCOLHER CLASSE' >/dev/null
echo 'APK instalado e iniciado em modo avião. Seleção de personagem e retomada verificadas.'
