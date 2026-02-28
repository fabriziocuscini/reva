/**
 * OKLCH Palette Generator for Reva Design System
 *
 * Generates colour palettes from a defined anchor point using OKLCH colour space.
 * By default the anchor is at step 500, but it can be placed at any step (e.g.
 * 600 for amber). Chroma peaks at the anchor and tapers towards both light and
 * dark extremes, producing a refined "industrial luxury" aesthetic.
 *
 * Usage:
 *   bun run scripts/generate-palette.ts
 */

import chroma from "chroma-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaletteConfig {
  /** Human-readable name, used as the token group key (e.g. "teal") */
  name: string;
  /**
   * The anchor colour defined in OKLCH: [lightness 0–1, chroma 0–0.4, hue 0–360].
   * Placed at `anchorStep` (default 500).
   */
  anchor: [lightness: number, chroma: number, hue: number];
  /**
   * Which step the anchor colour occupies. Default: 500.
   * When non-500, the lightness ramp and chroma curve are shifted so that the
   * anchor's values land on this step.
   */
  anchorStep?: number;
  /**
   * Optional overrides for the lightness ramp.
   * Keys are step numbers (50–950), values are lightness in 0–1 range.
   * Any steps not overridden use the default ramp.
   */
  lightnessOverrides?: Partial<Record<number, number>>;
  /**
   * Optional overrides for the chroma multiplier curve.
   * Keys are step numbers (50–950), values are multipliers (0–1) applied to
   * the anchor chroma. Any steps not overridden use the default curve.
   */
  chromaOverrides?: Partial<Record<number, number>>;
}

interface PaletteStep {
  step: number;
  hex: string;
  oklch: { l: number; c: number; h: number };
}

// ---------------------------------------------------------------------------
// Default curves
// ---------------------------------------------------------------------------

/**
 * All 19 internal steps from 50 to 950 in increments of 50.
 * We generate all of them for mathematical precision, then filter to the
 * 11 export steps.
 */
const ALL_STEPS = Array.from({ length: 19 }, (_, i) => 50 + i * 50);

/** The 11 steps we export as foundation tokens. */
const EXPORT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Default lightness ramp (OKLCH L, 0–1).
 * Carefully tuned: very light at 50, converging on the midpoint at 500,
 * then descending to very dark at 950.
 */
const DEFAULT_LIGHTNESS: Record<number, number> = {
  50: 0.992,
  100: 0.95,
  150: 0.92,
  200: 0.88,
  250: 0.84,
  300: 0.80,
  350: 0.76,
  400: 0.74,
  450: 0.72,
  500: 0.704, // midpoint — matches teal spec
  550: 0.64,
  600: 0.56,
  650: 0.48,
  700: 0.42,
  750: 0.36,
  800: 0.30,
  850: 0.25,
  900: 0.21,
  950: 0.17,
};

/**
 * Default chroma multiplier curve (0–1, applied to midpoint chroma).
 * Peaks at 1.0 around the 400–500 range and tapers towards both extremes.
 * This creates the "desaturated edges" effect: very light and very dark
 * shades feel muted, while the mid-range is vivid.
 */
