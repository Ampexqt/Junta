/**
 * Injects DayFlow CSS files as <link> tags and then injects a <style> block
 * with Junta theme variable overrides AFTER them, so our colours always win
 * the CSS cascade without needing !important.
 *
 * DayFlow v3 is compiled against Tailwind v4 and uses modern CSS features
 * (color-mix, @supports, etc.) that break Tailwind v3's PostCSS pipeline.
 * Serving from /public bypasses PostCSS entirely.
 */
import { useEffect } from 'react';

const CSS_FILES = [
  '/dayflow-core.css',
  '/dayflow-sidebar.css',
];

const STYLE_ID = 'junta-df-theme';

/**
 * Junta theme mapped to DayFlow's CSS variable system.
 * These are injected AFTER the DayFlow link tags so they win the cascade.
 */
const JUNTA_DF_THEME = `
  :root {
    /* ── Core palette (mapped to Junta primary = #2FA084) ── */
    --df-color-primary:            hsl(165 54% 41%);
    --df-color-primary-foreground: #ffffff;

    /* ── Surfaces ── */
    --df-color-background:         #ffffff;
    --df-color-card:               #ffffff;
    --df-color-card-foreground:    hsl(165 10% 15%);

    /* ── Text ── */
    --df-color-foreground:         hsl(165 10% 15%);
    --df-color-muted-foreground:   hsl(165 8% 48%);

    /* ── UI chrome ── */
    --df-color-muted:              hsl(165 20% 96%);
    --df-color-border:             hsl(165 15% 88%);
    --df-color-hover:              hsl(165 30% 95%);

    /* ── Semantic ── */
    --df-color-secondary:          hsl(165 20% 94%);
    --df-color-secondary-foreground: hsl(165 10% 25%);
    --df-color-destructive:        hsl(0 72% 51%);
    --df-color-destructive-foreground: #ffffff;
  }

  /* Ensure today date number is always readable */
  [data-today='true'] {
    background-color: hsl(165 54% 41%) !important;
    color: #ffffff !important;
    border-radius: 9999px !important;
    font-weight: 700 !important;
  }

  /* Calendar font */
  .df-calendar-wrapper,
  .df-calendar-container {
    font-family: 'Sora', ui-sans-serif, system-ui, sans-serif !important;
  }
`;

function injectLink(href: string) {
  if (document.querySelector(`link[data-dayflow="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-dayflow', href);
  document.head.appendChild(link);
}

function injectTheme() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = JUNTA_DF_THEME;
  document.head.appendChild(style);
}

export function useDayflowStyles() {
  useEffect(() => {
    CSS_FILES.forEach(injectLink);
    // Inject theme AFTER link tags so it wins the cascade
    injectTheme();
  }, []);
}
