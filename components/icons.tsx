// 16px line icons in the Geist style: 1.5px strokes, round joins, currentColor.
import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconPlus = () => <Icon><path d="M8 3v10M3 8h10" /></Icon>;
export const IconUpload = () => <Icon><path d="M8 10.5V2.75M4.75 5.75 8 2.5l3.25 3.25M2.75 10v2.25a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1V10" /></Icon>;
export const IconExternal = () => <Icon><path d="M6.5 3.25h-2.75a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5M9.5 2.75h3.75V6.5M13 3 7.5 8.5" /></Icon>;
export const IconCopy = () => <Icon><rect x="5.25" y="5.25" width="8" height="8" rx="1.5" /><path d="M10.75 5.25V3.75a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1.5" /></Icon>;
export const IconPencil = () => <Icon><path d="M10.5 2.75 13.25 5.5 6 12.75l-3.25.5.5-3.25z" /></Icon>;
export const IconChevronDown = () => <Icon><path d="m4 6 4 4 4-4" /></Icon>;
export const IconCheck = () => <Icon><path d="m3.25 8.5 3 3 6.5-7" /></Icon>;
export const IconWarning = () => <Icon><circle cx="8" cy="8" r="5.75" /><path d="M8 5v3.25M8 10.75v.01" /></Icon>;

export const IconGitHub = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);
