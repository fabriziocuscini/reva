import { defineTextStyles } from '@pandacss/dev'

export const textStyles = defineTextStyles({
  // ── Marketing / Heading (serif) ──────────────────────────────────
  'marketing/heading/h1': {
    description: 'Marketing heading 1 — 64px serif',
    value: {
      fontFamily: 'serif',
      fontSize: '6xl',
      fontWeight: 'medium',
      lineHeight: 'tight',
      letterSpacing: 'dense',
    },
  },
  'marketing/heading/h2': {
    description: 'Marketing heading 2 — 48px serif',
    value: {
      fontFamily: 'serif',
      fontSize: '5xl',
      fontWeight: 'medium',
      lineHeight: 'tight',
      letterSpacing: 'dense',
    },
  },
  'marketing/heading/h3': {
    description: 'Marketing heading 3 — 40px serif',
    value: {
      fontFamily: 'serif',
      fontSize: '4xl',
      fontWeight: 'medium',
      lineHeight: 'compact',
      letterSpacing: 'dense',
    },
  },
  'marketing/heading/h4': {
    description: 'Marketing heading 4 — 24px serif',
    value: {
      fontFamily: 'serif',
      fontSize: '2xl',
      fontWeight: 'semibold',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
  },
  'marketing/heading/h5': {
    description: 'Marketing heading 5 — 18px serif',
    value: {
      fontFamily: 'serif',
      fontSize: 'lg',
      fontWeight: 'semibold',
      lineHeight: 'normal',
      letterSpacing: 'relaxed',
    },
  },
  'marketing/heading/h6': {
    description: 'Marketing heading 6 — 16px serif',
    value: {
      fontFamily: 'serif',
      fontSize: 'md',
      fontWeight: 'semibold',
      lineHeight: 'relaxed',
      letterSpacing: 'wide',
    },
  },
  'marketing/heading/overline': {
    description: 'Marketing overline — 12px uppercase serif',
    value: {
      fontFamily: 'serif',
      fontSize: '2xs',
      fontWeight: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'spacious',
    },
  },

  // ── Marketing / Body (sans-serif) ────────────────────────────────
  'marketing/body/lead1': {
    description: 'Marketing lead 1 — 24px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: '2xl',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'relaxed',
    },
  },
  'marketing/body/lead2': {
    description: 'Marketing lead 2 — 18px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'lg',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
  },
  'marketing/body/body': {
    description: 'Marketing body — 16px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'md',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'wide',
    },
  },
  'marketing/body/caption': {
    description: 'Marketing caption — 14px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'sm',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'wide',
    },
  },
  'marketing/body/footnote': {
    description: 'Marketing footnote — 12px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: '2xs',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'loose',
    },
  },

  // ── Product / Heading (sans-serif) ───────────────────────────────
  'product/heading/h1': {
    description: 'Product heading 1 — 48px sans-serif',
    value: {
      fontFamily: 'display',
      fontSize: '5xl',
      fontWeight: 'medium',
      lineHeight: 'compact',
      letterSpacing: 'normal',
    },
  },
  'product/heading/h2': {
    description: 'Product heading 2 — 40px sans-serif',
    value: {
      fontFamily: 'display',
      fontSize: '4xl',
      fontWeight: 'semibold',
      lineHeight: 'compact',
      letterSpacing: 'normal',
    },
  },
  'product/heading/h3': {
    description: 'Product heading 3 — 32px sans-serif',
    value: {
      fontFamily: 'display',
      fontSize: '3xl',
      fontWeight: 'semibold',
      lineHeight: 'compact',
      letterSpacing: 'normal',
    },
  },
  'product/heading/h4': {
    description: 'Product heading 4 — 24px sans-serif',
    value: {
      fontFamily: 'display',
      fontSize: '2xl',
      fontWeight: 'semibold',
      lineHeight: 'compact',
      letterSpacing: 'normal',
    },
  },
  'product/heading/h5': {
    description: 'Product heading 5 — 20px sans-serif',
    value: {
      fontFamily: 'display',
      fontSize: 'xl',
      fontWeight: 'semibold',
      lineHeight: 'compact',
      letterSpacing: 'normal',
    },
  },
  'product/heading/h6': {
    description: 'Product heading 6 — 18px sans-serif',
    value: {
      fontFamily: 'display',
      fontSize: 'lg',
      fontWeight: 'semibold',
      lineHeight: 'compact',
      letterSpacing: 'normal',
    },
  },

  // ── Product / Body (sans-serif) ──────────────────────────────────
  'product/body/lead2': {
    description: 'Product lead 2 — 24px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: '2xl',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
  },
  'product/body/lead1': {
    description: 'Product lead 1 — 20px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'xl',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
  },
  'product/body/body2': {
    description: 'Product body 2 — 18px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'lg',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'relaxed',
    },
  },
  'product/body/body1': {
    description: 'Product body 1 — 16px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'md',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'relaxed',
    },
  },
  'product/body/caption2': {
    description: 'Product caption 2 — 14px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'sm',
      fontWeight: 'regular',
      lineHeight: 'normal',
      letterSpacing: 'wide',
    },
  },
  'product/body/caption1': {
    description: 'Product caption 1 — 13px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: 'xs',
      fontWeight: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'wide',
    },
  },
  'product/body/footnote2': {
    description: 'Product footnote 2 — 12px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: '2xs',
      fontWeight: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'loose',
    },
  },
  'product/body/footnote1': {
    description: 'Product footnote 1 — 11px sans-serif',
    value: {
      fontFamily: 'text',
      fontSize: '3xs',
      fontWeight: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'loose',
    },
  },
})
