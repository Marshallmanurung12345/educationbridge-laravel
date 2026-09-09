import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
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
    amount: 87000000,
    target: 130000000,
    donors: 532,
    days: 12,
    priority: "Sangat Prioritas",
    accent: "#dc2626",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Penyediaan Perpustakaan dan Buku Bacaan",
    school: "SMPN 1 Lumbis",
    location: "Nunukan, Kalimantan Utara",
    amount: 45000000,
    target: 100000000,
    donors: 318,
    days: 12,
    priority: "Prioritas",
    accent: "#f59e0b",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pengadaan Komputer untuk Siswa",
    school: "SMA Negeri 1 Timur Tengah",
    location: "Tangerang, Banten",
    amount: 76000000,
    target: 200000000,
    donors: 421,
    days: 20,
    priority: "Prioritas",
    accent: "#2563eb",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Akses Internet untuk Pembelajaran Digital",
    school: "SMP Negeri 1 Nusa Tana",
    location: "Kupang, NTT",
    amount: 10400000,
    target: 20000000,
    donors: 289,
    days: 25,
    priority: "Prioritas",
    accent: "#22c55e",
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
              amount: Number(item.raised_amount || 0),
              target: Number(item.target_amount || 1000000),
              donors: item.donors ?? 120,
              days: item.days ?? 12,
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
    <div className="bg-[#F5F2EE] text-[#1E2432]">
      <section className="w-full px-4 pb-8 pt-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="border-y border-[#dfe3e8] bg-[#f8f7f4] py-6 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="px-2 sm:px-6 lg:px-10">
              <div className="mb-5 inline-block border-l-2 border-[#c47d20] pl-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f4d66]">
                BERSAMA UNTUK PENDIDIKAN YANG LEBIH MERATA
              </div>

              <h1 className="max-w-[580px] font-display text-[2.9rem] leading-[0.96] tracking-[-0.04em] text-[#1d273a] sm:text-[4rem]">
                Menjembatani
                <br />
                Setiap Anak untuk
                <br />
                Masa Depan yang Lebih Baik
              </h1>

              <p className="mt-5 max-w-[620px] text-base leading-7 text-[#48576d]">
                EducationBridge menghubungkan sekolah yang membutuhkan dengan
                individu, perusahaan, dan pemerintah untuk menciptakan peluang
                pendidikan yang lebih merata di seluruh Indonesia.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/kampanye"
                  className="rounded-xl bg-[#1a2d4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#22365e]"
                >
                  Jelajahi Kebutuhan
                </Link>
                <Link
                  to="/kampanye"
                  className="rounded-xl border border-[#d9dfe8] bg-white px-5 py-3 text-sm font-semibold text-[#1d273a] transition hover:bg-[#eef3ff]"
                >
                  Mulai Berdonasi
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-[#dfe7ef]">
              <img
                src={childrenImage}
                alt="Anak-anak sekolah menyambut dukungan pendidikan"
                className="h-[460px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1d273a]/15 via-transparent to-[#1d273a]/10" />
              <div className="absolute right-5 top-5 max-w-[220px] bg-[#ebf1f4]/90 px-4 py-3 text-right shadow-sm backdrop-blur-sm">
                <span className="font-display text-[2.1rem] leading-none text-[#24354f]">
                  Pendidikan
                </span>
                <span className="mt-2 block font-display text-[1.85rem] leading-none text-[#24354f]">
                  untuk Peluang
                </span>
                <span className="mt-2 block font-display text-[1.85rem] leading-none text-[#24354f]">
                  yang Sama.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {heroMetrics.map((item) => (
            <div
              key={item.label}
              className="border border-[#dfe2e8] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] text-[#4e5b73]">{item.label}</p>
                  <p className="mt-3 text-[2rem] font-semibold leading-none text-[#1d273a]">
                    {item.value}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-[#c47d20]" />
              </div>
              <p className="mt-3 text-sm font-medium text-[#1ca36a]">
                {item.delta}
              </p>
            </div>
          ))}

          <div className="bg-[#1a2d4d] p-5 text-white">
            <p className="text-[12px] uppercase tracking-[0.14em] text-[#dfe9ff]">
              Mau Membantu Sekolah?
            </p>
            <p className="mt-4 text-[15px] leading-6 text-[#edf3ff]">
              Setiap kontribusi Anda membantu menyiapkan masa depan bagi siswa
              di seluruh Indonesia.
            </p>
            <Link
              to="/kampanye"
              className="mt-6 inline-flex items-center bg-[#f3c36b] px-4 py-3 text-sm font-semibold text-[#1a2d4d] transition hover:bg-[#f7d58f]"
            >
              Donasi Sekarang
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.75fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[2.1rem] text-[#1d273a]">
                Campaign Prioritas
              </h2>
              <Link
                to="/kampanye"
                className="text-sm font-semibold text-[#1a2d4d]"
              >
                Lihat Semua →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {featured.map((campaign, index) => (
                <Link
                  key={`${campaign.title}-${index}`}
                  to={`/kampanye/${index + 1}`}
                  className="overflow-hidden border border-[#dee3ea] bg-white transition hover:border-[#9aa7ba]"
                >
                  <div className="relative">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="h-52 w-full object-cover"
                    />
                    <span
                      className="absolute left-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{ backgroundColor: campaign.accent }}
                    >
                      {campaign.priority}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-[1.45rem] leading-tight text-[#1d273a]">
                      {campaign.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#53627d]">
                      {campaign.school}
                    </p>
                    <p className="mt-1 text-sm text-[#53627d]">
                      {campaign.location}
                    </p>

                    <div className="mt-3 h-1 overflow-hidden bg-[#eef1f5]">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min((campaign.amount / campaign.target) * 100, 100)}%`,
                          backgroundColor: campaign.accent,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-[#4b586f]">
                      <span>
                        {Math.round((campaign.amount / campaign.target) * 100)}%
                      </span>
                      <span>{campaign.donors} donor</span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[12px] text-[#64748b]">Terkumpul</p>
                        <p className="text-lg font-semibold text-[#1d273a]">
                          {formatRupiah(campaign.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#64748b]">Target</p>
                        <p className="text-lg font-semibold text-[#1d273a]">
                          {formatRupiah(campaign.target)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="border border-[#dfe5ee] bg-[#1a2d4d] p-5 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[2rem] text-white">
                  Peta Sebaran Kebutuhan
                </h3>
                <Link
                  to="/kampanye"
                  className="text-sm font-medium text-[#dfe9ff]"
                >
                  Lihat Peta →
                </Link>
              </div>

              <div className="mt-5 overflow-hidden border border-[#dfe8ff] bg-[#e8eef9]">
                <div className="map-shell">
                  <MapContainer
                    center={[-2.5, 118]}
                    zoom={5}
                    scrollWheelZoom={false}
                    style={{ height: "220px", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapPoints.map((point) => (
                      <Marker key={point.name} position={point.position}>
                        <Popup>
                          <div className="text-sm font-medium text-[#1d273a]">
                            {point.name}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              <div className="mt-5 flex gap-4 text-sm text-[#e8efff]">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5a36]" /> Sangat
                  Prioritas
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#fbbf24]" />{" "}
                  Prioritas
                </span>
              </div>
            </div>

            <div className="border border-[#dfe5ee] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-[1.7rem] text-[#1d273a]">
                  Aktivitas Terbaru
                </h3>
                <Link
                  to="/kampanye"
                  className="text-sm font-semibold text-[#1a2d4d]"
                >
                  Lihat Semua →
                </Link>
              </div>

              <ul className="space-y-3">
                {[
                  "PM Jaya Bersama berdonasi Rp 50.000.000 untuk Komputer di Nusa Tenggara Timur",
                  "Siti A. berdonasi Rp 100.000 untuk Buku Bacaan",
                  "SDN 1 Lumbis menghantarkan laporan penggunaan dana dan hasil pembelajaran",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-[#eef1f5] pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#1a2d4d]" />
                    <p className="text-sm leading-6 text-[#4b586f]">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
