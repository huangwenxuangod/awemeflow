'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcherHorizontal } from '@/components/layout/mode-switcher-horizontal';
import { useFooterLinks } from '@/config/footer-config';
import { useSocialLinks } from '@/config/social-config';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type React from 'react';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations();
  const footerLinks = useFooterLinks();
  const socialLinks = useSocialLinks();
  const localePathname = useLocalePathname();

  return (
    <footer className={cn('border-t border-slate-200 bg-white', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-6">
          <div className="col-span-full flex flex-col items-start md:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Logo />
                <span className="text-xl font-semibold text-slate-950">
                  {t('Metadata.name')}
                </span>
              </div>

              <p className="py-1 text-sm leading-7 text-slate-600 md:pr-12">
                {t('Marketing.footer.tagline')}
              </p>

              {socialLinks.length > 0 ? (
                <nav
                  aria-label="Social links"
                  className="flex items-center gap-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    {socialLinks?.map((link) => (
                      <a
                        key={link.title}
                        href={link.href || '#'}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.title}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
                      >
                        {link.icon ? link.icon : null}
                      </a>
                    ))}
                  </div>
                </nav>
              ) : null}
            </div>
          </div>

          {footerLinks?.map((section) => (
            <div
              key={section.title}
              className="col-span-1 md:col-span-1 items-start"
            >
              <span className="text-sm font-semibold uppercase text-slate-950">
                {section.title}
              </span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (item) =>
                    item.href && (
                      <li key={item.title}>
                        <LocaleLink
                          href={item.href || '#'}
                          target={item.external ? '_blank' : undefined}
                          className={cn(
                            'text-sm text-slate-600 transition-colors duration-150 hover:text-slate-950',
                            !item.external &&
                              !item.href.includes('#') &&
                              (item.href === '/'
                                ? localePathname === '/'
                                : localePathname.startsWith(item.href)) &&
                              'font-semibold text-slate-950'
                          )}
                        >
                          {item.title}
                        </LocaleLink>
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-slate-200 py-6">
        <Container className="px-4 flex items-center justify-between gap-x-4">
          <span className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} {t('Metadata.name')}. All Rights
            Reserved.
          </span>

          <div className="flex items-center gap-x-4">
            <ModeSwitcherHorizontal />
          </div>
        </Container>
      </div>
    </footer>
  );
}
