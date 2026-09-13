import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const categoryTags = {
  Fasilitas: ["renovasi", "infrastruktur"],
  Buku: ["buku", "literasi"],
  Teknologi: ["teknologi", "digital"],
  Beasiswa: ["beasiswa"],
  Laboratorium: ["teknologi", "sains"],
};

const initialForm = {
  school_id: "",
  npsn: "",
  school_name: "",
  location: "",
  category: "Fasilitas",
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  target_amount: "",
  student_count: "",
  urgency: 3,
  facility_condition: 3,
  remoteness: 3,
  access_score: 3,
};

export default function CreateCampaign() {
  const { user } = useAuth();
  const [schoolsList, setSchoolsList] = useState([]);
  const [form, setForm] = useState({
    ...initialForm,
    school_name: user?.organization_name || "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listSchools()
      .then((data) => {
        if (Array.isArray(data)) {
          setSchoolsList(data);
          if (data.length > 0 && !form.school_id) {
            const first = data[0];
            setForm((f) => ({
              ...f,
              school_id: first.id,
              npsn: first.npsn,
              school_name: first.name,
              location: `${first.kecamatan}, ${first.kabupaten_kota}, ${first.provinsi}`,
              student_count: first.jumlah_siswa || f.student_count,
              remoteness: first.is_3t ? 5 : 3,
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  function handleSchoolSelect(schoolId) {
    const selected = schoolsList.find((s) => String(s.id) === String(schoolId));
    if (selected) {
      setForm((f) => ({
        ...f,
        school_id: selected.id,
        npsn: selected.npsn,
        school_name: selected.name,
        location: `${selected.kecamatan}, ${selected.kabupaten_kota}, ${selected.provinsi}`,
        student_count: selected.jumlah_siswa || f.student_count,
        remoteness: selected.is_3t ? 5 : 3,
      }));
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const created = await api.createCampaign({
        ...form,
        tags: [
          form.category.toLowerCase(),
          ...(categoryTags[form.category] || []),
        ],
        target_amount: Number(form.target_amount),
        student_count: Number(form.student_count),
        urgency: Number(form.urgency),
        facility_condition: Number(form.facility_condition),
        remoteness: Number(form.remoteness),
        access_score: Number(form.access_score),
      });
      setSubmitted(created);
    } catch (err) {
      setError(err.message);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        <h1 className="font-display text-3xl">Pengajuan terkirim</h1>
        <p className="text-ink-light mt-3">
          Terima kasih. Campaign <strong>{submitted.title}</strong> akan
          ditinjau tim EducationBridge sebelum ditayangkan ke publik. Skor
          prioritas sementara: <strong>{submitted.priority_score}/100</strong>.
        </p>
        <button
          onClick={() => navigate("/admin")}
          className="mt-6 bg-navy text-paper px-5 py-2.5"
        >
          Lihat status di Panel Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl">Ajukan Kebutuhan Sekolah</h1>
      <p className="text-ink-light mt-2 prose-measure">
        Isi formulir berikut untuk mengajukan kebutuhan bantuan. Tim kami akan
        memverifikasi sebelum campaign tayang.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 mb-4">
          <p className="font-bold">
            Verifikasi Identitas Sekolah Kemendikdasmen:
          </p>
          <p className="mt-1">
            Pilih nama sekolah Anda yang terdaftar pada Data Induk Pendidikan
            Kemendikdasmen. Data lokasi, NPSN, dan indikator 3T akan diambil
            secara otomatis dari database resmi.
          </p>
        </div>

        <Field label="Pilih Sekolah Terdaftar (Data Induk Kemendikdasmen)">
          <select
            value={form.school_id}
            onChange={(e) => handleSchoolSelect(e.target.value)}
            className="input font-semibold text-[#17365d]"
          >
            {schoolsList.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.npsn}] {s.name} - {s.kabupaten_kota}, {s.provinsi}{" "}
                {s.is_3t ? "(3T)" : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="NPSN Official (Otomatis)">
            <input
              readOnly
              value={form.npsn || "Data belum tersedia"}
              className="input bg-slate-100 font-mono font-bold"
            />
          </Field>
          <Field label="Lokasi Administrasi Official">
            <input
              readOnly
              value={form.location || "Data belum tersedia"}
              className="input bg-slate-100"
            />
          </Field>
        </div>

        <Field label="Kategori kebutuhan">
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="input"
          >
            {Object.keys(categoryTags).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Judul campaign">
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="input"
            placeholder="Contoh: Perbaikan Atap Kelas yang Bocor"
          />
        </Field>

        <Field label="Deskripsi kebutuhan">
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tanggal mulai penggalangan">
            <input
              required
              type="date"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Batas akhir penggalangan">
            <input
              required
              type="date"
              min={form.start_date || undefined}
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Target dana (Rp)">
            <input
              required
              type="number"
              min="0"
              value={form.target_amount}
              onChange={(e) => update("target_amount", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Jumlah siswa terdampak">
            <input
              required
              type="number"
              min="0"
              value={form.student_count}
              onChange={(e) => update("student_count", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <RangeField
            label="Urgensi"
            value={form.urgency}
            onChange={(v) => update("urgency", v)}
            hint="1 = bisa ditunda, 5 = darurat"
          />
          <RangeField
            label="Kondisi fasilitas"
            value={form.facility_condition}
            onChange={(v) => update("facility_condition", v)}
            hint="1 = rusak berat, 5 = baik"
          />
          <RangeField
            label="Keterpencilan lokasi"
            value={form.remoteness}
            onChange={(v) => update("remoteness", v)}
            hint="1 = perkotaan, 5 = 3T"
          />
          <RangeField
            label="Akses pendidikan"
            value={form.access_score}
            onChange={(v) => update("access_score", v)}
            hint="1 = sangat terbatas, 5 = mudah"
          />
        </div>

        {error && <p className="text-clay text-sm">{error}</p>}

        <button className="bg-navy text-paper px-6 py-3 hover:bg-navy-light transition-colors">
          Kirim untuk verifikasi
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm text-ink-light">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function RangeField({ label, value, onChange, hint }) {
  return (
    <label className="block">
      <span className="text-sm text-ink-light">
        {label}: <strong className="text-ink">{value}</strong>
      </span>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2"
      />
      <span className="text-xs text-ink-light">{hint}</span>
    </label>
  );
}
