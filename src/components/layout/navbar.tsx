'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './locale-switcher';

interface NavBarProps {
  scroll?: boolean;
}

export function Navbar({ scroll = true }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);
  const menuLinks = useNavbarLinks();
  const localePathname = useLocalePathname();
  const showBarBg = scroll && scrolled;
  const isHome = localePathname === '/';

  return (
    <header
      className={cn(
        'sticky inset-x-0 top-0 z-40 border-b border-[#ececec] bg-white py-4 transition-all duration-300',
        showBarBg && 'shadow-[0_8px_24px_rgba(17,17,17,0.04)]'
      )}
    >
      <div className="relative z-10">
        <Container className="px-4">
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4"
          >
            <LocaleLink
              href="/"
              aria-label="Home"
              className="flex shrink-0 items-center gap-2"
            >
              <Logo />
              <span className="text-xl font-semibold tracking-tight text-[#111111]">
                {t('Metadata.name')}
              </span>
            </LocaleLink>

            <NavigationMenu className="flex-1 justify-center">
              <NavigationMenuList>
                {menuLinks.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'rounded-full bg-transparent px-4 text-sm text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111]',
                        item.href &&
                          (item.href === '/'
                            ? isHome
                            : localePathname.startsWith(item.href)) &&
                          'font-medium text-[#111111]'
                      )}
                    >
                      <LocaleLink
                        href={item.href || '#'}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                      >
                        {item.title}
                      </LocaleLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex shrink-0 items-center gap-3">
              <ModeSwitcher />
              <LocaleSwitcher />
            </div>
          </nav>

          <NavbarMobile className="lg:hidden" />
        </Container>
      </div>
    </header>
  );
}
