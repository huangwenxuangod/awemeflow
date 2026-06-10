'use client';

import LocaleSelector from '@/components/layout/locale-selector';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcherHorizontal } from '@/components/layout/mode-switcher-horizontal';
import { Button } from '@/components/ui/button';
import { useNavbarLinks } from '@/config/navbar-config';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { MenuIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const mobileLinkClass =
  'flex w-full items-center rounded-xl px-3 py-3 text-base text-[#4b5563] transition-colors duration-150 hover:bg-[#f5f5f5] hover:text-[#111111]';
const mobileLinkActiveClass = 'font-medium text-[#111111]';

interface NavbarMobileProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NavbarMobile({ className, ...props }: NavbarMobileProps) {
  const t = useTranslations();
  const localePathname = useLocalePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuLinks = useNavbarLinks();

  useEffect(() => {
    setMounted(true);
    setOpen(false);
  }, [localePathname]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        <LocaleLink href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-semibold text-[#111111]">
            {t('Metadata.name')}
          </span>
        </LocaleLink>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="size-10 rounded-full border border-[#e5e7eb] bg-white text-[#111111] hover:bg-[#f8f8f8]"
        >
          {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
        </Button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 top-[73px] z-50 flex flex-col overflow-y-auto bg-white animate-in fade-in-0 duration-200"
        >
          <div className="flex flex-1 flex-col items-start gap-4 p-4">
            <ul className="w-full space-y-1">
              {menuLinks.map((item) => {
                const active =
                  item.href === '/'
                    ? localePathname === '/'
                    : !!item.href && localePathname.startsWith(item.href);

                return (
                  <li key={item.title} className="py-1">
                    <LocaleLink
                      href={item.href ?? '#'}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        mobileLinkClass,
                        active && mobileLinkActiveClass
                      )}
                    >
                      {item.title}
                    </LocaleLink>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto flex w-full items-center justify-between border-t border-[#ececec] p-4">
              <LocaleSelector />
              <ModeSwitcherHorizontal />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
