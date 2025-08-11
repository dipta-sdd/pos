import NextLink from "next/link";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and nav links */}
          <div className="flex items-center gap-6">
            <NextLink href="/" className="flex items-center gap-2">
              <Logo className="h-7 w-7" />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">ACME</span>
            </NextLink>
            <div className="hidden lg:flex gap-4 ml-4">
              {siteConfig.navItems.map((item) => (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1 rounded transition-colors font-medium"
                >
                  {item.label}
                </NextLink>
              ))}
            </div>
          </div>
          {/* Center: Search */}
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="relative w-72">
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-md bg-gray-100 dark:bg-gray-800 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
                aria-label="Search"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <span className="absolute right-3 top-2.5 hidden lg:inline-block text-xs text-gray-400 border rounded px-1 py-0.5">
                ⌘K
              </span>
            </div>
          </div>
          {/* Right: Socials, theme, sponsor, mobile menu */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-sky-500 text-gray-500 dark:text-gray-400 transition"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="hover:text-indigo-500 text-gray-500 dark:text-gray-400 transition"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Github"
                className="hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400 transition"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <ThemeSwitch />
            </div>
            <a
              href={siteConfig.links.sponsor}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 text-sm font-medium hover:bg-pink-200 dark:hover:bg-pink-800 transition"
            >
              <HeartFilledIcon className="w-4 h-4 text-pink-500" />
              Sponsor
            </a>
            {/* Mobile menu button */}
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-md">
          <div className="px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-sky-500 text-gray-500 dark:text-gray-400 transition"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="hover:text-indigo-500 text-gray-500 dark:text-gray-400 transition"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Github"
                className="hover:text-gray-900 dark:hover:text-white text-gray-500 dark:text-gray-400 transition"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <ThemeSwitch />
            </div>
            <div className="flex flex-col gap-1">
              {siteConfig.navItems.map((item) => (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NextLink>
              ))}
            </div>
            <div className="mt-3">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-md bg-gray-100 dark:bg-gray-800 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
                  aria-label="Search"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <SearchIcon className="w-4 h-4" />
                </span>
              </div>
            </div>
            <a
              href={siteConfig.links.sponsor}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 text-sm font-medium hover:bg-pink-200 dark:hover:bg-pink-800 transition"
            >
              <HeartFilledIcon className="w-4 h-4 text-pink-500" />
              Sponsor
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
