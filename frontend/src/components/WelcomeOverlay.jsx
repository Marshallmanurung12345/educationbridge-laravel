import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import anaksd from "../assets/anaksd.png";

export default function WelcomeOverlay() {
  const [show, setShow] = useState(
    () => sessionStorage.getItem("eb_global_welcome_seen") !== "true",
  );

  useEffect(() => {
    if (!show) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        sessionStorage.setItem("eb_global_welcome_seen", "true");
        setShow(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show]);

  function handleClose() {
    sessionStorage.setItem("eb_global_welcome_seen", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm transition-all sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-[960px] grid-cols-1 overflow-y-auto rounded-[28px] border border-slate-100 bg-white shadow-2xl animate-fade-in md:max-h-[min(720px,calc(100dvh-3rem))] md:grid-cols-[1.08fr_0.92fr] md:overflow-hidden"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-16 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-slate-900 md:top-4"
          aria-label="Tutup"
          title="Tutup"
        >
          ✕
        </button>

        {/* LEFT COLUMN: FORM & INFO */}
        <div className="flex flex-col justify-between p-5 sm:p-8 md:p-9">
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
            <h2
              id="welcome-title"
              className="font-display text-2xl font-bold text-slate-900 sm:text-3xl leading-snug"
            >
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
            <div className="my-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-5">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg">
                  📖
                </div>
                <strong className="mt-2 block text-xs font-bold text-slate-900">
                  Data Pendidikan
                </strong>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">
                  Data pendidikan dari sumber resmi yang tersedia.
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-lg">
                  ✓
                </div>
                <strong className="mt-2 block text-xs font-bold text-slate-900">
                  Proses Verifikasi
                </strong>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">
                  Kebutuhan ditinjau melalui proses verifikasi EducationBridge.
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-lg">
                  👥
                </div>
                <strong className="mt-2 block text-xs font-bold text-slate-900">
                  Kolaborasi
                </strong>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">
                  Sekolah, donatur, dan CSR.
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-lg">
                  ❤️
                </div>
                <strong className="mt-2 block text-xs font-bold text-slate-900">
                  Laporan Bantuan
                </strong>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">
                  Transparansi laporan bantuan.
                </span>
              </div>
            </div>
          </div>

          <div>
            {/* MAIN BUTTON */}
            <button
              type="button"
              onClick={handleClose}
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

        {/* RIGHT COLUMN: IMAGE & OVERLAY SLOGAN */}
        <div className="relative min-h-[300px] overflow-hidden bg-slate-100 sm:min-h-[320px] md:min-h-[440px]">
          <img
            src={anaksd}
            alt="Siswa Sekolah Dasar Indonesia"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-slate-950/40" />

          {/* SCRIPT TEXT TOP RIGHT */}
          <div className="absolute right-6 top-8 max-w-[220px] rounded-xl bg-slate-950/25 px-3 py-2 text-right shadow-lg backdrop-blur-[2px]">
            <p className="font-serif text-xl italic leading-tight text-white sm:text-2xl">
              Pendidikan Menghubungkan Lebih Banyak Harapan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
