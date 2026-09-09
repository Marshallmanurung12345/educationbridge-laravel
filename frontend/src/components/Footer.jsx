export default function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-[#dfe6ef] bg-white text-sm text-[#60748d]"
    >
      <div className="grid w-full gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.2fr] lg:px-12 xl:px-16">
        <div>
          <span className="font-display text-2xl text-[#17365d]">
            EducationBridge
          </span>
          <p className="mt-4 max-w-xs text-sm leading-6">
            Menjembatani kebutuhan pendidikan dengan dukungan yang tepat
            sasaran, transparan, dan berdampak.
          </p>
          <div className="mt-5 flex gap-3 text-xs font-bold text-[#17365d]">
            <span>◎</span>
            <span>in</span>
            <span>▶</span>
            <span>f</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#17365d]">Jelajahi</p>
          <div className="mt-4 space-y-3 text-xs">
            <a className="block hover:text-[#1d62b5]" href="/">
              Beranda
            </a>
            <a className="block hover:text-[#1d62b5]" href="/kampanye">
              Jelajahi Kebutuhan
            </a>
            <a className="block hover:text-[#1d62b5]" href="/ajukan">
              Ajukan Kebutuhan
            </a>
            <a className="block hover:text-[#1d62b5]" href="/cocok">
              Rekomendasi
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#17365d]">Bantuan</p>
          <div className="mt-4 space-y-3 text-xs">
            <a className="block hover:text-[#1d62b5]" href="#footer">
              FAQ
            </a>
            <a className="block hover:text-[#1d62b5]" href="#footer">
              Panduan Pengguna
            </a>
            <a className="block hover:text-[#1d62b5]" href="#footer">
              Kebijakan Privasi
            </a>
            <a className="block hover:text-[#1d62b5]" href="#footer">
              Kontak
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold text-[#17365d]">Tetap Terhubung</p>
          <p className="mt-4 text-xs leading-5">
            Dapatkan informasi terbaru seputar pendidikan dan program
            EducationBridge.
          </p>
          <div className="mt-4 flex border border-[#d8e1eb] bg-[#fbfcfe] p-1">
            <input
              aria-label="Alamat email"
              type="email"
              placeholder="Masukkan email Anda"
              className="min-w-0 flex-1 border-0 bg-transparent px-2 text-xs outline-none"
            />
            <button
              aria-label="Berlangganan newsletter"
              className="bg-[#17365d] px-3 py-2 text-xs text-white"
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-[#edf0f4] px-5 py-4 text-center text-xs sm:px-8 lg:px-12 xl:px-16 lg:text-left">
        © 2026 EducationBridge. All rights reserved.
      </div>
    </footer>
  );
}
