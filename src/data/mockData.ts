import { MasjidData } from "@/components/MasjidCard";

// Available quick tags for filtering
export const QUICK_TAGS = [
  { key: "mesra-oku", label: "Mesra OKU" },
  { key: "ruang-wanita", label: "Ruang Wanita" },
  { key: "parking-luas", label: "Parking Luas" },
  { key: "public-transport", label: "Dekat Transit" },
  { key: "wifi", label: "WiFi" },
  { key: "ac", label: "Aircon" },
  { key: "iftar", label: "Iftar" },
  { key: "terawih", label: "Terawih" },
  { key: "kuliah", label: "Kuliah/Ceramah" },
  { key: "tandas-bersih", label: "Tandas Bersih" },
] as const;

export const VIBE_TAGS = [
  "Imam bacaan sedap",
  "Imam bacaan laju",
  "Selesa & tenang",
  "Kipas kuat",
  "Carpet baru",
  "Suasana kampung",
  "Moden & bersih",
  "Komuniti mesra",
  "Ceramah berkualiti",
  "Makanan best",
] as const;

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  vibeTags: string[];
  photos: string[];
  date: string;
}

export interface VisitLog {
  id: string;
  masjidId: string;
  masjidName: string;
  type: "terawih" | "iftar" | "solat" | "ziarah" | "jumaat";
  date: string;
  notes?: string;
}

export const mockMasjids: MasjidData[] = [
  {
    id: "1",
    name: "Masjid Al-Ikhlas",
    location: "Taman Sri Muda, Shah Alam",
    state: "Selangor",
    verified: true,
    verificationCount: 3,
    totalVisits: 47,
    hasIftar: true,
    hasTerawih: true,
    terawihRakaat: 8,
    iftarInfo: "Iftar disediakan setiap hari. Boleh datang terus, tak perlu daftar.",
    nearPublicTransport: true,
    parkingStatus: "luas",
    hasOKUAccess: true,
    hasWomenSpace: true,
    womenSpaceInfo: "Ruang solat wanita luas di tingkat 2 dengan partition kain.",
    hasAC: true,
    hasWifi: true,
    tags: ["mesra-oku", "ruang-wanita", "parking-luas", "public-transport", "wifi", "ac", "iftar", "terawih"],
    averageRating: 4.5,
    reviews: [
      { id: "r1", userId: "u1", userName: "Ahmad", rating: 5, text: "Masjid ni memang selesa. Imam bacaan sedap, AC kuat. Parking pun senang.", vibeTags: ["Imam bacaan sedap", "Selesa & tenang"], photos: [], date: "2026-02-18" },
      { id: "r2", userId: "u2", userName: "Fatimah", rating: 4, text: "Ruang wanita agak luas tapi kadang penuh waktu Jumaat.", vibeTags: ["Moden & bersih", "Komuniti mesra"], photos: [], date: "2026-02-10" },
    ],
  },
  {
    id: "2",
    name: "Masjid Sultan Salahuddin Abdul Aziz Shah",
    location: "Shah Alam",
    state: "Selangor",
    verified: true,
    verificationCount: 3,
    totalVisits: 182,
    hasIftar: true,
    hasTerawih: true,
    terawihRakaat: 20,
    iftarInfo: "Iftar besar-besaran setiap malam Ramadan. First come first serve.",
    nearPublicTransport: true,
    parkingStatus: "luas",
    hasOKUAccess: true,
    hasWomenSpace: true,
    womenSpaceInfo: "Ruang wanita sangat luas dengan AC sendiri. Ada lift untuk akses.",
    hasAC: true,
    hasWifi: true,
    tags: ["mesra-oku", "ruang-wanita", "parking-luas", "public-transport", "wifi", "ac", "iftar", "terawih", "kuliah"],
    averageRating: 4.8,
    reviews: [
      { id: "r3", userId: "u3", userName: "Syaqi", rating: 5, text: "Masjid negeri yang terbaik. Luas, bersih, imam power. Wajib singgah!", vibeTags: ["Imam bacaan sedap", "Moden & bersih", "Selesa & tenang"], photos: [], date: "2026-02-15" },
    ],
  },
  {
    id: "3",
    name: "Masjid Wilayah Persekutuan",
    location: "Jalan Duta, Kuala Lumpur",
    state: "Kuala Lumpur",
    verified: true,
    verificationCount: 3,
    totalVisits: 95,
    hasIftar: false,
    hasTerawih: true,
    terawihRakaat: 8,
    nearPublicTransport: false,
    parkingStatus: "terhad",
    hasOKUAccess: true,
    hasWomenSpace: true,
    womenSpaceInfo: "Ruang wanita ada di bahagian belakang. Selesa tapi kecil.",
    hasAC: true,
    hasWifi: false,
    tags: ["mesra-oku", "ruang-wanita", "ac", "terawih"],
    averageRating: 4.2,
    reviews: [
      { id: "r4", userId: "u4", userName: "Zain", rating: 4, text: "Cantik sangat masjid ni. Parking je susah sikit waktu Jumaat.", vibeTags: ["Moden & bersih", "Selesa & tenang"], photos: [], date: "2026-02-12" },
    ],
  },
  {
    id: "4",
    name: "Masjid Jamek Kampung Baru",
    location: "Kampung Baru",
    state: "Kuala Lumpur",
    verified: false,
    verificationCount: 1,
    totalVisits: 12,
    hasIftar: true,
    hasTerawih: true,
    terawihRakaat: 20,
    iftarInfo: "Iftar bubur lambuk famous! Kena datang awal sebab cepat habis.",
    nearPublicTransport: true,
    parkingStatus: "tiada",
    hasOKUAccess: false,
    hasWomenSpace: true,
    womenSpaceInfo: "Ada partition kain di bahagian belakang.",
    hasAC: false,
    hasWifi: false,
    tags: ["ruang-wanita", "public-transport", "iftar", "terawih"],
    averageRating: 4.6,
    reviews: [
      { id: "r5", userId: "u5", userName: "Aminah", rating: 5, text: "Suasana kampung yang best! Bubur lambuk dia memang legend.", vibeTags: ["Suasana kampung", "Makanan best", "Komuniti mesra"], photos: [], date: "2026-01-30" },
    ],
  },
  {
    id: "5",
    name: "Masjid Putra",
    location: "Putrajaya",
    state: "Putrajaya",
    verified: true,
    verificationCount: 3,
    totalVisits: 210,
    hasIftar: true,
    hasTerawih: true,
    terawihRakaat: 8,
    iftarInfo: "Iftar disediakan waktu Ramadan. Kena daftar melalui laman web rasmi.",
    nearPublicTransport: true,
    parkingStatus: "luas",
    hasOKUAccess: true,
    hasWomenSpace: true,
    womenSpaceInfo: "Ruang solat wanita sangat luas dan selesa. Ada bilik penyusuan.",
    hasAC: true,
    hasWifi: true,
    tags: ["mesra-oku", "ruang-wanita", "parking-luas", "public-transport", "wifi", "ac", "iftar", "terawih", "tandas-bersih"],
    averageRating: 4.9,
    reviews: [
      { id: "r6", userId: "u1", userName: "Ahmad", rating: 5, text: "Iconic. Masjid paling cantik di Malaysia. Wajib ziarah sekali seumur hidup.", vibeTags: ["Moden & bersih", "Selesa & tenang"], photos: [], date: "2026-02-05" },
      { id: "r7", userId: "u3", userName: "Syaqi", rating: 5, text: "View tasik dari dalam masjid memang subhanallah.", vibeTags: ["Selesa & tenang", "Moden & bersih"], photos: [], date: "2026-01-20" },
    ],
  },
  {
    id: "6",
    name: "Masjid As-Syakirin",
    location: "KLCC, Kuala Lumpur",
    state: "Kuala Lumpur",
    verified: false,
    verificationCount: 2,
    totalVisits: 34,
    hasIftar: false,
    hasTerawih: true,
    terawihRakaat: 8,
    nearPublicTransport: true,
    parkingStatus: "terhad",
    hasOKUAccess: true,
    hasWomenSpace: true,
    womenSpaceInfo: "Ruang wanita ada di tingkat bawah. Ada lift.",
    hasAC: true,
    hasWifi: true,
    tags: ["mesra-oku", "ruang-wanita", "public-transport", "wifi", "ac", "terawih"],
    averageRating: 4.3,
    reviews: [
      { id: "r8", userId: "u2", userName: "Fatimah", rating: 4, text: "Senang sangat nak sampai kalau naik LRT. Bersih dan selesa.", vibeTags: ["Moden & bersih"], photos: [], date: "2026-02-01" },
    ],
  },
];

