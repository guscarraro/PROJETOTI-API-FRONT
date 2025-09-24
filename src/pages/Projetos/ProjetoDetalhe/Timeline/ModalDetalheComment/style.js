import styled from "styled-components";

export const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 1050;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
`;

export const Card = styled.div`
  width: min(900px, 96vw);
  max-height: 86vh;
  overflow: hidden;
  background: #fff;
  color: #111827;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  display: flex; flex-direction: column;

  @media (prefers-color-scheme: dark) {
    background: #0b1220; color: #e5e7eb;
  }
  .dark &,
  [data-theme="dark"] & {
    background: #0b1220; color: #e5e7eb;
  }

  /* Em dark: garanta que todo mundo herde a cor do Card */
  @media (prefers-color-scheme: dark) {
    & * { color: inherit; }
  }
  .dark & * ,
  [data-theme="dark"] & * {
    color: inherit;
  }
`;

export const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,.08);
  color: inherit;

  @media (prefers-color-scheme: dark) { border-color: #1f2937; }
  .dark &,
  [data-theme="dark"] & { border-color: #1f2937; }
`;

export const Title = styled.h3`
  margin: 0; font-weight: 700; font-size: 16px; color: inherit;
`;

export const Body = styled.div`
  padding: 12px 16px 18px;
  overflow: auto;
  display: grid;
  gap: 10px;
  color: inherit;
`;

export const GroupBlock = styled.div`
  display: block;
`;

export const GroupTitle = styled.h4`
  margin: 8px 0 6px;
  font-size: 14px;
  font-weight: 800;
  color: inherit;
  span{
    font-weight: 100;
  }
`;

export const GroupDivider = styled.hr`
  border: none;
  height: 1px;
  background: rgba(0,0,0,.08);
  margin: 14px 0 6px;

  @media (prefers-color-scheme: dark) { background: #1f2937; }
  .dark &,
  [data-theme="dark"] & { background: grey; }
`;

export const RowHeader = styled.div`
  font-size: 12px; opacity: .8; margin-bottom: 6px; color: inherit;
`;

export const Bubble = styled.button`
  display: block; width: 100%;
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,.06);
  cursor: pointer;
  transition: transform .06s ease, box-shadow .06s ease;
  color: inherit;
  &:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(0,0,0,.10); }

  @media (prefers-color-scheme: dark) {
    background: #0f172a; border-color: #233047;
  }
  .dark &,
  [data-theme="dark"] & {
    background: #0f172a; border-color: #233047;
  }
`;

export const BubbleHeader = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
  font-size: 12px; opacity: .9; color: inherit;
`;

export const Dot = styled.span`
  width: 18px; height: 18px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: #111827; color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
`;

export const RichHtml = styled.div`
  font-size: 13px;
  color: inherit;
  white-space: pre-wrap;
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 2px 0; }
  p, div { margin: 4px 0; }

  /* Em dark: até conteúdos com inline color (#000 etc) ficam legíveis */
  @media (prefers-color-scheme: dark) {
    &, * { color: inherit !important; }
  }
  .dark &,
  [data-theme="dark"] &,
  .dark & * ,
  [data-theme="dark"] & * {
    color: inherit !important;
  }
`;

export const AttachInfo = styled.div`
  margin-top: 8px; font-size: 12px; opacity: .85; display: grid; gap: 2px; color: inherit;
`;

export const Footer = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 10px 16px; border-top: 1px solid rgba(0,0,0,.08);
  color: inherit;

  @media (prefers-color-scheme: dark) { border-color: #1f2937; }
  .dark &,
  [data-theme="dark"] & { border-color: #1f2937; }
`;

export const Btn = styled.button`
  padding: 8px 12px; border-radius: 10px; border: 1px solid #e5e7eb;
  background: ${({ $kind }) => ($kind === "primary" ? "#2563EB" : "#f3f4f6")};
  color: ${({ $kind }) => ($kind === "primary" ? "#fff" : "#111827")};
  font-weight: 700; font-size: 13px; cursor: pointer;

  @media (prefers-color-scheme: dark) {
    background: ${({ $kind }) => ($kind === "primary" ? "#1d4ed8" : "#0f172a")};
    color: #e5e7eb; border-color: #233047;
  }
  .dark &,
  [data-theme="dark"] & {
    background: ${({ $kind }) => ($kind === "primary" ? "#1d4ed8" : "#0f172a")};
    color: #e5e7eb; border-color: #233047;
  }
`;
