import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';

export default function BlogPostLayout({ children }: PropsWithChildren) {
  notFound();
  return children;
}
