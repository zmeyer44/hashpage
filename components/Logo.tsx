import { useId } from 'react';

// The Hashpage mark: a page with a folded corner and a # cut through it. One color (currentColor),
// with the fold and the # as true cut-outs so it sits on any background. Same artwork as app/icon.svg.
export const MARK_PAGE = 'M7 2h13l8 8v16a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z';
export const MARK_FOLD = 'M20 2v5a3 3 0 0 0 3 3h5l-1.2-1.2H23a1.8 1.8 0 0 1-1.8-1.8V3.2z';
export const MARK_HASH = 'M12.5 12v14M18.5 12v14M8 16.5h15M8 21.5h15';

export function LogoMark({ size = 24 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <mask id={id}>
        <path fill="#fff" d={MARK_PAGE} />
        <path fill="#000" d={MARK_FOLD} />
        <path stroke="#000" strokeWidth="2.5" d={MARK_HASH} />
      </mask>
      <rect width="32" height="32" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}
