# Kinetic: Text Animation Studio

A browser-based kinetic typography studio. Type text, choose an animation, customize its look, add synthesized sound effects, and record the result as a video.

## Project files

- `index.html` - App structure and page content.
- `styles.css` - Layout, responsive styling, controls, and font dropdown.
- `app.js` - Animation engine, font selection, sound generation, presets, and video recording.

## Run the app

1. Keep all three files in the same folder.
2. Open `index.html` in a modern browser.
3. For the most reliable results, serve the folder through a local web server. For example, with Python installed, run this from the project folder:

   ```bash
   python -m http.server 8000
   ```

   Then open `http://localhost:8000` in your browser.

## Features

- Eight animation modes: Bounce, Rotate, Fall, Dissolve, Wave, Typewriter, Glitch, and Path.
- Animate by letter or by word.
- Eight font choices in a compact dropdown.
- Text size, speed, text color, and background controls.
- Circle, infinity, wave, and spiral text paths.
- Synthesized sound effects with volume control.
- Presets for quick starting points.
- Canvas recording with sound, exported as WebM when supported by the browser.
- Responsive layout for desktop and mobile screens.

## Notes

- The app loads its display fonts from Google Fonts, so an internet connection is needed for those typefaces. System fallback fonts are used if they cannot be loaded.
- Sound starts after a user interaction because browsers restrict autoplay audio.
- Video recording depends on browser support for the Canvas Capture and MediaRecorder APIs. A modern Chromium-based browser is recommended.
- Recorded videos are created in the browser and are not uploaded to a server.
