import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[]; locale: string }> }
) {
  await params;
  notFound();
}

export async function generateStaticParams() {
  return [];
}
