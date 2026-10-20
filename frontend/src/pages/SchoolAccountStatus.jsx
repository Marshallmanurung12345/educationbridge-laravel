import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const statusLabels = {
  pending_verification: "Menunggu Verifikasi",
  revision_required: "Perlu Perbaikan",
  rejected: "Ditolak",
  suspended: "Ditangguhkan",
};

export default function SchoolAccountStatus() {
  const { user, updateSchoolProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    organization_name: user.organization_name || "",
    npsn: user.npsn || "",
    phone: user.phone || "",
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const canEdit = ["pending_verification", "revision_required"].includes(
    user.account_status,
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updatedUser = await updateSchoolProfile(form);
      setForm({
        name: updatedUser.name,
        email: updatedUser.email,
        organization_name: updatedUser.organization_name,
        npsn: updatedUser.npsn,
        phone: updatedUser.phone,
      });
      setSaved(true);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-8 sm:px-6">
      <section className="mx-auto w-full max-w-[760px] rounded-xl border border-[#E6EAF0] bg-white p-5 sm:p-8">
        <h1 className="text-2xl font-semibold text-[#17345B]">Profil Sekolah</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Informasi profil dan status pemeriksaan akun sekolah Anda.
        </p>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            {statusLabels[user.account_status] || "Menunggu Verifikasi"}
          </p>
          {user.verification_note && (
            <p className="mt-1 text-sm text-amber-900">
              Catatan admin: {user.verification_note}
            </p>
          )}
        </div>

        <dl className="mt-5 grid gap-4 rounded-lg border border-[#E6EAF0] bg-[#FBFCFD] p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#667085]">Nama sekolah</dt>
            <dd className="mt-1 font-medium text-[#17345B]">{user.organization_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-[#667085]">NPSN</dt>
            <dd className="mt-1 font-medium text-[#17345B]">{user.npsn || "—"}</dd>
          </div>
          <div>
            <dt className="text-[#667085]">Kepala sekolah / perwakilan</dt>
            <dd className="mt-1 font-medium text-[#17345B]">{user.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-[#667085]">Email dan telepon</dt>
            <dd className="mt-1 font-medium text-[#17345B]">{user.email} · {user.phone || "—"}</dd>
          </div>
        </dl>

        {canEdit && (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Nama kepala sekolah / perwakilan">
              <input
                required
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className="input rounded-md"
              />
            </Field>
            <Field label="Nama sekolah">
              <input
                required
                value={form.organization_name}
                onChange={(event) =>
                  update("organization_name", event.target.value)
                }
                className="input rounded-md"
              />
            </Field>
            <Field label="NPSN">
              <input
                required
                inputMode="numeric"
                maxLength={8}
                pattern="[0-9]{8}"
                value={form.npsn}
                onChange={(event) =>
                  update("npsn", event.target.value.replace(/\D/g, ""))
                }
                className="input rounded-md"
              />
            </Field>
            <Field label="Email aktif">
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                className="input rounded-md"
              />
            </Field>
            <Field label="Nomor telepon">
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                className="input rounded-md"
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            {saved && (
              <p role="status" className="text-sm text-emerald-700">
                Perbaikan tersimpan dan dikirim untuk ditinjau admin.
              </p>
            )}
            <button
              disabled={saving}
              className="w-full rounded-md bg-[#F28C28] py-3 text-sm font-semibold text-white hover:bg-[#dc7616] disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perbaikan"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#17345B]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
