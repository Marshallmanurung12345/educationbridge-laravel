import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import CampaignRow from "../components/CampaignRow";
import childrenImage from "../assets/children.jpg";
import { listRegions } from "../wilayahApi";

const categories = [
  "Fasilitas",
  "Buku & Literasi",
  "Teknologi",
  "Beasiswa",
  "Laboratorium",
  "Lainnya",
];
const categoryAliases = {
  "Buku & Literasi": ["buku", "buku & literasi", "literasi"],
};
const sortOptions = ["priority", "newest", "urgency", "recommended", "progress"];
const regionLevels = [
  { key: "provinces", level: "provinces", label: "Provinsi", placeholder: "Pilih Provinsi" },
  { key: "regencies", level: "regencies", label: "Kabupaten/Kota", placeholder: "Pilih Kabupaten/Kota" },
  { key: "districts", level: "districts", label: "Kecamatan", placeholder: "Pilih Kecamatan" },
  { key: "villages", level: "villages", label: "Desa/Kelurahan", placeholder: "Pilih Desa/Kelurahan" },
];
const emptyRegionCodes = {
  provinces: "",
  regencies: "",
  districts: "",
  villages: "",
};

function normalizeRegionName(value) {
  return (value || "")
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(
      /^(kabupaten administrasi|kabupaten|kab\.?|kota administrasi|kota|kecamatan|kec\.?|distrik|desa|kelurahan)\s+/u,
      "",
    )
    .replace(/[^a-z0-9]/g, "");
}

function matchesCategory(campaign, selectedCategory) {
  const actualCategory = (campaign.category || "").toLocaleLowerCase("id-ID");
  if (selectedCategory === "Lainnya") {
    return !categories
      .filter((item) => item !== "Lainnya")
      .flatMap((item) => categoryAliases[item] || [item.toLocaleLowerCase("id-ID")])
      .includes(actualCategory);
  }

  const aliases = categoryAliases[selectedCategory] || [
    selectedCategory.toLocaleLowerCase("id-ID"),
  ];
  return aliases.includes(actualCategory);
}

function RegionSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  loading,
  error,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#34465d]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="min-h-10 w-full rounded-lg border border-[#d8e0e8] bg-white px-3 text-sm text-[#34465d] focus:border-[#17345B] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f2f4f7] disabled:text-[#98a2b3]"
      >
        <option value="">{loading ? "Memuat wilayah..." : placeholder}</option>
        {options.map((region) => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-rose-700">{error}</span>}
    </label>
  );
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sort, setSort] = useState(() => {
    const requestedSort = new URLSearchParams(window.location.search).get("sort");
    return sortOptions.includes(requestedSort) ? requestedSort : "priority";
  });
  const [search, setSearch] = useState("");
  const [onlyThreeT, setOnlyThreeT] = useState(false);
  const [regionCodes, setRegionCodes] = useState(emptyRegionCodes);
  const [regions, setRegions] = useState({
    provinces: [],
    regencies: [],
    districts: [],
    villages: [],
  });
  const [regionLoading, setRegionLoading] = useState({
    provinces: true,
    regencies: false,
    districts: false,
    villages: false,
  });
  const [regionErrors, setRegionErrors] = useState({});
  const [regionReloadKey, setRegionReloadKey] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setRegionLoading((current) => ({ ...current, provinces: true }));
    setRegionErrors((current) => ({ ...current, provinces: "" }));
    listRegions("provinces")
      .then((result) => {
        if (active) setRegions((current) => ({ ...current, provinces: result }));
      })
      .catch((loadError) => {
        if (active) {
          setRegionErrors((current) => ({ ...current, provinces: loadError.message }));
        }
      })
      .finally(() => {
        if (active) setRegionLoading((current) => ({ ...current, provinces: false }));
      });

    return () => {
      active = false;
    };
  }, [regionReloadKey]);

  useEffect(() => {
    let active = true;
    if (!regionCodes.provinces) {
      setRegions((current) => ({ ...current, regencies: [] }));
      setRegionLoading((current) => ({ ...current, regencies: false }));
      setRegionErrors((current) => ({ ...current, regencies: "" }));
      return () => {
        active = false;
      };
    }

    setRegionLoading((current) => ({ ...current, regencies: true }));
    setRegionErrors((current) => ({ ...current, regencies: "" }));
    listRegions("regencies", regionCodes.provinces)
      .then((result) => {
        if (active) setRegions((current) => ({ ...current, regencies: result }));
      })
      .catch((loadError) => {
        if (active) {
          setRegionErrors((current) => ({ ...current, regencies: loadError.message }));
        }
      })
      .finally(() => {
        if (active) setRegionLoading((current) => ({ ...current, regencies: false }));
      });

    return () => {
      active = false;
    };
  }, [regionCodes.provinces, regionReloadKey]);

  useEffect(() => {
    let active = true;
    if (!regionCodes.regencies) {
      setRegions((current) => ({ ...current, districts: [] }));
      setRegionLoading((current) => ({ ...current, districts: false }));
      setRegionErrors((current) => ({ ...current, districts: "" }));
      return () => {
        active = false;
      };
    }

    setRegionLoading((current) => ({ ...current, districts: true }));
    setRegionErrors((current) => ({ ...current, districts: "" }));
    listRegions("districts", regionCodes.regencies)
      .then((result) => {
        if (active) setRegions((current) => ({ ...current, districts: result }));
      })
      .catch((loadError) => {
        if (active) {
          setRegionErrors((current) => ({ ...current, districts: loadError.message }));
        }
      })
      .finally(() => {
        if (active) setRegionLoading((current) => ({ ...current, districts: false }));
      });

    return () => {
      active = false;
    };
  }, [regionCodes.regencies, regionReloadKey]);

  useEffect(() => {
    let active = true;
    if (!regionCodes.districts) {
      setRegions((current) => ({ ...current, villages: [] }));
      setRegionLoading((current) => ({ ...current, villages: false }));
      setRegionErrors((current) => ({ ...current, villages: "" }));
      return () => {
        active = false;
      };
    }

    setRegionLoading((current) => ({ ...current, villages: true }));
    setRegionErrors((current) => ({ ...current, villages: "" }));
    listRegions("villages", regionCodes.districts)
      .then((result) => {
        if (active) setRegions((current) => ({ ...current, villages: result }));
      })
      .catch((loadError) => {
        if (active) {
          setRegionErrors((current) => ({ ...current, villages: loadError.message }));
        }
      })
      .finally(() => {
        if (active) setRegionLoading((current) => ({ ...current, villages: false }));
      });

    return () => {
      active = false;
    };
  }, [regionCodes.districts, regionReloadKey]);

  useEffect(() => {
    let active = true;
    api
      .stats()
      .then((result) => {
        if (active) {
          setStats(result);
          setStatsError("");
        }
      })
      .catch((statsLoadError) => {
        if (active) setStatsError(statsLoadError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const query = search.trim();
    const request =
      sort === "recommended"
        ? api.match(["3t"])
        : api.listCampaigns({
            status: "verified",
            sort: sort === "urgency" ? "priority" : sort,
            ...(query && { q: query }),
          });

    request
      .then((result) => {
        if (!active) return;
        let rows = Array.isArray(result) ? result : [];
        if (sort === "recommended" && query) {
          const normalizedQuery = query.toLocaleLowerCase("id-ID");
          rows = rows.filter((campaign) =>
            [
              campaign.title,
              campaign.school?.name,
              campaign.school_name,
              campaign.location,
              campaign.category,
            ]
              .filter(Boolean)
              .some((value) => value.toLocaleLowerCase("id-ID").includes(normalizedQuery)),
          );
        }
        if (sort === "urgency") {
          rows = [...rows].sort(
            (first, second) =>
              Number(second.urgency || 0) - Number(first.urgency || 0) ||
              Number(second.priority_score || 0) - Number(first.priority_score || 0),
          );
        }
        setCampaigns(rows);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, sort, reloadKey]);

  const selectedRegionNames = {
    provinces:
      regions.provinces.find((region) => region.code === regionCodes.provinces)?.name || "",
    regencies:
      regions.regencies.find((region) => region.code === regionCodes.regencies)?.name || "",
    districts:
      regions.districts.find((region) => region.code === regionCodes.districts)?.name || "",
    villages:
      regions.villages.find((region) => region.code === regionCodes.villages)?.name || "",
  };

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.some((item) => matchesCategory(campaign, item))
        ) {
          return false;
        }
        if (onlyThreeT && campaign.school?.is_3t !== true) return false;

        const school = campaign.school || {};
        const campaignRegions = [
          ["provinces", school.provinsi],
          ["regencies", school.kabupaten_kota],
          ["districts", school.kecamatan],
          ["villages", school.desa_kelurahan || school.desa || school.kelurahan],
        ];
        if (
          campaignRegions.some(
            ([level, schoolRegion]) =>
              selectedRegionNames[level] &&
              normalizeRegionName(schoolRegion) !==
                normalizeRegionName(selectedRegionNames[level]),
          )
        ) {
          return false;
        }

        return true;
      }),
    [campaigns, onlyThreeT, selectedCategories, selectedRegionNames],
  );

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((item) => [
          item,
          campaigns.filter((campaign) => matchesCategory(campaign, item)).length,
        ]),
      ),
    [campaigns],
  );

  function updateRegion(level, value) {
    const levelIndex = regionLevels.findIndex((item) => item.key === level);
    const nextCodes = { ...regionCodes, [level]: value };
    regionLevels.slice(levelIndex + 1).forEach(({ key }) => {
      nextCodes[key] = "";
    });
    setRegionCodes(nextCodes);
  }

  function toggleCategory(value) {
    setSelectedCategories((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function resetFilters() {
    setSelectedCategories([]);
    setRegionCodes(emptyRegionCodes);
    setOnlyThreeT(false);
    setSearch("");
    setSort("priority");
  }

  return (
    <main className="min-h-screen min-w-0 bg-[#f5f7fa] text-[#344054]">
      <section
        className="relative overflow-hidden bg-[#eaf2f8]"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(245,249,252,0.98) 0%, rgba(245,249,252,0.94) 42%, rgba(245,249,252,0.45) 72%, rgba(245,249,252,0.2) 100%), url(${childrenImage})`,
          backgroundPosition: "center, right 35%",
          backgroundSize: "cover, auto 150%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-11">
          <div className="max-w-[680px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a6b1c]">
              Pendidikan untuk semua
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-[#17345B] sm:text-4xl">
              Jelajahi Kebutuhan Sekolah
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748b] sm:text-base">
              Temukan kebutuhan sekolah terverifikasi berdasarkan lokasi, kategori,
              dan tingkat prioritas.
            </p>
            <label className="mt-5 flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#d5dce4] bg-white p-1.5 pl-4 shadow-sm sm:max-w-[610px]">
              <span aria-hidden="true" className="text-lg text-[#64748b]">⌕</span>
              <span className="sr-only">Cari kebutuhan, nama sekolah, atau lokasi</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kebutuhan, sekolah, atau lokasi..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#344054] placeholder:text-[#98a2b3] focus:outline-none"
              />
              <Link
                to="/ajukan"
                className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg bg-[#F28C28] px-4 text-xs font-semibold text-white hover:bg-[#DB7415]"
              >
                Ajukan
              </Link>
            </label>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter kategori kebutuhan"
            >
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                aria-pressed={selectedCategories.length === 0}
                className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategories.length === 0
                    ? "border-[#0e4e75] bg-[#0e4e75] text-white"
                    : "border-white bg-white/90 text-[#52606d] hover:border-[#17345B]"
                }`}
              >
                Semua
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCategory(item)}
                  aria-pressed={selectedCategories.includes(item)}
                  className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategories.includes(item)
                      ? "border-[#0e4e75] bg-[#edf4fb] text-[#17345B]"
                      : "border-white bg-white/90 text-[#52606d] hover:border-[#17345B]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid max-w-[690px] grid-cols-1 gap-2 rounded-xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:grid-cols-3">
            <div className="rounded-lg bg-[#f1f6fa] px-4 py-3">
              <p className="text-xs text-[#64748b]">Kebutuhan Terverifikasi</p>
              <p className="mt-1 text-lg font-bold text-[#17345B]">
                {stats ? Number(stats.verifiedCampaigns || 0).toLocaleString("id-ID") : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-[#eff8f3] px-4 py-3">
              <p className="text-xs text-[#64748b]">Total Donasi Terkumpul</p>
              <p className="mt-1 text-lg font-bold text-[#146b50]">
                {stats ? formatRupiah(stats.totalRaised) : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-[#fff5e9] px-4 py-3">
              <p className="text-xs text-[#64748b]">Siswa Terbantu</p>
              <p className="mt-1 text-lg font-bold text-[#a75a0a]">
                {stats ? Number(stats.totalStudents || 0).toLocaleString("id-ID") : "—"}
              </p>
            </div>
          </div>
          {statsError && (
            <p className="mt-2 text-xs text-rose-700" role="status">
              Statistik belum dapat dimuat: {statsError}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#17345B]">
              Filter Pencarian
            </h2>
            <span aria-hidden="true" className="text-lg text-[#17345B]">☷</span>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-[#34465d]">
              Urutkan berdasarkan
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="min-h-10 w-full rounded-lg border border-[#d8e0e8] bg-white px-3 text-sm text-[#34465d] focus:border-[#17345B] focus:outline-none"
            >
              <option value="priority">Priority Score (Tertinggi)</option>
              <option value="newest">Kebutuhan Terbaru</option>
              <option value="urgency">Urgensi</option>
              <option value="recommended">Direkomendasikan</option>
              <option value="progress">Progress Dana</option>
            </select>
          </label>

          <section className="mt-5 border-t border-[#edf0f4] pt-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#34465d]">
              Wilayah
            </h3>
            <div className="space-y-3">
              {regionLevels.map(({ key, label, placeholder }, index) => (
                <RegionSelect
                  key={key}
                  label={label}
                  placeholder={placeholder}
                  options={regions[key]}
                  value={regionCodes[key]}
                  onChange={(value) => updateRegion(key, value)}
                  loading={regionLoading[key]}
                  error={regionErrors[key]}
                  disabled={
                    regionLoading[key] ||
                    (index > 0 && !regionCodes[regionLevels[index - 1].key])
                  }
                />
              ))}
            </div>
            {Object.values(regionErrors).some(Boolean) && (
              <button
                type="button"
                onClick={() => setRegionReloadKey((key) => key + 1)}
                className="mt-2 text-xs font-semibold text-[#1b6a93] underline underline-offset-2"
              >
                Muat ulang data wilayah
              </button>
            )}
            <p className="mt-3 text-[11px] leading-5 text-[#718096]">
              Sumber:{" "}
              <a
                href="https://wilayah.id/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#1b6a93] underline underline-offset-2"
              >
                Wilayah.id
              </a>
              {" "}berdasarkan data Kemendagri, diperbarui 4 Juli 2025.
            </p>
          </section>

          <section className="mt-5 border-t border-[#edf0f4] pt-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#34465d]">
              Kategori Kebutuhan
            </h3>
            <div className="space-y-2.5">
              {categories.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2 text-xs text-[#52606d]"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(item)}
                    onChange={() => toggleCategory(item)}
                    className="h-4 w-4 rounded border-[#cbd5e1] accent-[#17345B]"
                  />
                  <span className="flex-1">{item}</span>
                  <span className="text-[11px] text-[#98a2b3]">
                    {categoryCounts[item] || 0}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <label className="mt-5 flex cursor-pointer items-center gap-2 border-t border-[#edf0f4] pt-4 text-xs font-medium text-[#52606d]">
            <input
              type="checkbox"
              checked={onlyThreeT}
              onChange={(event) => setOnlyThreeT(event.target.checked)}
              className="h-4 w-4 rounded border-[#cbd5e1] accent-[#17345B]"
            />
            Wilayah 3T
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 min-h-10 w-full rounded-lg bg-[#edf3f9] px-3 text-xs font-semibold text-[#17345B] hover:bg-[#e1eaf3]"
          >
            Reset Filter
          </button>
        </aside>

        <section className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-[#64748b]" aria-live="polite">
              {loading
                ? "Memuat kebutuhan sekolah..."
                : `Menampilkan ${filteredCampaigns.length} dari ${stats?.verifiedCampaigns ?? campaigns.length} kebutuhan sekolah`}
            </p>
            <Link
              to="/ajukan"
              className="text-xs font-semibold text-[#1b6a93] hover:underline"
            >
              Ajukan kebutuhan sekolah →
            </Link>
          </div>

          {sort === "recommended" && (
            <p className="mb-3 rounded-lg border border-[#dce9f4] bg-[#f0f7fc] px-3 py-2 text-xs text-[#52606d]">
              Direkomendasikan berdasarkan fokus wilayah 3T dan Priority Score.
            </p>
          )}

          {loading && (
            <p className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-8 text-sm text-[#64748b]" role="status">
              Memuat kebutuhan sekolah…
            </p>
          )}
          {!loading && error && (
            <div className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-8" role="alert">
              <p className="text-sm text-rose-700">
                Kebutuhan sekolah tidak dapat dimuat: {error}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-3 rounded-lg border border-[#cbd3dc] bg-white px-3 py-2 text-sm font-semibold text-[#17365d]"
              >
                Coba lagi
              </button>
            </div>
          )}
          {!loading && !error && filteredCampaigns.length === 0 && (
            <p className="rounded-xl border border-[#e2e8f0] bg-white px-5 py-8 text-sm text-[#64748b]" role="status">
              {search || selectedCategories.length || onlyThreeT || Object.values(regionCodes).some(Boolean)
                ? "Tidak ada kebutuhan yang cocok dengan pencarian dan filter ini."
                : "Data kebutuhan sekolah belum tersedia."}
            </p>
          )}
          {!loading &&
            !error &&
            filteredCampaigns.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
        </section>
      </div>
    </main>
  );
}
