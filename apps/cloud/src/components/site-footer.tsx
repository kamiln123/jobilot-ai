import Link from "next/link";

import { PRODUCT_AUTHOR, PRODUCT_GITHUB_URL, PRODUCT_VERSION } from "@/lib/product";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#38533d] bg-[#263b2c] px-5 py-7 text-sm text-[#d9e7d6] sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">Jobilot AI</p>
          <p className="mt-1 text-xs text-[#c7d8c5]">Zarządzanie procesem poszukiwania pracy.</p>
        </div>

        <nav aria-label="Informacje o projekcie" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
          <Link className="text-[#e3f0df] hover:text-white" href="/about">O projekcie</Link>
          <Link className="text-[#e3f0df] hover:text-white" href="/local-vault">Local Vault</Link>
          <a className="text-[#e3f0df] hover:text-white" href={PRODUCT_GITHUB_URL} rel="noreferrer" target="_blank">
            {PRODUCT_AUTHOR} · GitHub ↗
          </a>
        </nav>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#c7d8c5]">
          <span>{PRODUCT_VERSION}</span>
          <span>© 2026 Jobilot AI</span>
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-[1540px] border-t border-[#38533d] pt-4 text-center text-xs text-[#c7d8c5]">
        Wersja demonstracyjna projektu portfolio — używaj wyłącznie danych testowych.
      </p>
    </footer>
  );
}
