import logo from "../assets/logo.jpeg";

export default function Footer() {
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
            Platform penghubung sekolah yang membutuhkan dengan donatur dan pemerintah untuk pendidikan Indonesia yang lebih baik.
          </p>
          <div className="mt-5 flex gap-3 text-xs font-bold text-[#ffad55]">
            <span>◎</span>
            <span>in</span>
            <span>▶</span>
            <span>f</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">Jelajahi</p>
          <div className="mt-4 space-y-3 text-xs">
            <a className="block hover:text-[#ffad55]" href="/">
              Beranda
            </a>
            <a className="block hover:text-[#ffad55]" href="/kampanye">
              Kebutuhan Sekolah
            </a>
            <a className="block hover:text-[#ffad55]" href="/ajukan">
              Ajukan Kebutuhan
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">Bantuan</p>
          <div className="mt-4 space-y-3 text-xs">
            <a className="block hover:text-[#ffad55]" href="#footer">
              FAQ
            </a>
            <a className="block hover:text-[#ffad55]" href="#footer">
              Panduan Penggunaan
            </a>
            <a className="block hover:text-[#ffad55]" href="#footer">
              Kebijakan Privasi
            </a>
            <a className="block hover:text-[#ffad55]" href="#footer">
              Hubungi Kami
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">Tetap Terhubung</p>
          <p className="mt-4 text-xs leading-5">
            Dapatkan informasi terbaru mengenai kebutuhan sekolah dan program donasi kami.
          </p>
          <div className="mt-4 flex border border-white/25 bg-white/10 p-1">
            <input
              aria-label="Alamat email"
              type="email"
              placeholder="Masukkan email Anda"
              className="min-w-0 flex-1 border-0 bg-transparent px-2 text-xs text-white outline-none placeholder:text-[#b8c7d8]"
            />
            <button
              aria-label="Berlangganan newsletter"
              className="bg-[#f28c28] px-3 py-2 text-xs text-white transition-colors hover:bg-[#dc7616]"
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-4 text-center text-xs text-[#b8c7d8] sm:px-8 lg:px-12 xl:px-16 lg:text-left">
        © 2026 EducationBridge. Hak cipta dilindungi undang-undang.
      </div>
    </footer>
  );
}
