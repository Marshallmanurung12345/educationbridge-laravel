import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md transition-all">
      <div className="max-w-lg w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-md">
            <img
              src={logo}
              alt="EducationBridge Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        <span className="inline-block rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-900 border border-blue-200 uppercase tracking-wider mb-2">
          🏛️ Selamat Datang di EducationBridge
        </span>

        <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Platform Kolaborasi Pendanaan & Pemerataan Pendidikan
        </h2>

        <p className="mt-3 text-xs text-slate-600 leading-relaxed sm:text-sm">
          Menghubungkan sekolah yang membutuhkan bantuan sarana prasarana dengan
          individu, CSR perusahaan, dan mitra pemerintah secara terintegrasi
          dengan <strong>Data Induk Kemendikdasmen</strong>.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Keunggulan Platform EducationBridge:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Data Induk Sekolah Resmi</strong> (NPSN & Wilayah 3T
                Terverifikasi)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Verifikasi & Priority Score System</strong> (Skor
                Urgensi 0-100)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Kolaborasi 4 Peran</strong> (Sekolah, Donatur, CSR, &
                Monev Pemerintah)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>Transparansi Penyaluran Bantuan</strong> & Laporan
                Dampak Real-Time
              </span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleContinue}
          className="mt-6 w-full rounded-xl bg-[#1a2d4d] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
        >
          Masuk ke Platform EducationBridge →
        </button>

        <p className="mt-3 text-[11px] text-slate-400">
          EducationBridge · Transparan · Tepat Sasaran · Terverifikasi
          Kemendikdasmen
        </p>
      </div>
    </div>
  );
}
