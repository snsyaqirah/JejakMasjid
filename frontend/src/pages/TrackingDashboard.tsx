import { Moon, Calendar, MapPin, TrendingUp, Trophy, Map, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { dashboardApi, checkinsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { VISIT_TYPE_LABELS, MALAYSIA_STATES } from "@/lib/constants";
import { Link, Navigate } from "react-router-dom";
import type { UserStats, VisitHistory, Visit } from "@/types";

const TrackingDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ["checkins", "history"],
    queryFn: () => checkinsApi.history(),
  });

  const s = stats as UserStats | undefined;
  const h = history as VisitHistory | undefined;

  const visitedStates = new Set<string>();
  // We don't have state data per visit from the API, so show empty for now

  // 30-day activity from visit history
  const today = new Date();
  const visitDates = new Set((h?.visits ?? []).map((v: Visit) => v.visit_date?.split("T")[0]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    return { date: d, dateStr, hasVisit: visitDates.has(dateStr) };
  });

  const isLoading = loadingStats || loadingHistory;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Jejak Saya</h1>
          <p className="mt-2 text-muted-foreground">
            Semua masjid yang anda dah kunjungi — passport masjid peribadi anda
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
              {[
                { label: "Jumlah Kunjungan", value: s?.total_visits ?? 0, icon: TrendingUp, color: "text-primary" },
                { label: "Masjid Dikunjungi", value: h?.unique_masjids ?? 0, icon: MapPin, color: "text-accent" },
                { label: "Streak Sekarang", value: h?.current_streak ?? 0, icon: Calendar, color: "text-primary" },
                { label: "Mata Reputasi", value: s?.reputation_points ?? 0, icon: Trophy, color: "text-accent" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border bg-card p-5">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Badges / Passport */}
            {s?.badges && s.badges.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-accent" />
                  <h3 className="font-serif text-lg font-semibold">Pasport Masjid</h3>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {s.badges_earned}/{s.total_badges} badges
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {s.badges.map((ub) => (
                    <div key={ub.id} className="rounded-xl border bg-accent/10 border-accent/30 p-4 text-center">
                      <span className="text-xl">{ub.badge.icon}</span>
                      <p className="mt-1 text-sm font-semibold text-foreground">{ub.badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ub.badge.description}</p>
                      <Badge className="mt-2 bg-accent text-accent-foreground text-xs">Unlocked!</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Calendar */}
            <div className="rounded-2xl border bg-card p-6 mb-8">
              <h3 className="font-serif text-lg font-semibold mb-4">Aktiviti 30 Hari</h3>
              <div className="grid grid-cols-10 gap-2">
                {days.map((day) => (
                  <div
                    key={day.dateStr}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                      day.hasVisit
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                    title={`${day.dateStr}${day.hasVisit ? " — Ada kunjungan" : ""}`}
                  >
                    {day.date.getDate()}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Warna = ada check-in hari tu</p>
            </div>

            {/* Favourite Masjid */}
            {h?.favorite_masjid && (
              <div className="rounded-2xl border bg-card p-5 mb-8 flex items-center gap-3">
                <Moon className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Masjid Kegemaran</p>
                  <p className="font-semibold text-foreground">{h.favorite_masjid}</p>
                </div>
              </div>
            )}

            {/* Visit Log */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">Rekod Kunjungan</h3>
              {(h?.visits ?? []).length === 0 ? (
                <div className="py-10 text-center">
                  <MapPin className="mx-auto h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Belum ada check-in. <Link to="/browse" className="text-primary underline">Cari masjid</Link> untuk mula!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(h?.visits ?? []).map((visit: Visit) => (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between rounded-xl border bg-background p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                          {visit.visit_type.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{visit.masjid_name ?? "Masjid"}</p>
                          <p className="text-xs text-muted-foreground">{visit.visit_date?.split("T")[0]}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-sans text-xs">
                        {VISIT_TYPE_LABELS[visit.visit_type] ?? visit.visit_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TrackingDashboard;
