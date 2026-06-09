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

  return (
    <header
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        showBarBg && 'border-b'
      )}
    >
      {showBarBg && (
        <div
          className="absolute inset-0 z-0 bg-muted/50 backdrop-blur-md"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">
        <Container className="px-4">
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4"
          >
            <LocaleLink
              href="/"
              aria-label="Home"
              className="flex items-center gap-2 shrink-0"
            >
              <Logo />
              <span className="text-xl font-semibold">
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
                        'bg-transparent',
                        item.href &&
                          (item.href === '/'
                            ? localePathname === '/'
                            : localePathname.startsWith(item.href)) &&
                          'font-semibold text-primary'
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

            <div className="flex items-center gap-4 shrink-0">
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
