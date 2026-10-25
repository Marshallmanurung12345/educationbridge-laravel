import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import LoadingIndicator from "../components/LoadingIndicator";
import { useAuth } from "../context/AuthContext";
import { listRegions } from "../wilayahApi";

const categories = ["Fasilitas", "Buku", "Teknologi", "Beasiswa", "Laboratorium"];
const schoolLevels = ["PAUD", "SD", "SMP", "SMA", "SMK", "SLB", "MI", "MTs", "MA", "Paket A", "Paket B", "Paket C"];
const categoryTags = {
  Fasilitas: ["renovasi", "infrastruktur"],
  Buku: ["buku", "literasi"],
  Teknologi: ["teknologi", "digital"],
  Beasiswa: ["beasiswa"],
  Laboratorium: ["teknologi", "sains"],
};

const initialForm = {
  school_id: "",
  school_name: "",
  school_npsn: "",
  school_jenjang: "",
  location: "",
  category: "Fasilitas",
  title: "",
  description: "",
  rab_description: "",
  image_url: "",
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);
  const isSchoolAccount = user?.role === "sekolah";
  const hasOfficialSchool = Boolean(user?.school);
  const needsManualSchoolLocation =
    !isEditing && (!isSchoolAccount || !hasOfficialSchool);
  const lockSchoolIdentity = isEditing || (isSchoolAccount && hasOfficialSchool);
  const submissionsPath =
    user?.role === "sekolah"
      ? "/dashboard-sekolah#pengajuan-saya"
      : user?.role === "individu"
        ? "/dashboard-donatur#pengajuan-saya"
        : user?.role === "perusahaan"
          ? "/dashboard-perusahaan"
          : "/dashboard-pemerintah";
  const [form, setForm] = useState(() => {
    if (!user?.school) {
      return {
        ...initialForm,
        school_name: user?.organization_name || "",
        school_npsn: user?.npsn || "",
      };
    }
    const school = user.school;
    return {
      ...initialForm,
      school_id: school.id,
      school_name: school.name,
      school_npsn: school.npsn,
      school_jenjang: school.jenjang,
      location: schoolLocation(school),
      remoteness: school.is_3t ? 5 : 3,
    };
  });
  const [regions, setRegions] = useState({ provinces: [], regencies: [] });
  const [regionCodes, setRegionCodes] = useState({ province: "", regency: "" });
  const [regionLoading, setRegionLoading] = useState({ provinces: true, regencies: false });
  const [regionError, setRegionError] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(user?.school || null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(isEditing);

  useEffect(() => {
    if (!needsManualSchoolLocation) return undefined;

    let active = true;
    listRegions("provinces")
      .then((provinces) => {
        if (active) setRegions((current) => ({ ...current, provinces }));
      })
      .catch((loadError) => {
        if (active) setRegionError(loadError.message);
      })
      .finally(() => {
        if (active) setRegionLoading((current) => ({ ...current, provinces: false }));
      });

    return () => {
      active = false;
    };
  }, [needsManualSchoolLocation]);

  useEffect(() => {
    if (!needsManualSchoolLocation || !regionCodes.province) return undefined;

    let active = true;
    listRegions("regencies", regionCodes.province)
      .then((regencies) => {
        if (active) setRegions((current) => ({ ...current, regencies }));
      })
      .catch((loadError) => {
        if (active) setRegionError(loadError.message);
      })
      .finally(() => {
        if (active) setRegionLoading((current) => ({ ...current, regencies: false }));
      });

    return () => {
      active = false;
    };
  }, [needsManualSchoolLocation, regionCodes.province]);

  useEffect(() => {
    if (!editId) return undefined;

    let active = true;
    api.getCampaign(editId)
      .then((campaign) => {
        if (!active) return;
        const school = campaign.school || null;
        setSelectedSchool(school);
        setForm((current) => ({
          ...current,
          school_id: campaign.school_id || "",
          school_name: campaign.school_name || school?.name || "",
          school_npsn: campaign.school_npsn || school?.npsn || "",
          school_jenjang: campaign.school_jenjang || school?.jenjang || "",
          location: campaign.location || (school ? schoolLocation(school) : ""),
          category: campaign.category || current.category,
          title: campaign.title || "",
          description: campaign.description || "",
          rab_description: campaign.rab_description || "",
          image_url: campaign.image_url || "",
          supporting_document: campaign.supporting_document || "",
          applicant_relationship: campaign.applicant_relationship || "",
          start_date: campaign.start_date || "",
          end_date: campaign.end_date || "",
          target_amount: campaign.target_amount ?? "",
          student_count: campaign.student_count ?? "",
          urgency: campaign.urgency ?? current.urgency,
          facility_condition: campaign.facility_condition ?? current.facility_condition,
          remoteness: campaign.remoteness ?? current.remoteness,
          access_score: campaign.access_score ?? current.access_score,
        }));
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoadingEdit(false);
      });

    return () => {
      active = false;
    };
  }, [editId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    const province = regions.provinces.find((region) => region.code === regionCodes.province);
    const regency = regions.regencies.find((region) => region.code === regionCodes.regency);
    if (needsManualSchoolLocation && (!province || !regency)) {
      setError("Pilih provinsi dan kabupaten/kota dari daftar.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        school_id: isSchoolAccount || isEditing ? form.school_id || null : null,
        location: needsManualSchoolLocation
          ? `${regency.name}, ${province.name}`
          : form.location,
        tags: [form.category.toLowerCase(), ...(categoryTags[form.category] || [])],
        target_amount: Number(form.target_amount),
        student_count: Number(form.student_count),
        urgency: Number(form.urgency),
        facility_condition: Number(form.facility_condition),
        remoteness: Number(form.remoteness),
        access_score: Number(form.access_score),
      };
      const result = isEditing
        ? await api.updateCampaign(editId, payload)
        : await api.createCampaign(payload);
      setSubmitted(result);
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
          <h1 className="page-title mt-4 text-[#17345B]">
            {isEditing ? "Perubahan pengajuan tersimpan" : "Pengajuan berhasil dikirim"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {isEditing ? (
              <>Perubahan untuk <strong className="text-[#17345B]">{submitted.title}</strong> sudah tersimpan. Pengajuan tetap akan diperiksa admin sebelum ditampilkan kepada publik.</>
            ) : (
              <>Kebutuhan <strong className="text-[#17345B]">{submitted.title}</strong> untuk {submitted.school_name} akan diperiksa admin sebelum ditampilkan kepada publik.</>
            )}
          </p>
          <button
            type="button"
            onClick={() => navigate(submissionsPath)}
            className="mt-6 min-h-11 rounded-lg bg-[#17345B] px-5 text-sm font-semibold text-white hover:bg-[#244a79]"
          >
            {isSchoolAccount ? "Lihat Pengajuan Saya" : "Kembali ke Dashboard"}
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
            <h1 className="page-title text-[#17345B]">
              {isEditing ? "Perbarui Pengajuan Kebutuhan" : isSchoolAccount ? "Ajukan Kebutuhan Sekolah" : "Ajukan Kebutuhan untuk Sekolah"}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#667085]">
              Isi data sekolah dan kebutuhan secara jelas. Admin akan memeriksa pengajuan sebelum dipublikasikan.
            </p>
          </div>
          <p className="rounded-lg border border-[#F3D3A8] bg-[#FFF8EF] px-3 py-2 text-xs text-[#80501D]">
            Pengajuan ditinjau admin sebelum tampil untuk publik.
          </p>
        </div>

        {loadingEdit ? (
          <LoadingIndicator label="Memuat pengajuan…" className="min-h-24 rounded-xl border border-[#E6EAF0] bg-white p-6" />
        ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Section
            number="1"
            title="Informasi Sekolah"
            description={isEditing
              ? "Periksa kembali identitas dan lokasi sekolah pada pengajuan."
              : isSchoolAccount
                ? hasOfficialSchool
                  ? "Periksa kembali identitas dan lokasi sekolah pada pengajuan."
                  : "Identitas sekolah mengikuti data akun terverifikasi. Pilih jenjang dan lokasi sekolah."
                : "Isi identitas sekolah; pilih provinsi dan kabupaten/kota dari daftar."}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama sekolah" className="sm:col-span-2">
                <input
                  required
                  maxLength={255}
                  readOnly={lockSchoolIdentity}
                  value={form.school_name}
                  onChange={(event) => update("school_name", event.target.value)}
                  className={`form-control ${lockSchoolIdentity ? "bg-[#F3F5F8]" : ""}`}
                  placeholder="Masukkan nama resmi sekolah"
                />
              </Field>
              <Field label="NPSN">
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  minLength={8}
                  maxLength={8}
                  readOnly={lockSchoolIdentity}
                  value={form.school_npsn}
                  onChange={(event) => update("school_npsn", event.target.value.replace(/\D/g, "").slice(0, 8))}
                  className={`form-control ${lockSchoolIdentity ? "bg-[#F3F5F8]" : ""}`}
                  placeholder="8 digit NPSN"
                  title="NPSN terdiri dari 8 angka."
                />
                <span className="mt-1 block text-xs text-[#8893A3]">Masukkan NPSN sekolah yang sebenarnya. Admin akan memeriksanya.</span>
              </Field>
              <Field label="Jenjang pendidikan">
                <select
                  required
                  value={form.school_jenjang}
                  disabled={lockSchoolIdentity}
                  onChange={(event) => update("school_jenjang", event.target.value)}
                  className="form-control disabled:bg-[#F3F5F8]"
                >
                  <option value="">Pilih jenjang</option>
                  {schoolLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </Field>

              {!needsManualSchoolLocation ? (
                <Field label="Lokasi administratif" className="sm:col-span-2">
                  <input readOnly value={form.location} className="form-control bg-[#F3F5F8]" />
                </Field>
              ) : (
                <>
                  <Field label="Provinsi">
                    <select
                      required
                      value={regionCodes.province}
                      onChange={(event) => {
                        const provinceCode = event.target.value;
                        setRegionCodes({ province: provinceCode, regency: "" });
                        setRegions((current) => ({ ...current, regencies: [] }));
                        setRegionLoading((current) => ({ ...current, regencies: Boolean(provinceCode) }));
                        setRegionError("");
                      }}
                      className="form-control"
                    >
                      <option value="">{regionLoading.provinces ? "Memuat provinsi..." : "Pilih provinsi"}</option>
                      {regions.provinces.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Kabupaten/kota">
                    <select
                      required
                      value={regionCodes.regency}
                      disabled={!regionCodes.province || regionLoading.regencies}
                      onChange={(event) => setRegionCodes((current) => ({ ...current, regency: event.target.value }))}
                      className="form-control disabled:bg-[#F3F5F8]"
                    >
                      <option value="">{regionLoading.regencies ? "Memuat kabupaten/kota..." : "Pilih kabupaten/kota"}</option>
                      {regions.regencies.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}
                    </select>
                  </Field>
                </>
              )}
            </div>
            {regionError && <p role="alert" className="mt-3 text-sm text-rose-700">{regionError}</p>}
            <p className="mt-3 rounded-lg bg-[#EFF6FF] px-3 py-2.5 text-xs leading-5 text-[#345B83]">
              Nama sekolah dan NPSN tidak harus tersedia di direktori lokal. Pengaju memilih lokasi dari layanan data wilayah; admin tetap memeriksa identitas dan bukti kewenangan sebelum kampanye dipublikasikan.
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
              <Field label="Tautan foto kondisi atau kebutuhan (opsional)">
                <input
                  type="url"
                  maxLength={2048}
                  value={form.image_url}
                  onChange={(event) => update("image_url", event.target.value)}
                  className="form-control"
                  placeholder="https://…"
                />
                <span className="mt-1 block text-xs text-[#8893A3]">Gunakan tautan foto dokumentasi yang dapat diakses admin. Unggah berkas langsung belum tersedia.</span>
              </Field>
              <Field label="Tanggal mulai penggalangan">
                <input required type="date" min={isEditing ? undefined : today} value={form.start_date} onChange={(event) => update("start_date", event.target.value)} className="form-control" />
              </Field>
              <Field label="Batas akhir penggalangan">
                <input required type="date" min={form.start_date || (isEditing ? undefined : today)} value={form.end_date} onChange={(event) => update("end_date", event.target.value)} className="form-control" />
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
              <RangeField label="Keterpencilan lokasi" value={form.remoteness} onChange={(value) => update("remoteness", value)} low="Sangat mudah dijangkau" high="Sangat terpencil" disabled={Boolean(selectedSchool?.is_3t)} />
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
              {submitting ? "Menyimpan…" : isEditing ? "Simpan Perubahan" : "Ajukan untuk Verifikasi"}
            </button>
          </div>
        </form>
        )}
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

function RangeField({ label, value, onChange, low, high, disabled = false }) {
  return (
    <label className="rounded-lg border border-[#E6EAF0] bg-white p-3">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-[#344054]">
        {label}<strong className="text-[#17345B]">{value}/5</strong>
      </span>
      <input type="range" min="1" max="5" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#F28C28] disabled:cursor-not-allowed disabled:opacity-60" />
      <span className="mt-1 flex justify-between gap-2 text-[10px] text-[#8893A3]"><span>{low}</span><span>{high}</span></span>
    </label>
  );
}
