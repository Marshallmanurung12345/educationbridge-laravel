import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const categories = ["Fasilitas", "Buku", "Teknologi", "Beasiswa", "Laboratorium"];
const categoryTags = {
  Fasilitas: ["renovasi", "infrastruktur"],
  Buku: ["buku", "literasi"],
  Teknologi: ["teknologi", "digital"],
  Beasiswa: ["beasiswa"],
  Laboratorium: ["teknologi", "sains"],
};

const initialForm = {
  school_id: "",
  category: "Fasilitas",
  title: "",
  description: "",
  rab_description: "",
  supporting_document: "",
  applicant_relationship: "",
  start_date: "",
  end_date: "",
  target_amount: "",
  student_count: "",
  urgency: 3,
  facility_condition: 3,
  remoteness: 3,
  access_score: 3,
};

const today = new Date().toISOString().slice(0, 10);

function schoolLocation(school) {
  return [school.kecamatan, school.kabupaten_kota, school.provinsi]
    .filter(Boolean)
    .join(", ");
}

export default function CreateCampaign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSchoolAccount = user?.role === "sekolah";
  const [form, setForm] = useState(initialForm);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [schoolProvince, setSchoolProvince] = useState("");
  const [schoolResults, setSchoolResults] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(user?.school || null);
  const [searchingSchools, setSearchingSchools] = useState(false);
  const [schoolLoadError, setSchoolLoadError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    if (!isSchoolAccount || !user?.school) return;
    const school = user.school;
    setSelectedSchool(school);
    setSchoolSearch(`${school.name} · ${school.npsn}`);
    setForm((current) => ({
      ...current,
      school_id: school.id,
      remoteness: school.is_3t ? 5 : 3,
    }));
  }, [isSchoolAccount, user?.school]);

  useEffect(() => {
    if (selectedSchool && schoolSearch === `${selectedSchool.name} · ${selectedSchool.npsn}`) {
      return undefined;
    }

    const query = schoolSearch.trim() || (isSchoolAccount ? user?.npsn || "" : "");
    if (!isSchoolAccount && query.length < 2 && !schoolLevel && !schoolProvince) {
      setSchoolResults([]);
      setSchoolLoadError("");
      return undefined;
    }
    if (isSchoolAccount && !query) {
      setSchoolResults([]);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSearchingSchools(true);
      setSchoolLoadError("");
      try {
        const params = {
          ...(query.length >= 2 ? { q: query } : {}),
          ...(schoolLevel ? { jenjang: schoolLevel } : {}),
          ...(schoolProvince ? { provinsi: schoolProvince } : {}),
          limit: 20,
        };
        const results = await api.listSchools(params);
        if (!active) return;

        const matches = Array.isArray(results) ? results : [];
        const schoolMatches =
          isSchoolAccount && user?.npsn
            ? matches.filter((school) => school.npsn === user.npsn)
            : matches;
        setSchoolResults(schoolMatches);

        if (isSchoolAccount && !selectedSchool) {
          const linkedSchool = schoolMatches.find(
            (school) => String(school.id) === String(user?.school_id),
          );
          if (linkedSchool) selectSchool(linkedSchool);
          else if (schoolMatches.length === 0) {
            setSchoolLoadError(
              "Data sekolah resmi belum cocok dengan NPSN akun ini. Hubungi admin untuk pemeriksaan.",
            );
          }
        }
      } catch (loadError) {
        if (active) setSchoolLoadError(loadError.message);
      } finally {
        if (active) setSearchingSchools(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    isSchoolAccount,
    schoolLevel,
    schoolProvince,
    schoolSearch,
    selectedSchool,
    user?.npsn,
    user?.school_id,
  ]);

  const provinces = useMemo(
    () => [...new Set(schoolResults.map((school) => school.provinsi).filter(Boolean))].sort(),
    [schoolResults],
  );

  function selectSchool(school) {
    setSelectedSchool(school);
    setSchoolSearch(`${school.name} · ${school.npsn}`);
    setSchoolResults([]);
    setForm((current) => ({
      ...current,
      school_id: school.id,
      remoteness: school.is_3t ? 5 : 3,
    }));
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!selectedSchool) {
      setError("Pilih sekolah dari hasil pencarian data resmi.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createCampaign({
        ...form,
        school_id: selectedSchool.id,
        tags: [form.category.toLowerCase(), ...(categoryTags[form.category] || [])],
        target_amount: Number(form.target_amount),
        student_count: Number(form.student_count),
        urgency: Number(form.urgency),
        facility_condition: Number(form.facility_condition),
        remoteness: Number(form.remoteness),
        access_score: Number(form.access_score),
      });
      setSubmitted(created);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-xl rounded-xl border border-[#E6EAF0] bg-white p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">✓</span>
          <h1 className="mt-4 text-2xl font-semibold text-[#17345B]">Pengajuan berhasil dikirim</h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Kebutuhan <strong className="text-[#17345B]">{submitted.title}</strong> untuk {submitted.school_name} akan diperiksa admin sebelum ditampilkan kepada publik.
          </p>
          <button
            type="button"
            onClick={() => navigate(isSchoolAccount ? "/dashboard-sekolah#pengajuan-saya" : "/kampanye")}
            className="mt-6 min-h-11 rounded-lg bg-[#17345B] px-5 text-sm font-semibold text-white hover:bg-[#244a79]"
          >
            {isSchoolAccount ? "Lihat Pengajuan Saya" : "Jelajahi Kebutuhan Sekolah"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[960px]">
        <button
          type="button"
          onClick={() => navigate(isSchoolAccount ? "/dashboard-sekolah" : -1)}
          className="mb-3 text-sm font-medium text-[#1D62B5] hover:underline"
        >
          ← Kembali
        </button>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#17345B] sm:text-[28px]">
              {isSchoolAccount ? "Ajukan Kebutuhan Sekolah" : "Ajukan Kebutuhan untuk Sekolah"}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#667085]">
              Isi data sekolah dan kebutuhan secara jelas. Admin akan memeriksa pengajuan sebelum dipublikasikan.
            </p>
          </div>
          <p className="rounded-lg border border-[#F3D3A8] bg-[#FFF8EF] px-3 py-2 text-xs text-[#80501D]">
            Pengajuan ditinjau admin sebelum tampil untuk publik.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Section number="1" title="Informasi Sekolah" description="Pilih sekolah dari data resmi. NPSN dan lokasi akan terisi otomatis.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pilih Sekolah" className="sm:col-span-2">
                {isSchoolAccount ? (
                  <input
                    value={selectedSchool ? `${selectedSchool.name} · ${selectedSchool.npsn}` : schoolSearch}
                    readOnly
                    required
                    aria-label="Sekolah terdaftar"
                    className="w-full rounded-lg border border-[#DCE2EA] bg-[#F3F5F8] px-3 py-2.5 text-sm text-[#475467]"
                  />
                ) : (
                  <div className="relative">
                    <input
                      value={schoolSearch}
                      onChange={(event) => {
                        setSchoolSearch(event.target.value);
                        setSelectedSchool(null);
                        setForm((current) => ({ ...current, school_id: "" }));
                      }}
                      onFocus={(event) => {
                        if (event.target.value) setSchoolResults((current) => current);
                      }}
                      autoComplete="off"
                      placeholder="Ketik nama sekolah atau NPSN (minimal 2 karakter)"
                      className="w-full rounded-lg border border-[#DCE2EA] bg-white px-3 py-2.5 text-sm text-[#17345B] outline-none focus:border-[#17345B] focus:ring-2 focus:ring-[#17345B]/10"
                    />
                    {(schoolSearch.trim().length >= 2 || schoolLevel || schoolProvince) && !selectedSchool && (
                      <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-[#E2E7EE] bg-white py-1 shadow-lg">
                        {searchingSchools ? (
                          <p className="px-3 py-3 text-sm text-[#667085]">Mencari data sekolah…</p>
                        ) : schoolResults.length === 0 ? (
                          <p className="px-3 py-3 text-sm text-[#667085]">Tidak ada sekolah yang cocok pada data tersedia.</p>
                        ) : (
                          schoolResults.map((school) => (
                            <button key={school.id} type="button" onClick={() => selectSchool(school)} className="block w-full px-3 py-2.5 text-left hover:bg-[#F7F8FA]">
                              <span className="block text-sm font-medium text-[#17345B]">{school.name}</span>
                              <span className="mt-0.5 block text-xs text-[#667085]">NPSN {school.npsn} · {schoolLocation(school)}{school.is_3t ? " · 3T (data resmi)" : ""}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              {!isSchoolAccount && (
                <>
                  <Field label="Filter jenjang">
                    <select value={schoolLevel} onChange={(event) => setSchoolLevel(event.target.value)} className="w-full rounded-lg border border-[#DCE2EA] bg-white px-3 py-2.5 text-sm text-[#17345B]">
                      <option value="">Semua jenjang</option>
                      {["SD", "SMP", "SMA", "SMK", "SLB", "MI", "MTs", "MA"].map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </Field>
                  <Field label="Filter provinsi">
                    <select value={schoolProvince} onChange={(event) => setSchoolProvince(event.target.value)} className="w-full rounded-lg border border-[#DCE2EA] bg-white px-3 py-2.5 text-sm text-[#17345B]">
                      <option value="">Semua provinsi</option>
                      {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
                    </select>
                  </Field>
                </>
              )}

              <Field label="NPSN resmi">
                <input readOnly value={selectedSchool?.npsn || ""} placeholder="Terisi setelah sekolah dipilih" className="w-full rounded-lg border border-[#DCE2EA] bg-[#F3F5F8] px-3 py-2.5 text-sm text-[#475467]" />
              </Field>
              <Field label="Lokasi administratif">
                <input readOnly value={selectedSchool ? schoolLocation(selectedSchool) : ""} placeholder="Terisi setelah sekolah dipilih" className="w-full rounded-lg border border-[#DCE2EA] bg-[#F3F5F8] px-3 py-2.5 text-sm text-[#475467]" />
              </Field>
            </div>
            {schoolLoadError && <p role="alert" className="mt-3 text-sm text-rose-700">{schoolLoadError}</p>}
            <p className="mt-3 rounded-lg bg-[#EFF6FF] px-3 py-2.5 text-xs leading-5 text-[#345B83]">
              Data sekolah memakai dataset lokal dari{" "}
              <a href="https://data.kemendikdasmen.go.id/data-induk" target="_blank" rel="noreferrer" className="font-semibold underline">Data Induk Kemendikdasmen</a>.
              {" "}Data ini bukan sinkronisasi real-time; tanggal pembaruan sumber belum tercatat. Admin tetap memeriksa pengajuan sebelum kebutuhan ditampilkan kepada publik.
            </p>
          </Section>

          <Section number="2" title="Informasi Kebutuhan" description="Jelaskan kebutuhan, perkiraan biaya, dan dampak untuk siswa.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori kebutuhan">
                <select required value={form.category} onChange={(event) => update("category", event.target.value)} className="form-control">
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Nama kebutuhan">
                <input required maxLength={255} value={form.title} onChange={(event) => update("title", event.target.value)} className="form-control" placeholder="Contoh: Perbaikan atap ruang kelas" />
              </Field>
              <Field label="Deskripsi kebutuhan" className="sm:col-span-2">
                <textarea required rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} className="form-control" placeholder="Jelaskan kondisi saat ini, alasan kebutuhan ini penting, dan dampaknya bagi kegiatan belajar." />
              </Field>
              <Field label="Rencana Anggaran Biaya (RAB) / perkiraan rincian" className="sm:col-span-2">
                <textarea required={!isSchoolAccount} rows={3} value={form.rab_description} onChange={(event) => update("rab_description", event.target.value)} className="form-control" placeholder="Contoh: bahan perbaikan Rp 15.000.000, upah pengerjaan Rp 5.000.000." />
              </Field>
              {!isSchoolAccount && (
                <Field label="Hubungan dengan sekolah">
                  <input required value={form.applicant_relationship} onChange={(event) => update("applicant_relationship", event.target.value)} className="form-control" placeholder="Contoh: alumni, orang tua siswa, relawan" />
                </Field>
              )}
              <Field label={isSchoolAccount ? "Tautan dokumen/foto kondisi (opsional)" : "Tautan bukti izin atau foto (wajib)"}>
                <input
                  required={!isSchoolAccount}
                  type="url"
                  maxLength={2048}
                  value={form.supporting_document}
                  onChange={(event) => update("supporting_document", event.target.value)}
                  className="form-control"
                  placeholder="https://…"
                />
                <span className="mt-1 block text-xs text-[#8893A3]">Masukkan tautan yang dapat diperiksa admin. Unggah berkas langsung belum tersedia.</span>
              </Field>
              <Field label="Tanggal mulai penggalangan">
                <input required type="date" min={today} value={form.start_date} onChange={(event) => update("start_date", event.target.value)} className="form-control" />
              </Field>
              <Field label="Batas akhir penggalangan">
                <input required type="date" min={form.start_date || today} value={form.end_date} onChange={(event) => update("end_date", event.target.value)} className="form-control" />
              </Field>
              <Field label="Target dana (Rp)">
                <input required type="number" min="1" step="1000" value={form.target_amount} onChange={(event) => update("target_amount", event.target.value)} className="form-control" placeholder="Contoh: 50000000" />
              </Field>
              <Field label="Jumlah siswa terdampak">
                <input required type="number" min="0" step="1" value={form.student_count} onChange={(event) => update("student_count", event.target.value)} className="form-control" placeholder="Contoh: 120" />
              </Field>
            </div>
          </Section>

          <Section number="3" title="Kondisi dan Prioritas" description="Nilai kondisi berdasarkan keadaan sebenarnya. Priority Score akhir dihitung sistem dan dapat diperiksa admin.">
            {selectedSchool?.is_3t && (
              <p className="mb-4 rounded-lg bg-[#EFF6FF] px-3 py-2.5 text-xs text-[#345B83]">
                Data sekolah resmi menandai lokasi ini sebagai wilayah 3T. Keterpencilan akan memperhitungkan informasi resmi tersebut.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <RangeField label="Urgensi kebutuhan" value={form.urgency} onChange={(value) => update("urgency", value)} low="Bisa ditunda" high="Sangat mendesak" />
              <RangeField label="Kondisi fasilitas" value={form.facility_condition} onChange={(value) => update("facility_condition", value)} low="Rusak berat" high="Kondisi baik" />
              <RangeField label="Keterpencilan lokasi" value={form.remoteness} onChange={(value) => update("remoteness", value)} low="Sangat mudah dijangkau" high="Sangat terpencil" />
              <RangeField label="Akses pendidikan" value={form.access_score} onChange={(value) => update("access_score", value)} low="Sangat terbatas" high="Mudah diakses" />
            </div>
            <p className="mt-4 rounded-lg bg-[#F8F9FB] px-3 py-2.5 text-xs leading-5 text-[#667085]">
              Nilai ini menggambarkan kondisi yang dilaporkan, bukan Priority Score akhir. Sistem menghitung skor dari urgensi, fasilitas, jumlah siswa, akses, dan data wilayah.
            </p>
          </Section>

          {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E6EAF0] bg-white p-4">
            <p className="text-xs text-[#667085]">Pengajuan akan diperiksa admin sebelum ditampilkan kepada publik.</p>
            <button type="submit" disabled={submitting || (isSchoolAccount && user?.account_status !== "verified")} className="min-h-11 rounded-lg bg-[#F28C28] px-5 text-sm font-semibold text-white hover:bg-[#DC7616] disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? "Mengirim pengajuan…" : "Ajukan untuk Verifikasi"}
            </button>
          </div>
        </form>
      </div>
      <style>{`.form-control{width:100%;border:1px solid #DCE2EA;border-radius:.5rem;background:#fff;padding:.625rem .75rem;font-size:.875rem;color:#17345B;outline:none}.form-control:focus{border-color:#17345B;box-shadow:0 0 0 2px rgb(23 52 91 / .1)}.form-control::placeholder{color:#98A2B3}`}</style>
    </main>
  );
}

function Section({ number, title, description, children }) {
  return (
    <section className="rounded-xl border border-[#E6EAF0] bg-white p-4 shadow-[0_2px_8px_rgba(23,52,91,0.03)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E7F0FC] text-sm font-semibold text-[#17345B]">{number}</span>
        <div>
          <h2 className="font-semibold text-[#17345B]">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-[#667085]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-[#344054]">{label}</span>
      {children}
    </label>
  );
}

function RangeField({ label, value, onChange, low, high }) {
  return (
    <label className="rounded-lg border border-[#E6EAF0] bg-white p-3">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-[#344054]">
        {label}<strong className="text-[#17345B]">{value}/5</strong>
      </span>
      <input type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#F28C28]" />
      <span className="mt-1 flex justify-between gap-2 text-[10px] text-[#8893A3]"><span>{low}</span><span>{high}</span></span>
    </label>
  );
}