const DEFAULT_CHROMA_CURVE: Record<number, number> = {
  50: 0.08,  // barely-there tint at near-white
  100: 0.18, // was 0.14
  150: 0.26, // was 0.22
  200: 0.36, // was 0.32
  250: 0.47, // was 0.44
  300: 0.58,
  350: 0.72,
  400: 0.86,
  450: 0.94,
  500: 1.0, // peak
  550: 0.96,
  600: 0.88,
  650: 0.78,
  700: 0.66,
  750: 0.58, // was 0.54
  800: 0.46, // was 0.42
  850: 0.36, // was 0.32
  900: 0.28, // was 0.24
  950: 0.20, // was 0.16
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function generatePalette(config: PaletteConfig): PaletteStep[] {
  const [anchorL, anchorC, anchorH] = config.anchor;
  const anchorStep = config.anchorStep ?? 500;

  const lightnessRamp = {
    ...DEFAULT_LIGHTNESS,
    [anchorStep]: anchorL, // always honour the anchor lightness at its step
    ...config.lightnessOverrides,
  };

  // For non-500 anchors, shift the chroma curve so the peak (1.0) is at
  // the anchor step instead of 500. We do this by looking up the default
  // curve value at the anchor step and scaling all values so that step = 1.0.
  let chromaCurve = { ...DEFAULT_CHROMA_CURVE, ...config.chromaOverrides };
  if (anchorStep !== 500) {
    const anchorDefault = DEFAULT_CHROMA_CURVE[anchorStep] ?? 1.0;
    // Scale factor: make the anchor step's multiplier = 1.0
    const scale = 1.0 / anchorDefault;
    const shifted: Record<number, number> = {};
    for (const step of ALL_STEPS) {
      const original = chromaCurve[step] ?? 1.0;
      // Scale and clamp to [0, 1]
      shifted[step] = Math.min(1.0, original * scale);
    }
    chromaCurve = { ...shifted, ...config.chromaOverrides };
  }

  const allSteps: PaletteStep[] = ALL_STEPS.map((step) => {
    const l = lightnessRamp[step] ?? anchorL;
    const c = anchorC * (chromaCurve[step] ?? 1.0);
    const h = anchorH;

    // Build colour in OKLCH via chroma.js
    // chroma.oklch(l, c, h) — l is 0–1, c is 0–0.4, h is 0–360
    const colour = chroma.oklch(l, c, h);

    // Clamp to sRGB gamut — chroma.js handles this via .hex()
    const hex = colour.hex("rgb");

    // Read back the actual OKLCH values after gamut mapping
    const [finalL, finalC, finalH] = colour.oklch();

    return {
      step,
      hex,
      oklch: {
        l: round(finalL, 4),
        c: round(finalC, 4),
        h: round(finalH ?? anchorH, 2), // hue can be NaN for achromatic
      },
    };
  });

  return allSteps;
}

function round(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function printPalette(name: string, steps: PaletteStep[]): void {
  console.log(`\n╔══════════════════════════════════════════════════════════╗`);
  console.log(`║  ${name.toUpperCase()} PALETTE`);
  console.log(`╠══════════════════════════════════════════════════════════╣`);
  console.log(`║  Step │ Hex       │ L       │ C       │ H       │ Export`);
  console.log(`╠══════════════════════════════════════════════════════════╣`);

  for (const s of steps) {
    const exported = EXPORT_STEPS.includes(s.step) ? "  ✓" : "";
    const lStr = s.oklch.l.toFixed(4).padStart(7);
    const cStr = s.oklch.c.toFixed(4).padStart(7);
    const hStr = s.oklch.h.toFixed(2).padStart(7);
    console.log(
      `║  ${String(s.step).padStart(4)} │ ${s.hex.padEnd(9)} │ ${lStr} │ ${cStr} │ ${hStr} │${exported}`
    );
  }

  console.log(`╚══════════════════════════════════════════════════════════╝`);
}

function toExportSteps(steps: PaletteStep[]): PaletteStep[] {
  return steps.filter((s) => EXPORT_STEPS.includes(s.step));
}

/**
 * Produce DTCG-format token object for a palette.
 * Output shape: { "50": { "$value": "#hex" }, ... }
 */
function toDTCG(steps: PaletteStep[]): Record<string, { $value: string }> {
  const result: Record<string, { $value: string }> = {};
  for (const s of toExportSteps(steps)) {
    result[String(s.step)] = { $value: s.hex };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Palette definitions
// ---------------------------------------------------------------------------

const PALETTES: PaletteConfig[] = [
  {
    name: "teal",
    anchor: [0.704, 0.14, 182.503],
    // anchorStep defaults to 500
  },
  {
    name: "amber",
    anchor: [0.5707, 0.1291, 63.932], // Reva Amber #AB6400
    anchorStep: 600,
    lightnessOverrides: {
      100: 0.96, // tiny lift for a softer light end
      200: 0.90,
      300: 0.82,
      400: 0.76,
      800: 0.33, // lighten dark end so it doesn't collapse to near-black
      900: 0.24,
    },
    chromaOverrides: {
      100: 0.17, // gentle ~15% chroma reduction on the light end
      200: 0.35,
      300: 0.56,
      400: 0.83,
    },
  },
  {
    name: "gold",
    anchor: [0.7577, 0.1403, 76.713], // Reva Gold #E2A336
    // anchorStep defaults to 500
  },
  {
    name: "olive",
    anchor: [0.5882, 0.0807, 97.194], // Reva Olive #8A7D42
    anchorStep: 600,
    lightnessOverrides: {
      50: 0.981,   // Porcelain #FAF9F2
      100: 0.9449, // Soft Linen #F0EDE0
      200: 0.8772, // Coolors warm eggshell #DED7BA
    },
    chromaOverrides: {
      50: 0.1155,  // Porcelain — very low chroma
      100: 0.2179, // Soft Linen — subtle warmth
      200: 0.4891, // Coolors 200 — richer warmth
    },
  },
  {
    name: "wine",
    anchor: [0.7044, 0.1004, 10.364], // Reva Wine #D68591
    // anchorStep defaults to 500
    lightnessOverrides: {
      800: 0.2598, // Reva Burgundy #460815
      950: 0.1422, // Dark Wine background #180207
    },
    chromaOverrides: {
      800: 0.9074, // Pin burgundy chroma (0.0911 / 0.1004)
      950: 0.4582, // Pin dark wine chroma (0.0460 / 0.1004)
    },
  },

  // -----------------------------------------------------------------------
  // Refined TW palettes — same hue & chroma, standardised L=0.704 midpoint
  // -----------------------------------------------------------------------
  {
    name: "yellow",
    anchor: [0.704, 0.1617, 86.039], // TW Yellow 500 hue & chroma, standardised L
  },
  {
    name: "orange",
    anchor: [0.704, 0.1867, 47.601], // TW Orange 500 hue & chroma, standardised L
  },
  {
    name: "red",
    anchor: [0.704, 0.2079, 25.334], // TW Red 500 hue & chroma, standardised L
  },
  {
    name: "green",
    anchor: [0.704, 0.1920, 149.577], // TW Green 500 hue & chroma, standardised L
  },
  {
    name: "sky",
    anchor: [0.704, 0.1478, 237.314], // TW Sky 500 hue & chroma, standardised L
  },
  {
    name: "gray",
    anchor: [0.5555, 0.0000, 0], // TW Gray 500 — pure achromatic
    anchorStep: 600,
  },
  {
    name: "stone",
    anchor: [0.5534, 0.0116, 58.091], // TW Stone 500 — warm neutral
    anchorStep: 600,
  },
  {
    name: "zinc",
    anchor: [0.5517, 0.0138, 285.988], // TW Zinc 500 — cool neutral
    anchorStep: 600,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

for (const palette of PALETTES) {
  const steps = generatePalette(palette);

  // Full table with all 19 steps
  printPalette(palette.name, steps);

  // Export-only steps as DTCG JSON
  const dtcg = toDTCG(steps);
  console.log(`\nDTCG export (${palette.name}):`);
  console.log(JSON.stringify(dtcg, null, 2));
}
