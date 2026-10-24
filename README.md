# Liquid Glass Clock

A simple digital **Clock**, **Timer** and **Stopwatch** app with a 3D-looking liquid glass UI. Built with plain HTML, CSS and JavaScript. No frameworks, no dependencies.

## Features

- **Clock**: live 12-hour time with AM/PM and the full date.
- **Timer**: set hours, minutes and seconds, then start, pause, resume or reset. A progress ring drains as time runs, and a beep plays three times when it hits zero.
- **Stopwatch**: counts to hundredths of a second with start/stop, lap and reset. Each lap shows its split and total time.
- **Liquid glass look**: frosted blur, glossy edge highlights and a soft sheen over slowly drifting colour blobs.
- **3D feel**: the card tilts toward your mouse, and the digits have a raised, extruded look.
- **Responsive**: works on desktop and phone screens.
- **Reduced motion**: background animation and card tilt easing are turned off if your system asks for reduced motion.

## Project Structure

```
.
├── index.html   # Page structure (tabs, clock, timer, stopwatch)
├── style.css    # Liquid glass styling, 3D effects, layout
├── script.js    # Clock, timer, stopwatch logic and tab switching
└── README.md
```

## How to Run

1. Keep `index.html`, `style.css` and `script.js` in the same folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).

No build step or server is needed.

## How to Use

- Click the **Clock**, **Timer** or **Stopwatch** tab at the top.
- **Timer**: enter the time, press **Start**. Press **Pause** to pause and **Resume** to continue. **Reset** returns to the time-entry view.
- **Stopwatch**: press **Start**, use **Lap** while it runs, and **Reset** to clear everything.

## Notes

- Browsers only allow sound after you interact with the page, so the timer beep works once you have clicked something (pressing Start counts).
- The frosted glass effect uses `backdrop-filter`, which needs a recent browser.

## Customizing

- **Colours**: change the blob colours (`.b1` to `.b4`) in `style.css`.
- **Glass strength**: adjust the `blur()` value in the `.glass` rule.
- **Tilt amount**: change the `14` multipliers in the pointer-move handler in `script.js`.
- **Beep sound**: edit the frequency (`880`) or the delays in the `beep()` function.

## License

Free to use and modify for personal projects.
