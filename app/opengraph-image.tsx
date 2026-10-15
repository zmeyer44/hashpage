import { OG_SIZE, siteCard } from '@/lib/og';

export const alt = 'Hashpage: the link carries meaning, your client carries the look.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return siteCard();
}
