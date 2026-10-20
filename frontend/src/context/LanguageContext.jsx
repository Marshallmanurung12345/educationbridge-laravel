import { useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./languageContext";

const translations = {
  id: {
    nav: {
      home: "Beranda",
      needs: "Kebutuhan Sekolah",
      about: "Tentang Kami",
      impact: "Dampak",
      login: "Masuk",
      register: "Daftar",
      closeMenu: "Tutup menu",
      openMenu: "Buka menu",
      primaryNavigation: "Navigasi utama",
      mobileNavigation: "Navigasi mobile",
      language: "Pilih bahasa",
      roles: {
        admin: "Admin",
        sekolah: "Sekolah",
        individu: "Donatur",
        perusahaan: "Mitra Perusahaan",
        pemerintah: "Pemerintah",
        user: "Pengguna",
      },
      links: {
        admin: "Panel Admin",
        schoolAccounts: "Verifikasi Sekolah",
        schoolStatus: "Status Verifikasi",
        auditLogs: "Audit Aktivitas",
        allNeeds: "Semua Kebutuhan",
        school: "Dashboard Sekolah",
        browse: "Jelajahi Kebutuhan",
        fundraise: "Galang Dana untuk Sekolah",
        recommendations: "Rekomendasi Pintar",
        csr: "Portal CSR",
        adoption: "Program Adopsi",
        government: "Dashboard Monev",
        map: "Peta Kebutuhan Daerah",
        logout: "Keluar",
      },
    },
    home: {
      heroLead: "Bersama, Wujudkan",
      heroHighlight: "Pendidikan yang Lebih Baik",
      heroTail: "di Wilayah 3T",
      heroDescription:
        "Dukung sekolah-sekolah di daerah tertinggal, terdepan, dan terluar agar setiap anak memiliki kesempatan belajar yang lebih layak.",
      fundraise: "Galang Dana",
      donate: "Donasi",
      needsTitle: "Kebutuhan yang Perlu Diperhatikan",
      needsDescription:
        "Beberapa kebutuhan sekolah yang membutuhkan dukungan lebih cepat.",
      allNeeds: "Lihat Semua Kebutuhan",
      loading: "Memuat kebutuhan sekolah...",
      loadError: "Kebutuhan sekolah belum dapat dimuat.",
      retry: "Coba lagi",
      empty: "Belum ada kebutuhan sekolah terverifikasi untuk ditampilkan.",
      progress: "Progress donasi",
      progressUnavailable: "Informasi donasi belum tersedia.",
      raised: "terkumpul",
      target: "Target",
      seeNeed: "Lihat Kebutuhan",
      photoUnavailable: "Foto kebutuhan belum tersedia",
      photoAlt: "Foto dokumentasi belum tersedia untuk",
      impact:
        "Bersama, buka kesempatan belajar yang lebih layak bagi anak-anak di wilayah 3T.",
      support: "Dukung Kebutuhan Sekolah",
    },
    footer: {
      tagline:
        "Menjembatani kebutuhan pendidikan dengan dukungan yang tepat sasaran, transparan, dan berdampak.",
      explore: "Jelajahi",
      home: "Beranda",
      browse: "Jelajahi Kebutuhan",
      fundraise: "Ajukan Kebutuhan",
      recommendations: "Rekomendasi",
      help: "Bantuan",
      faq: "FAQ",
      guide: "Panduan Pengguna",
      privacy: "Kebijakan Privasi",
      contact: "Kontak",
      stayConnected: "Tetap Terhubung",
      newsletter:
        "Dapatkan informasi terbaru seputar pendidikan dan program EducationBridge.",
      email: "Alamat email",
      emailPlaceholder: "Masukkan email Anda",
      subscribe: "Berlangganan newsletter",
      copyright: "All rights reserved.",
    },
  },
  en: {
    nav: {
      home: "Home",
      needs: "School Needs",
      about: "About Us",
      impact: "Impact",
      login: "Log in",
      register: "Sign up",
      closeMenu: "Close menu",
      openMenu: "Open menu",
      primaryNavigation: "Primary navigation",
      mobileNavigation: "Mobile navigation",
      language: "Select language",
      roles: {
        admin: "Admin",
        sekolah: "School",
        individu: "Donor",
        perusahaan: "Corporate Partner",
        pemerintah: "Government",
        user: "User",
      },
      links: {
        admin: "Admin Panel",
        schoolAccounts: "School Verification",
        schoolStatus: "Verification Status",
        auditLogs: "Activity Audit Log",
        allNeeds: "All School Needs",
        school: "School Dashboard",
        browse: "Browse School Needs",
        fundraise: "Fundraise for a School",
        recommendations: "Smart Recommendations",
        csr: "CSR Portal",
        adoption: "Adoption Program",
        government: "Monitoring Dashboard",
        map: "Regional Needs Map",
        logout: "Log out",
      },
    },
    home: {
      heroLead: "Together, Let’s Create",
      heroHighlight: "Better Education",
      heroTail: "in 3T Regions",
      heroDescription:
        "Support schools in underdeveloped, frontier, and remote regions so every child has the opportunity to learn in a better environment.",
      fundraise: "Raise Funds",
      donate: "Donate",
      needsTitle: "School Needs That Deserve Attention",
      needsDescription:
        "Some school needs that would benefit from timely support.",
      allNeeds: "View All School Needs",
      loading: "Loading school needs...",
      loadError: "School needs could not be loaded.",
      retry: "Try again",
      empty: "There are no verified school needs to display yet.",
      progress: "Donation progress",
      progressUnavailable: "Donation information is not available yet.",
      raised: "raised",
      target: "Goal",
      seeNeed: "View School Need",
      photoUnavailable: "Need photo is not available",
      photoAlt: "Documentation photo is not available for",
      impact:
        "Together, we can create better learning opportunities for children in 3T regions.",
      support: "Support a School Need",
    },
    footer: {
      tagline:
        "Connecting education needs with targeted, transparent, and impactful support.",
      explore: "Explore",
      home: "Home",
      browse: "Browse School Needs",
      fundraise: "Submit a School Need",
      recommendations: "Recommendations",
      help: "Help",
      faq: "FAQ",
      guide: "User Guide",
      privacy: "Privacy Policy",
      contact: "Contact",
      stayConnected: "Stay Connected",
      newsletter:
        "Get the latest updates on education and EducationBridge programs.",
      email: "Email address",
      emailPlaceholder: "Enter your email",
      subscribe: "Subscribe to the newsletter",
      copyright: "All rights reserved.",
    },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("educationbridge-language") === "en"
        ? "en"
        : "id";
    } catch {
      return "id";
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        setLanguage(nextLanguage);
        try {
          localStorage.setItem("educationbridge-language", nextLanguage);
        } catch {
          // Language selection still applies for the current session.
        }
      },
      translations: translations[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
