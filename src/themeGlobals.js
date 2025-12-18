// themeGlobals.js
import { createGlobalStyle } from "styled-components";

export const GlobalThemeVars = createGlobalStyle`
  :root {
    --bg-panel: #ffffff;
    --bg-panel-2: #fafafa;
    --text: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --shadow: 0 10px 30px rgba(0,0,0,.12);
  }

  [data-theme="dark"] {
    --bg-panel: #0f172a;
    --bg-panel-2: #0b1220;
    --text: #e5e7eb;
    --muted: #9aa3b2;
    --border: #334155;
    --shadow: 0 10px 30px rgba(0,0,0,.35);
  }
`;
