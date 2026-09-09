import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { api } from "../api";
import childrenImage from "../assets/children.jpg";

const fallbackNeeds = [
  {
    title: "Perbaikan Atap dan Lantai Kelas",
    school: "SDN 03 Wamena Tengah",
    location: "Wamena, Papua Pegunungan",
    students: 320,
    score: 87,
    start_date: "2026-09-01",
    end_date: "2026-10-31",
    needed: 45000000,
    raised: 125000000,
    target: 200000000,
    status: "Sangat Prioritas",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pengadaan Perpustakaan dan Buku Bacaan",
    school: "SMPN 1 Lumbis",
    location: "Nunukan, Kalimantan Utara",
    students: 210,
    score: 76,
    start_date: "2026-09-05",
    end_date: "2026-11-15",
    needed: 30000000,
    raised: 92000000,
    target: 140000000,
    status: "Prioritas",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Pengadaan Komputer untuk Siswa",
    school: "SMA Negeri 1 Timur Tengah",
    location: "Tangerang, Banten",
    students: 187,
    score: 72,
    start_date: "2026-09-10",
    end_date: "2026-12-01",
    needed: 28000000,
    raised: 76000000,
    target: 160000000,
    status: "Prioritas",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
];

const mapPoints = [
  {
    name: "Papua Pegunungan",
    position: [-4.1, 138.95],
    color: "#d84747",
    detail: "12 sekolah membutuhkan dukungan",
  },
  {
    name: "Kalimantan Utara",
    position: [4.15, 117.6],
    color: "#e39a27",
    detail: "7 kebutuhan prioritas",
  },
  {
    name: "Nusa Tenggara Timur",
    position: [-10.17, 123.6],
    color: "#3479bd",
    detail: "9 sekolah terdata",
  },
  {
    name: "Aceh",
    position: [5.55, 95.32],
    color: "#e39a27",
    detail: "5 kebutuhan prioritas",
  },
  {
    name: "Sulawesi Selatan",
    position: [-5.13, 119.41],
    color: "#3479bd",
    detail: "8 sekolah terdata",
  },
];

function Score({ value }) {
  return (
    <div className="flex items-center gap-3 border-t border-[#edf0f4] pt-3">
      <div className="h-1.5 flex-1 bg-[#edf0f4]">
        <div className="h-full bg-[#e3a22f]" style={{ width: `${value}%` }} />
      </div>
      <span className="whitespace-nowrap text-xs font-bold text-[#17365d]">
        Score {value}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Deadline belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function NeedCard({ need, index }) {
  return (
    <Link
      to={`/kampanye/${index + 1}`}
      className="group overflow-hidden rounded-[14px] border border-[#e2e8ef] bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(23,54,93,0.1)]"
    >
      <img
        src={need.image}
        alt={need.title}
        className="h-48 w-full object-cover transition group-hover:scale-[1.02]"
      />
      <div className="p-5">
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.1em] ${need.score >= 80 ? "text-[#cf4141]" : "text-[#b57817]"}`}
        >
          {need.status}
        </span>
        <h3 className="mt-2 min-h-[48px] text-base font-bold leading-6 text-[#17365d]">
          {need.title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-[#526a83]">
          {need.school}
        </p>
        <p className="mt-1 text-xs text-[#8190a0]">{need.location}</p>
        <p className="mt-4 text-xs text-[#687b90]">
          {need.students} siswa terdampak
        </p>
        <p className="mt-2 text-xs text-[#687b90]">
          Berakhir {formatDate(need.end_date)}
        </p>
        <div className="mt-4">
          <Score value={need.score} />
        </div>
        <p className="mt-4 text-sm font-bold text-[#2767b1]">
          Kenali kebutuhannya{" "}
          <span className="transition group-hover:ml-1">→</span>
        </p>
      </div>
    </Link>
  );
}

export default function PublicHome() {
  const [needs, setNeeds] = useState(fallbackNeeds);

  useEffect(() => {
    api
      .listCampaigns({ status: "verified", sort: "priority" })
      .then((rows) => {
        if (!Array.isArray(rows) || !rows.length) return;
        setNeeds(
          rows.slice(0, 3).map((item, index) => ({
            ...fallbackNeeds[index],
            title: item.title,
            school: item.school_name || fallbackNeeds[index].school,
            location: item.location || fallbackNeeds[index].location,
            score: item.priority_score || fallbackNeeds[index].score,
            start_date: item.start_date || fallbackNeeds[index].start_date,
            end_date: item.end_date || fallbackNeeds[index].end_date,
            needed: item.target_amount || fallbackNeeds[index].needed,
            raised: item.raised_amount || fallbackNeeds[index].raised,
            target: item.target_amount || fallbackNeeds[index].target,
          })),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#faf9f6] text-[#23364f]">
      <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#718096]">
              Temukan sekolah yang membutuhkan dukungan
            </p>
            <h1 className="mt-5 max-w-[560px] font-display text-[3rem] leading-[1.04] text-[#17365d] sm:text-[4.15rem]">
              Setiap Sekolah Punya Kebutuhan.
              <br />
              <span className="text-[#2767b1]">Mari Kita Bantu Bersama.</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-base leading-7 text-[#5d7087]">
              EducationBridge menghubungkan sekolah yang membutuhkan dukungan
              dengan individu, perusahaan, dan mitra untuk menciptakan
              kesempatan pendidikan yang lebih merata.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/kampanye"
                className="rounded-[10px] bg-[#17365d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245083]"
              >
                Jelajahi Kebutuhan
              </Link>
              <Link
                to="/ajukan"
                className="rounded-[10px] border border-[#afbdcc] bg-white px-5 py-3 text-sm font-semibold text-[#17365d] hover:bg-[#f2f6fa]"
              >
                Ajukan Kebutuhan
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={childrenImage}
              alt="Anak-anak sekolah Indonesia"
              className="aspect-[4/3] w-full rounded-[16px] object-cover"
            />
            <div className="absolute -bottom-5 left-5 max-w-[280px] rounded-[12px] bg-white p-4 shadow-[0_10px_25px_rgba(23,54,93,0.14)] sm:left-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77879a]">
                Kebutuhan Prioritas
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold text-[#d84747]">87</span>
                <div>
                  <p className="text-xs font-bold text-[#17365d]">
                    Priority Score
                  </p>
                  <p className="mt-1 text-xs text-[#647990]">
                    Perbaikan Atap Kelas
                  </p>
                  <p className="text-[10px] text-[#8290a0]">
                    SDN 03 Wamena Tengah
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e9ee] bg-white px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1280px] gap-6 sm:grid-cols-3">
          <div className="flex gap-3">
            <span className="text-lg text-[#e3a22f]">✓</span>
            <div>
              <p className="text-sm font-bold text-[#17365d]">Terverifikasi</p>
              <p className="mt-1 text-xs leading-5 text-[#718096]">
                Setiap kebutuhan melalui proses verifikasi.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg text-[#e3a22f]">✓</span>
            <div>
              <p className="text-sm font-bold text-[#17365d]">Tepat Sasaran</p>
              <p className="mt-1 text-xs leading-5 text-[#718096]">
                Prioritas ditentukan berdasarkan tingkat kebutuhan.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-lg text-[#e3a22f]">✓</span>
            <div>
              <p className="text-sm font-bold text-[#17365d]">Transparan</p>
              <p className="mt-1 text-xs leading-5 text-[#718096]">
                Perkembangan bantuan dapat dipantau.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.6fr_1.4fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b27a1d]">
              Mulai dari sini
            </p>
            <h2 className="mt-3 max-w-sm font-display text-3xl leading-tight text-[#17365d] sm:text-4xl">
              Sekolah yang Sedang Membutuhkan Dukungan
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#687b90]">
              Temukan kebutuhan pendidikan yang paling mendesak dan lihat
              bagaimana dukungan dapat memberikan dampak.
            </p>
            <Link
              to="/kampanye"
              className="mt-6 inline-block text-sm font-bold text-[#2767b1]"
            >
              Lihat Semua Kebutuhan →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {needs.map((need, index) => (
              <NeedCard key={need.title} need={need} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e9ee] bg-white px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b27a1d]">
              Apa yang membentuk skor?
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#17365d]">
              Kenapa mereka diprioritaskan?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#687b90]">
              Priority Score menjelaskan tingkat kebutuhan dengan bahasa yang
              mudah dipahami, bukan sekadar angka.
            </p>
          </div>
          <div className="space-y-4">
            {[
              ["Lokasi 3T", "92%"],
              ["Kondisi fasilitas", "96%"],
              ["Siswa terdampak", "78%"],
            ].map(([label, width]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-xs font-semibold text-[#526a83]">
                  <span>{label}</span>
                  <span>tinggi</span>
                </div>
                <div className="h-2 bg-[#edf0f4]">
                  <div className="h-full bg-[#e3a22f]" style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px] border-y border-[#dce5ee] py-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#718096]">
                Dukungan yang sedang berjalan
              </p>
              <h2 className="mt-3 font-display text-3xl text-[#17365d]">
                Bantuan yang Sedang Berjalan
              </h2>
              <p className="mt-2 text-sm text-[#687b90]">
                Lihat perkembangan dukungan untuk kebutuhan sekolah yang
                dipilih.
              </p>
            </div>
            <Link to="/kampanye/1" className="text-sm font-bold text-[#2767b1]">
              Lihat detail →
            </Link>
          </div>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-3xl font-bold text-[#17365d]">Rp 125 Juta</p>
              <p className="mt-1 text-xs text-[#718096]">
                terkumpul dari Rp 200 Juta
              </p>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-[#edf0f4]">
                <div className="h-full w-[62.5%] bg-[#3479bd]" />
              </div>
              <p className="mt-2 text-right text-xs font-semibold text-[#526a83]">
                62,5% terpenuhi
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 lg:grid-cols-2">
          <img
            src={needs[0].image}
            alt="Kondisi sekolah yang membutuhkan bantuan"
            className="h-[390px] w-full rounded-[14px] object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b27a1d]">
              Cerita sekolah
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-[#17365d]">
              Di balik setiap kebutuhan, ada cerita yang perlu didengar.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#687b90]">
              Atap ruang kelas SDN 03 Wamena Tengah mengalami kerusakan dan
              membuat kegiatan belajar terganggu saat hujan.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#526a83]">
              320 siswa terdampak
            </p>
            <Link
              to="/kampanye/1"
              className="mt-6 inline-block rounded-[10px] bg-[#17365d] px-5 py-3 text-sm font-semibold text-white"
            >
              Lihat Cerita Sekolah
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#eef5fb] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#718096]">
              Cara membaca kebutuhan
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#17365d]">
              Mana yang Paling Membutuhkan?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#687b90]">
              Priority Score membantu memahami tingkat urgensi berdasarkan
              kondisi sekolah, jumlah siswa terdampak, lokasi, dan faktor
              lainnya.
            </p>
          </div>
          <div className="rounded-[14px] bg-white p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-bold text-[#17365d]">87</span>
                <span className="ml-2 text-sm text-[#718096]">/ 100</span>
              </div>
              <span className="text-sm font-bold text-[#d84747]">
                Sangat Prioritas
              </span>
            </div>
            <div className="mt-5 h-2 bg-[#edf0f4]">
              <div className="h-full w-[87%] bg-[#e3a22f]" />
            </div>
            <p className="mt-4 text-xs leading-5 text-[#718096]">
              Skor ini membantu masyarakat menemukan kebutuhan yang perlu
              diperhatikan lebih dulu.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[14px] border border-[#dfe7ef] bg-[#eef5fb] p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718096]">
                  Jelajahi wilayah
                </p>
                <h2 className="mt-2 font-display text-3xl text-[#17365d]">
                  Pendidikan Indonesia, dengan kebutuhan yang beragam.
                </h2>
              </div>
              <Link
                to="/kampanye"
                className="hidden text-xs font-bold text-[#2767b1] sm:block"
              >
                Lihat peta lengkap →
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
                        <strong>{point.name}</strong>
                        <br />
                        {point.detail}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#687b90]">
              <span>
                <b className="text-[#d84747]">●</b> Sangat Prioritas
              </span>
              <span>
                <b className="text-[#e39a27]">●</b> Prioritas
              </span>
              <span>
                <b className="text-[#3479bd]">●</b> Kebutuhan lainnya
              </span>
            </div>
          </div>
          <div className="rounded-[14px] border border-[#e2e8ef] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718096]">
              Smart matching
            </p>
            <h2 className="mt-3 font-display text-2xl text-[#17365d]">
              Belum tahu kebutuhan mana yang ingin Anda dukung?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#687b90]">
              Beritahu kami bidang yang ingin Anda bantu.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Infrastruktur",
                "Teknologi",
                "Buku & Literasi",
                "Beasiswa",
                "Sanitasi",
                "Lainnya",
              ].map((item) => (
                <span
                  key={item}
                  className="border border-[#d5dfe9] px-3 py-2 text-xs font-semibold text-[#526a83]"
                >
                  {item}
                </span>
              ))}
            </div>
            <Link
              to="/cocok"
              className="mt-6 inline-block rounded-[10px] bg-[#17365d] px-4 py-3 text-sm font-semibold text-white"
            >
              Temukan Kebutuhan
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e9ee] bg-white px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b27a1d]">
              Untuk perusahaan
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#17365d]">
              Program CSR yang Menjangkau Lebih Jauh
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#687b90]">
              Temukan kebutuhan sekolah yang sesuai dengan fokus program CSR
              perusahaan Anda.
            </p>
            <a
              href="#footer"
              className="mt-6 inline-block text-sm font-bold text-[#2767b1]"
            >
              Pelajari Program CSR →
            </a>
          </div>
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80"
            alt="Ruang kerja tim yang mendukung program pendidikan"
            className="h-56 w-full rounded-[14px] object-cover"
          />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#718096]">
            Transparansi
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#17365d]">
            Setiap Dukungan Punya Jejak.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-5">
            {[
              "Sekolah Mengajukan",
              "EducationBridge Memverifikasi",
              "Dukungan Disalurkan",
              "Sekolah Melaporkan",
              "Dampak Terlihat",
            ].map((step, index) => (
              <div
                key={step}
                className="relative border-t-2 border-[#d6a331] pt-4"
              >
                <span className="text-xs font-bold text-[#d6a331]">
                  0{index + 1}
                </span>
                <p className="mt-2 text-sm font-bold leading-5 text-[#17365d]">
                  {step}
                </p>
                {index < 4 && (
                  <span className="absolute right-0 top-[-10px] hidden text-xl text-[#afbdcc] sm:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7fa] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl text-[#17365d]">
              Sudah bersama-sama membantu
            </h2>
            <p className="mt-2 text-sm text-[#687b90]">
              Dukungan yang terlihat, dilaporkan, dan dirasakan.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <strong className="block text-3xl text-[#17365d]">87</strong>
              <span className="text-xs text-[#687b90]">sekolah</span>
            </div>
            <div>
              <strong className="block text-3xl text-[#17365d]">12.450</strong>
              <span className="text-xs text-[#687b90]">siswa</span>
            </div>
            <div>
              <strong className="block text-3xl text-[#17365d]">15</strong>
              <span className="text-xs text-[#687b90]">provinsi</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-6 rounded-[14px] bg-[#17365d] px-6 py-10 sm:flex-row sm:items-center sm:px-10">
          <h2 className="max-w-xl font-display text-3xl leading-tight text-white">
            Karena setiap anak berhak belajar di tempat yang layak.
          </h2>
          <Link
            to="/kampanye"
            className="shrink-0 rounded-[10px] bg-[#f2bd3e] px-5 py-3 text-sm font-bold text-[#17365d]"
          >
            Jelajahi Kebutuhan
          </Link>
        </div>
      </section>
    </div>
  );
}
