import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { api } from "../api";
import childrenImage from "../assets/children.jpg";

const mapPoints = [
  { name: "Wamena, Papua", position: [-4.1, 138.95], color: "#f97316" },
  {
    name: "Nunukan, Kalimantan Utara",
    position: [4.15, 117.6],
    color: "#f59e0b",
  },
  { name: "Kupang, NTT", position: [-10.17, 123.6], color: "#0ea5e9" },
  { name: "Banda Aceh, Aceh", position: [5.55, 95.32], color: "#ef4444" },
  { name: "Makassar, Sulawesi", position: [-5.13, 119.41], color: "#10b981" },
];

const heroMetrics = [
  { label: "Campaign Aktif", value: 187, delta: "+12%", tone: "blue" },
  { label: "Siswa Terdampak", value: "12.456", delta: "+8%", tone: "green" },
  { label: "Rp 2,1 M", value: "Dana Tersalurkan", delta: "+24%", tone: "gold" },
  { label: "1.892", value: "Donatur Aktif", delta: "+15%", tone: "rose" },
];

const sampleCampaigns = [
  {
    title: "Perbaikan Atap dan Lantai Kelas yang Bocor",
    school: "SDN 03 Wamena Tengah",
    location: "Wamena, Papua Pegunungan",
    students: 320,
    category: "Infrastruktur",
    priorityScore: 87,
    priority: "Sangat Prioritas",
    accent: "#dc2626",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Penyediaan Perpustakaan dan Buku Bacaan",
    school: "SMPN 1 Lumbis",
    location: "Nunukan, Kalimantan Utara",
    students: 210,
    category: "Buku & Literasi",
    priorityScore: 76,
    priority: "Prioritas",
    accent: "#f59e0b",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pengadaan Komputer untuk Siswa",
    school: "SMA Negeri 1 Timur Tengah",
    location: "Tangerang, Banten",
    students: 187,
    category: "Teknologi",
    priorityScore: 72,
    priority: "Prioritas",
    accent: "#2563eb",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Akses Internet untuk Pembelajaran Digital",
    school: "SMP Negeri 1 Nusa Tana",
    location: "Kupang, NTT",
    students: 156,
    category: "Sanitasi & Air Bersih",
    priorityScore: 65,
    priority: "Cukup Prioritas",
    accent: "#2563eb",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  const [stats, setStats] = useState({
    verifiedCampaigns: 187,
    totalStudents: 12456,
    totalRaised: 2100000,
    totalDonors: 1892,
  });
  const [featured, setFeatured] = useState(sampleCampaigns);

  useEffect(() => {
    api
      .stats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});

    api
      .listCampaigns({ status: "verified", sort: "priority" })
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          setFeatured(
            rows.slice(0, 4).map((item, idx) => ({
              ...sampleCampaigns[idx % sampleCampaigns.length],
              title: item.title,
              school: item.school_name,
              location: item.location,
              students: item.students ?? 120,
              category: item.category || "Infrastruktur",
              priorityScore: item.priority_score ?? 72,
              priority: item.priority_label || "Prioritas",
              image: sampleCampaigns[idx % sampleCampaigns.length].image,
              accent: sampleCampaigns[idx % sampleCampaigns.length].accent,
            })),
          );
        }
      })
      .catch(() => {
        setFeatured(sampleCampaigns);
      });
  }, []);

  return (
    <div className="bg-[#f7f9fc] text-[#172b4d]">
      <section className="relative overflow-hidden bg-[#edf6ff] px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid min-h-[610px] max-w-[1560px] items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="relative z-10">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#55718f]">
              Bersama untuk pendidikan yang lebih merata
            </p>
            <h1 className="max-w-[620px] font-display text-[3.25rem] leading-[0.98] text-[#17365d] sm:text-[4.5rem]">
              Memahami Kebutuhan.
              <br />
              <span className="text-[#1d62b5]">Menghubungkan Dukungan.</span>
              <br />
              Membangun Pendidikan.
            </h1>
            <p className="mt-6 max-w-[590px] text-base leading-7 text-[#506985]">
              EducationBridge menjembatani sekolah yang membutuhkan dengan
              individu, perusahaan, dan mitra untuk menciptakan kesempatan
              pendidikan yang lebih merata di seluruh Indonesia.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/kampanye"
                className="bg-[#17365d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4d83]"
              >
                Jelajahi Kebutuhan <span className="ml-2">→</span>
              </Link>
              <Link
                to="/ajukan"
                className="border border-[#718aa8] bg-white/70 px-5 py-3 text-sm font-semibold text-[#17365d] hover:bg-white"
              >
                Ajukan Kebutuhan Sekolah
              </Link>
            </div>
            <div className="mt-12 grid max-w-[600px] gap-5 sm:grid-cols-3">
              {[
                {
                  title: "Tepat Sasaran",
                  text: "Berbasis data & priority score",
                },
                {
                  title: "Transparan",
                  text: "Dapat dipantau oleh semua pihak",
                },
                {
                  title: "Berdampak Nyata",
                  text: "Untuk pendidikan yang lebih merata",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="border-l-2 border-[#d6a331] pl-3"
                >
                  <p className="text-sm font-bold text-[#17365d]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#60758d]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[500px] overflow-hidden rounded-[16px] bg-[#d7e8f8]">
            <img
              src={childrenImage}
              alt="Siswa Indonesia di lingkungan sekolah"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#edf6ff]/75 via-transparent to-[#17365d]/10" />
            <div className="absolute right-5 top-5 max-w-[240px] bg-white/90 p-4 text-right shadow-lg">
              <p className="font-display text-2xl leading-tight text-[#17365d]">
                Pendidikan yang lebih merata membuka lebih banyak kemungkinan.
              </p>
            </div>
            <div className="absolute bottom-5 left-5 max-w-[350px] bg-white p-4 shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a8798]">
                Kebutuhan paling mendesak saat ini
              </p>
              <div className="mt-3 flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#df3f3f] text-xl font-bold text-[#df3f3f]">
                  87
                </div>
                <div>
                  <p className="text-sm font-bold text-[#17365d]">
                    Perbaikan Atap dan Lantai Kelas yang Bocor
                  </p>
                  <p className="mt-1 text-xs text-[#6b7d91]">
                    SDN 03 Wamena Tengah
                    <br />
                    Wamena, Papua Pegunungan
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-[#df3f3f]">
                    Sangat Prioritas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1560px] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: "▦",
              value: "127",
              label: "Sekolah Terdaftar",
              delta: "+12% dari bulan lalu",
            },
            {
              icon: "♧",
              value: "12.450",
              label: "Siswa Terdampak",
              delta: "+8% dari bulan lalu",
            },
            {
              icon: "▤",
              value: "42",
              label: "Kebutuhan Prioritas Tinggi",
              delta: "+5% dari bulan lalu",
            },
            {
              icon: "⌖",
              value: "18",
              label: "Provinsi Terjangkau",
              delta: "+3% dari bulan lalu",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex items-start gap-3 border border-[#e2e8f0] bg-white p-5"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center text-xl ${["bg-[#e8f2ff] text-[#2867b2]", "bg-[#eaf8f1] text-[#258a5b]", "bg-[#fff6e5] text-[#c17a15]", "bg-[#fff0f0] text-[#d74747]"][index]}`}
              >
                {item.icon}
              </span>
              <div>
                <p className="text-2xl font-bold text-[#17365d]">
                  {item.value}
                </p>
                <p className="text-xs font-semibold text-[#4e6480]">
                  {item.label}
                </p>
                <p className="mt-1 text-[10px] text-[#1f9d61]">{item.delta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1560px]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#52708f]">
                Priority score
              </p>
              <h2 className="mt-2 font-display text-3xl text-[#17365d] sm:text-4xl">
                Kebutuhan Pendidikan Paling Prioritas
              </h2>
              <p className="mt-2 text-sm text-[#687d95]">
                Berdasarkan tingkat kebutuhan, urgensi, kondisi fasilitas,
                lokasi, dan jumlah siswa terdampak.
              </p>
            </div>
            <Link
              to="/kampanye"
              className="hidden text-sm font-bold text-[#1d62b5] sm:block"
            >
              Lihat Semua →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((campaign, index) => (
              <Link
                key={`${campaign.title}-${index}`}
                to={`/kampanye/${index + 1}`}
                className="group overflow-hidden border border-[#e0e7ef] bg-white transition hover:-translate-y-0.5 hover:border-[#8da8c5]"
              >
                <div className="relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="h-44 w-full object-cover"
                  />
                  <span
                    className="absolute left-3 top-3 bg-white px-2 py-1 text-[10px] font-bold"
                    style={{ color: campaign.accent }}
                  >
                    {campaign.priority}
                  </span>
                  <span
                    className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white text-lg font-bold"
                    style={{
                      borderColor: campaign.accent,
                      color: campaign.accent,
                    }}
                  >
                    {campaign.priorityScore}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="min-h-[44px] text-sm font-bold leading-5 text-[#17365d]">
                    {campaign.title}
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-[#3f5874]">
                    {campaign.school}
                  </p>
                  <p className="mt-1 text-xs text-[#74859a]">
                    ⌖ {campaign.location}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#edf0f4] pt-3 text-[11px] text-[#60748d]">
                    <span>♙ {campaign.students} siswa terdampak</span>
                    <span>▦ {campaign.category}</span>
                  </div>
                  <span className="mt-4 flex items-center justify-center bg-[#f3f6fa] py-2 text-xs font-bold text-[#17365d] group-hover:bg-[#e7f0fb]">
                    Lihat Kebutuhan <span className="ml-2">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1560px] gap-5 xl:grid-cols-[1.5fr_0.75fr]">
          <div className="border border-[#dce6f1] bg-[#edf6ff] p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#17365d]">
                Peta Sebaran Kebutuhan Pendidikan
              </h2>
              <Link to="/kampanye" className="text-xs font-bold text-[#1d62b5]">
                Lihat Peta Lengkap →
              </Link>
            </div>
            <div className="mt-5 overflow-hidden border border-white bg-white">
              <div className="map-shell">
                <MapContainer
                  center={[-2.5, 118]}
                  zoom={5}
                  scrollWheelZoom={false}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapPoints.map((point) => (
                    <Marker key={point.name} position={point.position}>
                      <Popup>
                        <div className="text-sm font-medium text-[#17365d]">
                          {point.name}
                          <br />
                          <span className="text-xs font-normal">
                            Kebutuhan prioritas terpantau
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#526983]">
              <span>
                ● <span className="text-[#df3f3f]">Sangat Prioritas</span>
              </span>
              <span>
                ● <span className="text-[#e49a18]">Prioritas</span>
              </span>
              <span>
                ● <span className="text-[#2d78c4]">Kebutuhan lainnya</span>
              </span>
            </div>
          </div>
          <div className="border border-[#dce6f1] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#52708f]">
              Smart matching
            </p>
            <h2 className="mt-2 font-display text-2xl text-[#17365d]">
              Temukan Kebutuhan Sesuai Minat Anda
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#687d95]">
              Pilih bidang yang ingin Anda dukung dan kami akan merekomendasikan
              kebutuhan yang sesuai.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                "Infrastruktur",
                "Teknologi",
                "Buku & Literasi",
                "Beasiswa",
                "Sanitasi & Air Bersih",
                "Lainnya",
              ].map((category) => (
                <span
                  key={category}
                  className="border border-[#d9e2ed] px-3 py-2 text-xs font-semibold text-[#49617d]"
                >
                  {category}
                </span>
              ))}
            </div>
            <Link
              to="/cocok"
              className="mt-5 inline-flex bg-[#17365d] px-4 py-3 text-xs font-bold text-white"
            >
              Lihat Rekomendasi →
            </Link>
            <p className="mt-3 text-[11px] text-[#8795a5]">
              Masuk untuk mendapatkan rekomendasi yang dipersonalisasi.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1560px] gap-4 md:grid-cols-2">
          <div className="flex min-h-[220px] items-end justify-between gap-5 border border-[#dce6f1] bg-white p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2867b2]">
                Untuk Perusahaan / CSR
              </p>
              <h2 className="mt-3 max-w-md font-display text-3xl text-[#17365d]">
                Salurkan Program CSR Anda dengan Dampak Nyata
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#687d95]">
                Temukan sekolah yang sesuai dengan fokus CSR perusahaan
                berdasarkan lokasi, bidang bantuan, dan tingkat kebutuhan.
              </p>
              <a
                href="#footer"
                className="mt-5 inline-block text-xs font-bold text-[#1d62b5]"
              >
                Pelajari Program CSR →
              </a>
            </div>
            <div className="hidden h-24 w-24 bg-[#e8f2ff] md:block" />
          </div>
          <div className="flex min-h-[220px] items-end justify-between gap-5 border border-[#eadfca] bg-[#fffaf0] p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b87416]">
                Untuk Sekolah
              </p>
              <h2 className="mt-3 max-w-md font-display text-3xl text-[#17365d]">
                Sekolah Membutuhkan Dukungan?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#687d95]">
                Ajukan kebutuhan pendidikan sekolah Anda. Tim EducationBridge
                akan melakukan verifikasi sebelum kebutuhan dipublikasikan.
              </p>
              <Link
                to="/ajukan"
                className="mt-5 inline-block text-xs font-bold text-[#b87416]"
              >
                Ajukan Kebutuhan →
              </Link>
            </div>
            <div className="hidden h-24 w-24 bg-[#f4e5bd] md:block" />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1560px] gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="border border-[#e0e7ef] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#17365d]">
                Dampak yang Telah Dicapai
              </h2>
              <span className="text-xs font-bold text-[#1d62b5]">
                Lihat Selengkapnya →
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["87", "Sekolah terbantu"],
                ["12.450", "Siswa terdampak"],
                ["240", "Ruang belajar diperbaiki"],
                ["15", "Provinsi terjangkau"],
              ].map(([value, label]) => (
                <div key={label} className="bg-[#f7faff] p-4">
                  <p className="text-2xl font-bold text-[#17365d]">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-[#667b92]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-[#e0e7ef] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#17365d]">
                Berita & Pembaruan
              </h2>
              <span className="text-xs font-bold text-[#1d62b5]">
                Lihat Semua →
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ["Kolaborasi untuk Pendidikan di Papua", "12 Agustus 2026"],
                ["Pentingnya Akses Teknologi di Daerah 3T", "5 Agustus 2026"],
                ["Perkembangan Program EducationBridge", "28 Juli 2026"],
              ].map(([title, date]) => (
                <div
                  key={title}
                  className="border-b border-[#edf0f4] pb-3 last:border-0"
                >
                  <p className="text-xs font-bold text-[#17365d]">{title}</p>
                  <p className="mt-1 text-[10px] text-[#8795a5]">{date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1560px] flex-col items-start justify-between gap-5 bg-[#17365d] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bed2e9]">
              Jadi bagian dari perubahan
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl leading-tight">
              Bersama, kita bisa menghadirkan pendidikan yang lebih merata untuk
              seluruh anak Indonesia.
            </h2>
          </div>
          <Link
            to="/daftar"
            className="shrink-0 bg-[#f3bd35] px-5 py-3 text-xs font-bold text-[#17365d]"
          >
            Mulai Berkontribusi →
          </Link>
        </div>
      </section>
    </div>
  );
}
