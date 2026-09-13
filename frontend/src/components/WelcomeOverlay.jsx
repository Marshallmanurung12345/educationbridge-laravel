import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import anaksd from "../assets/anaksd.png";

export default function WelcomeOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Tampilkan overlay jika belum pernah dibuka dalam sesi ini
    const seen = sessionStorage.getItem("eb_global_welcome_seen");
    if (!seen) {
      setShow(true);
    }
  }, []);

  function handleContinue() {
    sessionStorage.setItem("eb_global_welcome_seen", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm transition-all">
      <div className="relative grid w-full max-w-[920px] overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 md:grid-cols-2 animate-fade-in">
        {/* LEFT COLUMN: FORM & INFO */}
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            {/* BRAND LOGO */}
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="EducationBridge Logo"
                className="h-9 w-auto max-h-9 object-contain"
              />
              <div className="text-left leading-tight">
                <span className="font-display text-xl font-bold text-[#17365d]">
                  Education<span className="text-[#e3a22f]">Bridge</span>
                </span>
                <span className="block text-[10px] text-slate-500">
                  Pendidikan untuk Semua, Tanpa Batas
                </span>
              </div>
            </div>

            {/* YELLOW ACCENT BAR */}
            <div className="my-5 h-1 w-10 rounded-full bg-[#e3a22f]" />

            {/* TITLE */}
            <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl leading-snug">
              Selamat Datang di{" "}
              <span className="text-[#17365d]">Education</span>
              <span className="text-[#e3a22f]">Bridge</span>
            </h2>

            {/* SUBTITLE */}
            <p className="mt-2 text-xs text-slate-600 leading-relaxed sm:text-sm">
              Platform kolaborasi pendanaan dan pemerataan pendidikan untuk masa
              depan yang lebih baik.
            </p>

            {/* 4 FEATURE ICONS */}
            <div className="my-6 grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg">
                  📖
                </div>
                <strong className="mt-2 text-[11px] font-bold text-slate-900 block">
                  Data Resmi
                </strong>
                <span className="text-[9px] text-slate-500 leading-tight block mt-0.5">
                  Berbasis Data Induk Pendidikan
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-lg">
                  ✓
                </div>
                <strong className="mt-2 text-[11px] font-bold text-slate-900 block">
                  Tepat Sasaran
                </strong>
                <span className="text-[9px] text-slate-500 leading-tight block mt-0.5">
                  Terverifikasi dan akuntabel
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-lg">
                  👥
                </div>
                <strong className="mt-2 text-[11px] font-bold text-slate-900 block">
                  Kolaborasi
                </strong>
                <span className="text-[9px] text-slate-500 leading-tight block mt-0.5">
                  Sekolah, Donatur, CSR, & Pemerintah
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-lg">
                  ❤️
                </div>
                <strong className="mt-2 text-[11px] font-bold text-slate-900 block">
                  Dampak Nyata
                </strong>
                <span className="text-[9px] text-slate-500 leading-tight block mt-0.5">
                  Untuk pendidikan lebih merata
                </span>
              </div>
            </div>
          </div>

          <div>
            {/* MAIN BUTTON */}
            <button
              onClick={handleContinue}
              className="w-full rounded-xl bg-[#17365d] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#1d4778] hover:shadow-xl"
            >
              Mulai Jelajahi <span className="ml-1">→</span>
            </button>

            {/* FOOTER TEXT */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="h-[1px] w-8 bg-slate-200" />
              <span>Bersama, wujudkan pendidikan yang lebih merata</span>
              <span className="h-[1px] w-8 bg-slate-200" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IMAGE & OVERLAY QUOTE */}
        <div className="relative min-h-[300px] md:min-h-[440px] overflow-hidden bg-slate-100">
          <img
            src={anaksd}
            alt="Siswa Sekolah Dasar Indonesia"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />

          {/* CLOSE BUTTON */}
          <button
            onClick={handleContinue}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
            aria-label="Tutup"
          >
            ✕
          </button>

          {/* SCRIPT TEXT TOP RIGHT */}
          <div className="absolute top-8 right-6 text-right max-w-[220px] drop-shadow-md">
            <p className="font-serif italic text-white text-xl sm:text-2xl leading-tight">
              Pendidikan Menghubungkan Lebih Banyak Harapan
            </p>
          </div>

          {/* QUOTE OVERLAY BOX */}
          <div className="absolute bottom-6 left-6 right-6 max-w-[280px] rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-md border border-white/50">
            <span className="font-serif text-2xl font-bold text-[#17365d] leading-none block mb-1">
              “
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              Setiap anak berhak mendapat pendidikan yang layak, di mana pun
              mereka berada.
            </p>
            <div className="mt-2 h-1 w-6 rounded-full bg-[#e3a22f]" />
          </div>
        </div>
      </div>
    </div>
  );
}
