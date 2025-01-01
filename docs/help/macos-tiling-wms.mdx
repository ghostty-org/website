---
title: macOS Tiling Window Managers
description: |-
  Ghostty tabs may render as separate windows in macOS tiling
  window managers such as Yabai or Aerospace.
---

macOS tiling window managers such as Yabai or Aerospace may
render Ghostty tabs as separate windows. This is a known issue
that is well documented in both the Yabai and Aerospace
issue trackers.

Ghostty uses macOS native tabs. macOS native tabs are represented
as separate windows in the macOS window manager API. This is
the API that Yabai, Aerospace, and other tiling window managers
use to manage windows on macOS.

As such, this is a limitation of macOS APIs and there isn't
anything Ghostty can do to fix this issue.

<Note>
Longer term, we'd like to implement a custom tabbing solution
that doesn't rely on macOS native tabs. This would allow us
to better integrate with macOS tiling window managers.
</Note>

## Workarounds

The Ghostty community has identified potential workarounds
depending on the tiling window manager you are using.

### Aerospace

```toml
[[on-window-detected]]
if.app-id="com.mitchellh.ghostty"
run= [
  "layout tiling",
]
```

If Ghostty tabs are still being rendered as separate windows, try replacing `"layout tiling"` with `"layout floating"`. Note that this will cause the Ghostty window to be floating on initial startup. You can manually unfloat the window (`alt+shift+;` followed by `f` by default).

### Yabai

```
yabai -m signal --add app='^Ghostty$' event=window_created action='yabai -m space --layout bsp'
yabai -m signal --add app='^Ghostty$' event=window_destroyed action='yabai -m space --layout bsp'
```
