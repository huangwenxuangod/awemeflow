'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Get navbar config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/navbar
 *
 * @returns The navbar config with translated titles and descriptions
 */
export function useNavbarLinks(): NestedMenuItem[] {
  return [
    {
      title: '能力',
      href: Routes.Features,
      external: false,
    },
    {
      title: '使用方法',
      href: '/#steps',
      external: false,
    },
    {
      title: '常见问题',
      href: Routes.FAQ,
      external: false,
    },
  ];
}
