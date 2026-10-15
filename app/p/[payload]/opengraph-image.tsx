import { documentCard, OG_SIZE, siteCard } from '@/lib/og';
import { summarize } from '@/lib/summary';

export const alt = 'Preview of a Hashpage document';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ payload: string }> }) {
  const { payload } = await params;
  const s = await summarize(payload);
  return s ? documentCard(s) : siteCard();
}