export const mockVisits: VisitLog[] = [
  { id: "v1", masjidId: "1", masjidName: "Masjid Al-Ikhlas", type: "terawih", date: "2026-02-20" },
  { id: "v2", masjidId: "1", masjidName: "Masjid Al-Ikhlas", type: "iftar", date: "2026-02-20" },
  { id: "v3", masjidId: "2", masjidName: "Masjid Sultan Salahuddin", type: "jumaat", date: "2026-02-19" },
  { id: "v4", masjidId: "5", masjidName: "Masjid Putra", type: "ziarah", date: "2026-02-18" },
  { id: "v5", masjidId: "3", masjidName: "Masjid Wilayah", type: "solat", date: "2026-02-17" },
  { id: "v6", masjidId: "5", masjidName: "Masjid Putra", type: "iftar", date: "2026-02-18" },
  { id: "v7", masjidId: "2", masjidName: "Masjid Sultan Salahuddin", type: "jumaat", date: "2026-02-16" },
  { id: "v8", masjidId: "1", masjidName: "Masjid Al-Ikhlas", type: "solat", date: "2026-02-15" },
  { id: "v9", masjidId: "4", masjidName: "Masjid Jamek Kampung Baru", type: "ziarah", date: "2026-02-14" },
  { id: "v10", masjidId: "6", masjidName: "Masjid As-Syakirin", type: "solat", date: "2026-02-13" },
];
