import type { StylePreferences } from "./types";
import { strokeWeightValues, backgroundColors } from "./types";

/**
 * Post-process canvas SVG: add compass rose, scale bar, pin labels, coastline effect
 */
export function postProcessSVG(
  rawSVG: string,
  prefs: StylePreferences,
  pins: Array<{ title: string; x: number; y: number }>,
  canvasWidth: number,
  canvasHeight: number,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSVG, "image/svg+xml");
  const svg = doc.documentElement;

  const colors = backgroundColors[prefs.background];
  const sw = strokeWeightValues[prefs.strokeWeight];

  // Add compass rose
  const compass = doc.createElementNS("http://www.w3.org/2000/svg", "g");
  compass.setAttribute("transform", `translate(${canvasWidth - 50}, ${canvasHeight - 50})`);
  compass.innerHTML = `
    <circle cx="0" cy="0" r="18" fill="none" stroke="${colors.stroke}" stroke-width="0.5" opacity="0.6"/>
    <line x1="0" y1="-16" x2="0" y2="16" stroke="${colors.stroke}" stroke-width="0.8" opacity="0.6"/>
    <line x1="-16" y1="0" x2="16" y2="0" stroke="${colors.stroke}" stroke-width="0.8" opacity="0.6"/>
    <polygon points="0,-14 -3,-4 3,-4" fill="${colors.stroke}" opacity="0.6"/>
    <text x="0" y="-22" text-anchor="middle" font-size="7" fill="${colors.stroke}" font-weight="600" opacity="0.8">N</text>
    <text x="0" y="28" text-anchor="middle" font-size="6" fill="${colors.stroke}" opacity="0.5">S</text>
    <text x="22" y="3" text-anchor="start" font-size="6" fill="${colors.stroke}" opacity="0.5">E</text>
    <text x="-22" y="3" text-anchor="end" font-size="6" fill="${colors.stroke}" opacity="0.5">W</text>
  `;
  svg.appendChild(compass);

  // Add scale bar
  const scale = doc.createElementNS("http://www.w3.org/2000/svg", "g");
  scale.setAttribute("transform", `translate(30, ${canvasHeight - 30})`);
  scale.innerHTML = `
    <line x1="0" y1="0" x2="60" y2="0" stroke="${colors.stroke}" stroke-width="1" opacity="0.5"/>
    <line x1="0" y1="-4" x2="0" y2="4" stroke="${colors.stroke}" stroke-width="1" opacity="0.5"/>
    <line x1="60" y1="-4" x2="60" y2="4" stroke="${colors.stroke}" stroke-width="1" opacity="0.5"/>
    <text x="30" y="12" text-anchor="middle" font-size="7" fill="${colors.stroke}" opacity="0.4">Scale</text>
  `;
  svg.appendChild(scale);

  // Add pin labels
  if (prefs.labelStyle !== "hidden") {
    const fontFamily = prefs.labelStyle === "serif"
      ? "'Playfair Display', serif"
      : "'DM Sans', sans-serif";

    pins.forEach((pin) => {
      const label = doc.createElementNS("http://www.w3.org/2000/svg", "g");
      label.innerHTML = `
        <circle cx="${pin.x}" cy="${pin.y}" r="3" fill="${colors.stroke}" opacity="0.6"/>
        <text x="${pin.x + 8}" y="${pin.y + 3}" font-size="10" fill="${colors.stroke}" opacity="0.8" font-family="${fontFamily}">${pin.title}</text>
      `;
      svg.appendChild(label);
    });
  }

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Export SVG as downloadable file
 */
export function exportSVG(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-map.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export canvas as PNG
 */
export function exportPNG(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}-map.png`;
  a.click();
}
