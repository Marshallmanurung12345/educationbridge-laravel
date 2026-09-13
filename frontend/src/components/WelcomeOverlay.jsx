import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

export default function WelcomeOverlay({
  roleKey,
  roleBadge,
  title,
  subtitle,
  features = [],
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Tampilkan overlay jika belum ditutup di sesi ini
    const seen = sessionStorage.getItem(`welcome_seen_${roleKey}`);
    if (!seen) {
      setShow(true);
    }
  }, [roleKey]);

  function handleContinue() {
    sessionStorage.setItem(`welcome_seen_${roleKey}`, "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md transition-all">
      <div className="max-w-lg w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-md">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 border border-blue-200 uppercase tracking-wider mb-2">
          {roleBadge || "Selamat Datang"}
        </span>

        <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          {title || "Selamat Datang di EducationBridge"}
        </h2>

        <p className="mt-3 text-xs text-slate-600 leading-relaxed sm:text-sm">
          {subtitle ||
            "Platform terintegrasi Data Induk Kemendikdasmen untuk pemerataan pendidikan Indonesia."}
        </p>

        {features.length > 0 && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kemampuan & Hak Akses Peran Anda:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              {features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleContinue}
          className="mt-6 w-full rounded-xl bg-[#1a2d4d] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
        >
          Lanjutkan ke Dashboard Utama →
        </button>

        <p className="mt-3 text-[11px] text-slate-400">
          EducationBridge · Transparan · Tepat Sasaran · Terverifikasi
        </p>
      </div>
    </div>
  );
}
