import { MasjidData } from "@/components/MasjidCard";

export const mockMasjids: MasjidData[] = [
  {
    id: "1",
    name: "Masjid Al-Ikhlas",
    location: "Shah Alam",
    state: "Selangor",
    verified: true,
    verificationCount: 3,
    totalVisits: 47,
    hasIftar: true,
    hasTerawih: true,
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
  },
  {
    id: "3",
    name: "Masjid Wilayah Persekutuan",
    location: "Kuala Lumpur",
    state: "Kuala Lumpur",
    verified: true,
    verificationCount: 3,
    totalVisits: 95,
    hasIftar: false,
    hasTerawih: true,
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
  },
  {
    id: "6",
    name: "Masjid As-Syakirin",
    location: "KLCC",
    state: "Kuala Lumpur",
    verified: false,
    verificationCount: 2,
    totalVisits: 34,
    hasIftar: false,
    hasTerawih: true,
  },
];

export interface VisitLog {
  id: string;
  masjidId: string;
  masjidName: string;
  type: "terawih" | "iftar" | "solat" | "ziarah";
  date: string;
  notes?: string;
}

export const mockVisits: VisitLog[] = [
  { id: "v1", masjidId: "1", masjidName: "Masjid Al-Ikhlas", type: "terawih", date: "2026-02-20" },
  { id: "v2", masjidId: "1", masjidName: "Masjid Al-Ikhlas", type: "iftar", date: "2026-02-20" },
  { id: "v3", masjidId: "2", masjidName: "Masjid Sultan Salahuddin", type: "terawih", date: "2026-02-19" },
  { id: "v4", masjidId: "5", masjidName: "Masjid Putra", type: "terawih", date: "2026-02-18" },
  { id: "v5", masjidId: "3", masjidName: "Masjid Wilayah", type: "terawih", date: "2026-02-17" },
  { id: "v6", masjidId: "5", masjidName: "Masjid Putra", type: "iftar", date: "2026-02-18" },
  { id: "v7", masjidId: "2", masjidName: "Masjid Sultan Salahuddin", type: "terawih", date: "2026-02-16" },
  { id: "v8", masjidId: "1", masjidName: "Masjid Al-Ikhlas", type: "terawih", date: "2026-02-15" },
];
