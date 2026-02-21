import { Moon, Calendar, MapPin, TrendingUp, Trophy, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockVisits, mockMasjids } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";

const STATES = [
  "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Melaka", "Negeri Sembilan",
  "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak",
  "Selangor", "Terengganu",
];

const TrackingDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;

  const totalVisits = mockVisits.length;
  const uniqueMasjids = new Set(mockVisits.map((v) => v.masjidId)).size;
  const visitedStates = new Set(
    mockVisits.map((v) => mockMasjids.find((m) => m.id === v.masjidId)?.state).filter(Boolean)
  );

  // Group visits by type
  const typeCounts: Record<string, number> = {};
  mockVisits.forEach((v) => { typeCounts[v.type] = (typeCounts[v.type] || 0) + 1; });

  // 30-day activity
  const today = new Date("2026-02-21");
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasVisit = mockVisits.some((v) => v.date === dateStr);
    return { date: d, dateStr, hasVisit };
  });

  const typeLabel: Record<string, string> = {
    terawih: "Terawih",
    iftar: "Iftar",
    solat: "Solat",
    jumaat: "Jumaat",
    ziarah: "Ziarah",
  };

  // Passport badges
  const badges = [
    { name: "Pengembara", desc: "Lawat 5 masjid berbeza", unlocked: uniqueMasjids >= 5 },
    { name: "Jelajah Negeri", desc: `Lawat masjid di 3 negeri (${visitedStates.size}/3)`, unlocked: visitedStates.size >= 3 },
    { name: "Setia", desc: `10 kunjungan (${totalVisits}/10)`, unlocked: totalVisits >= 10 },
    { name: "Reviewer", desc: "Tulis 3 review", unlocked: false },
    { name: "Pengesah", desc: "Sahkan 5 masjid", unlocked: false },
    { name: "Perintis", desc: "Tambah masjid pertama anda", unlocked: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Jejak Saya
          </h1>
          <p className="mt-2 text-muted-foreground">
            Semua masjid yang anda dah kunjungi — passport masjid peribadi anda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Jumlah Kunjungan", value: totalVisits, icon: TrendingUp, color: "text-primary" },
            { label: "Masjid Dikunjungi", value: uniqueMasjids, icon: MapPin, color: "text-accent" },
            { label: "Negeri Dijejaki", value: visitedStates.size, icon: Map, color: "text-primary" },
            { label: "Badges", value: badges.filter((b) => b.unlocked).length, icon: Trophy, color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-card p-5">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Masjid Passport */}
        <div className="rounded-2xl border bg-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg font-semibold">Pasport Masjid</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`rounded-xl border p-4 text-center transition-all ${
                  badge.unlocked
                    ? "bg-accent/10 border-accent/30"
                    : "bg-secondary/50 opacity-50"
                }`}
              >
                <span className="text-sm font-bold text-primary">{badge.name.charAt(0)}</span>
                <p className={`mt-1 text-sm font-semibold ${badge.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                {badge.unlocked && (
                  <Badge className="mt-2 bg-accent text-accent-foreground text-xs">Unlocked!</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* State Map */}
        <div className="rounded-2xl border bg-card p-6 mb-8">
          <h3 className="font-serif text-lg font-semibold mb-4">Negeri Yang Dijejaki</h3>
          <div className="flex flex-wrap gap-2">
            {STATES.map((state) => (
              <div
                key={state}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  visitedStates.has(state)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {state}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="rounded-2xl border bg-card p-6 mb-8">
          <h3 className="font-serif text-lg font-semibold mb-4">Aktiviti 30 Hari</h3>
          <div className="grid grid-cols-10 gap-2 md:grid-cols-15">
            {days.map((day) => (
              <div
                key={day.dateStr}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  day.hasVisit
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
                title={`${day.dateStr}${day.hasVisit ? " - Ada kunjungan" : ""}`}
              >
                {day.date.getDate()}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hijau = ada kunjungan hari tu
          </p>
        </div>

        {/* Visit Log */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Rekod Kunjungan</h3>
          <div className="space-y-3">
            {mockVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between rounded-xl border bg-background p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {visit.type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{visit.masjidName}</p>
                    <p className="text-xs text-muted-foreground">{visit.date}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-sans text-xs">
                  {typeLabel[visit.type]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackingDashboard;
