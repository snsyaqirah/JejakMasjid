import { Moon, Calendar, MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockVisits, mockMasjids } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";

const TrackingDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  const terawihCount = mockVisits.filter((v) => v.type === "terawih").length;
  const iftarCount = mockVisits.filter((v) => v.type === "iftar").length;
  const uniqueMasjids = new Set(mockVisits.map((v) => v.masjidId)).size;

  // Build a simple 30-day streak view
  const today = new Date("2026-02-21");
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasVisit = mockVisits.some((v) => v.date === dateStr);
    return { date: d, dateStr, hasVisit };
  });

  const typeLabel: Record<string, string> = {
    terawih: "🌙 Terawih",
    iftar: "🍽️ Iftar",
    solat: "🕌 Solat",
    ziarah: "📍 Ziarah",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Jejak Saya
          </h1>
          <p className="mt-2 text-muted-foreground">
            Rekod perjalanan ibadah Ramadan anda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Terawih", value: terawihCount, icon: Moon, color: "text-primary" },
            { label: "Iftar", value: iftarCount, icon: Calendar, color: "text-accent" },
            { label: "Masjid Dikunjungi", value: uniqueMasjids, icon: MapPin, color: "text-primary" },
            { label: "Jumlah Kunjungan", value: mockVisits.length, icon: TrendingUp, color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-card p-5">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Streak Calendar */}
        <div className="rounded-2xl border bg-card p-6 mb-8">
          <h3 className="font-serif text-lg font-semibold mb-4">Streak Terawih (30 hari)</h3>
          <div className="grid grid-cols-10 gap-2 md:grid-cols-15">
            {days.map((day) => (
              <div
                key={day.dateStr}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  day.hasVisit
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
                title={`${day.dateStr}${day.hasVisit ? " - Hadir" : ""}`}
              >
                {day.date.getDate()}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hijau = ada kunjungan hari tu 🌙
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {visit.type === "terawih" ? "🌙" : visit.type === "iftar" ? "🍽️" : "🕌"}
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
