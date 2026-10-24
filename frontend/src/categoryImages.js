import fasilitas from "./assets/categories/fasilitas.png";
import buku from "./assets/categories/buku.png";
import teknologi from "./assets/categories/teknologi.png";
import beasiswa from "./assets/categories/beasiswa.png";
import laboratorium from "./assets/categories/laboratorium.png";
import sanitasi from "./assets/categories/sanitasi.png";

import atapBocor from "./assets/atap-bocor.jpg";

const rules = [
  [/atap|lantai|bocor|plafon/i, atapBocor],
  [/buku|literasi|perpustakaan/i, buku],
  [/teknologi|komputer|laptop|internet|digital/i, teknologi],
  [/beasiswa|scholar/i, beasiswa],
  [/lab/i, laboratorium],
  [/sanitasi|air|toilet|wc/i, sanitasi],
  [/fasilitas|infrastruktur|bangunan|ruang/i, fasilitas],
];

export function getCategoryImage(category = "", title = "") {
  const text = `${category} ${title}`;
  for (const [pattern, image] of rules) {
    if (pattern.test(text)) return image;
  }
  return fasilitas;
}
