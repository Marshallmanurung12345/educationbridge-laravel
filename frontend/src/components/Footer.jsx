import logo from "../assets/logo.jpeg";
import { useLanguage } from "../context/useLanguage";

export default function Footer() {
  const { translations } = useLanguage();
  const { footer } = translations;

  return (
    <footer
      id="footer"
      className="border-t border-[#29496f] bg-[#17345b] text-sm text-[#d5dfeb]"
    >
      <div className="grid w-full gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.2fr] lg:px-12 xl:px-16">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="relative h-9 w-10 shrink-0 overflow-hidden rounded-md bg-white"
            >
              <img
                src={logo}
                alt=""
                className="absolute -left-[14px] -top-[17px] h-[68px] w-[68px] max-w-none"
              />
            </span>
            <span className="font-display text-2xl text-white">
              EducationBridge
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6">
            {footer.tagline}
          </p>
          <div className="mt-5 flex gap-3 text-xs font-bold text-[#ffad55]">
            <span>◎</span>
            <span>in</span>
            <span>▶</span>
            <span>f</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">{footer.explore}</p>
          <div className="mt-4 space-y-3 text-xs">
            <a className="block hover:text-[#ffad55]" href="/">
              {footer.home}
            </a>
            <a className="block hover:text-[#ffad55]" href="/kampanye">
              {footer.browse}
            </a>
            <a className="block hover:text-[#ffad55]" href="/ajukan">
              {footer.fundraise}
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">{footer.help}</p>
          <div className="mt-4 space-y-3 text-xs">
            <a className="block hover:text-[#ffad55]" href="#footer">
              {footer.faq}
            </a>
            <a className="block hover:text-[#ffad55]" href="#footer">
              {footer.guide}
            </a>
            <a className="block hover:text-[#ffad55]" href="#footer">
              {footer.privacy}
            </a>
            <a className="block hover:text-[#ffad55]" href="#footer">
              {footer.contact}
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">{footer.stayConnected}</p>
          <p className="mt-4 text-xs leading-5">
            {footer.newsletter}
          </p>
          <div className="mt-4 flex border border-white/25 bg-white/10 p-1">
            <input
              aria-label={footer.email}
              type="email"
              placeholder={footer.emailPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent px-2 text-xs text-white outline-none placeholder:text-[#b8c7d8]"
            />
            <button
              aria-label={footer.subscribe}
              className="bg-[#f28c28] px-3 py-2 text-xs text-white transition-colors hover:bg-[#dc7616]"
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-4 text-center text-xs text-[#b8c7d8] sm:px-8 lg:px-12 xl:px-16 lg:text-left">
        © 2026 EducationBridge. {footer.copyright}
      </div>
    </footer>
  );
}
