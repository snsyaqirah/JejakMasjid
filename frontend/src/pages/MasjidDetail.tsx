import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, CheckCircle, ArrowLeft, Users, Wind, Cat,
  Utensils, ThumbsUp, ThumbsDown, Loader2, Moon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { masjidsApi, verificationsApi, checkinsApi, liveUpdatesApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Masjid, Facilities, LiveStatus } from "@/types";

const VISIT_TYPES = [
  { key: "general", label: "Solat" },
  { key: "jumaat", label: "Jumaat" },
  { key: "terawih", label: "Terawih" },
  { key: "iftar", label: "Iftar" },
  { key: "kuliah", label: "Kuliah" },
] as const;

const MasjidDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checkingIn, setCheckingIn] = useState(false);

  // ── queries ───────────────────────────────────────────────────
  const { data: masjid, isLoading, isError } = useQuery({
    queryKey: ["masjid", id],
    queryFn: () => masjidsApi.get(id!),
    enabled: !!id,
  });

  const { data: liveStatus } = useQuery({
    queryKey: ["liveStatus", id],
    queryFn: () => liveUpdatesApi.getStatus(id!),
    enabled: !!id,
  });

  const { data: verifyStatus, refetch: refetchVerify } = useQuery({
    queryKey: ["verifyStatus", id],
    queryFn: () => verificationsApi.status(id!),
    enabled: !!id && !!user,
  });

  // ── mutations ─────────────────────────────────────────────────
  const voteMutation = useMutation({
    mutationFn: (voteType: "upvote" | "downvote") =>
      verificationsApi.vote({ masjidId: id!, voteType }),
    onSuccess: () => {
      toast({ title: "Terima kasih!", description: "Pengesahan anda direkodkan." });
      queryClient.invalidateQueries({ queryKey: ["masjid", id] });
      refetchVerify();
    },
    onError: (e) => {
      toast({ title: "Gagal", description: e instanceof ApiError ? e.message : "Cuba lagi.", variant: "destructive" });
    },
  });

  // ── check in ──────────────────────────────────────────────────
  const handleCheckIn = async (visitType: string) => {
    if (!user) {
      toast({ title: "Log masuk diperlukan", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!navigator.geolocation) {
      toast({ title: "GPS tidak disokong", description: "Pelayar anda tidak menyokong geolokasi.", variant: "destructive" });
      return;
    }
    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await checkinsApi.checkIn({
            masjidId: id!,
            visitType,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }) as { streak_count?: number; points_earned?: number; badges_unlocked?: string[] };
          toast({
            title: `Check-in berjaya! ���`,
            description: `+${result.points_earned ?? 0} mata. Streak: ${result.streak_count ?? 0} hari.`,
          });
        } catch (e) {
          const msg = e instanceof ApiError
            ? e.message
            : "Gagal check-in. Pastikan anda berada dalam 200m dari masjid.";
          toast({ title: "Gagal check-in", description: msg, variant: "destructive" });
        } finally {
          setCheckingIn(false);
        }
      },
      () => {
        toast({ title: "GPS diperlukan", description: "Sila benarkan akses GPS.", variant: "destructive" });
        setCheckingIn(false);
      }
    );
  };

  const handleVote = (type: "upvote" | "downvote") => {
    if (!user) {
      toast({ title: "Log masuk diperlukan", variant: "destructive" });
      navigate("/auth");
      return;
    }
    voteMutation.mutate(type);
  };

  // ── loading / error states ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !masjid) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold">Masjid tidak dijumpai</h2>
          <Button asChild className="mt-4 rounded-xl"><Link to="/browse">Kembali ke senarai</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const m = masjid as unknown as Masjid;
  const f = m.facilities as Facilities | null;
  const isVerified = m.status === "verified";
  const live = liveStatus as LiveStatus | undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Kembali ke senarai
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Placeholder image */}
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
              <div className="text-center">
                <Moon className="mx-auto h-16 w-16 text-muted-foreground/20" />
                <p className="mt-2 text-sm text-muted-foreground">Belum ada gambar</p>
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="font-serif text-3xl font-bold text-foreground">{m.name}</h1>
                {isVerified ? (
                  <Badge className="bg-accent text-accent-foreground gap-1 font-sans mt-1">
                    <CheckCircle className="h-3 w-3" /> Disahkan
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-sans mt-1">
                    Belum disahkan ({m.verification_count}/3)
                  </Badge>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {m.address}
              </p>
              {m.description && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.description}</p>
              )}
            </div>

            {/* Live Status */}
            {live && (live.crowd_level || live.saf_status || live.parking_status || live.iftar_menu) && (
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="font-serif text-lg font-semibold mb-3">Status Terkini</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {live.crowd_level && (
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">Kepadatan</p>
                      <p className="font-medium">{live.crowd_level}</p>
                    </div>
                  )}
                  {live.saf_status && (
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">Status Saf</p>
                      <p className="font-medium">{live.saf_status}</p>
                    </div>
                  )}
                  {live.parking_status && (
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">Parking</p>
                      <p className="font-medium">{live.parking_status}</p>
                    </div>
                  )}
                  {live.iftar_menu && (
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">Menu Iftar</p>
                      <p className="font-medium">{live.iftar_menu}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Facilities */}
            {f && (
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Kemudahan & Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {f.has_iftar && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Utensils className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Iftar</p>
                        {f.iftar_type && <p className="text-xs text-muted-foreground">{f.iftar_type}</p>}
                      </div>
                    </div>
                  )}
                  {f.terawih_rakaat && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Moon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Terawih</p>
                        <p className="text-xs text-muted-foreground">{f.terawih_rakaat} rakaat</p>
                      </div>
                    </div>
                  )}
                  {f.cooling_system && f.cooling_system !== "Tiada" && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Wind className="h-4 w-4 text-primary" />
                      <p className="font-medium">{f.cooling_system}</p>
                    </div>
                  )}
                  {f.kucing_count && f.kucing_count !== "Tiada" && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Cat className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Kucing</p>
                        <p className="text-xs text-muted-foreground">{f.kucing_count}</p>
                      </div>
                    </div>
                  )}
                  {f.is_family_friendly && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="font-medium">Mesra Keluarga</p>
                    </div>
                  )}
                  {f.has_kids_area && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="font-medium">Ruang Kanak-kanak</p>
                    </div>
                  )}
                  {f.parking_level && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="font-medium">Parking: {f.parking_level}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upvote / Downvote */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold mb-2">Ada kat sini? Sahkan!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pernah pergi masjid ni? Bantu komuniti dengan sahkan info ini betul.
                3 pengesahan = Disahkan!
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-accent/40 text-accent hover:bg-accent/10"
                  onClick={() => handleVote("upvote")}
                  disabled={voteMutation.isPending}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Betul ({m.verification_count})
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-muted-foreground"
                  onClick={() => handleVote("downvote")}
                  disabled={voteMutation.isPending}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Info salah
                </Button>
              </div>
              {!user && (
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  <Link to="/auth" className="text-primary font-semibold hover:underline">Log masuk</Link>{" "}
                  untuk mengesahkan
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">Statistik</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{m.verification_count}/3</p>
                    <p className="text-xs text-muted-foreground">Pengesahan diterima</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in */}
            <div className="rounded-2xl border bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Check-in (GPS diperlukan)
              </p>
              {checkingIn ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                VISIT_TYPES.map((v) => (
                  <Button
                    key={v.key}
                    onClick={() => handleCheckIn(v.key)}
                    variant={v.key === "general" ? "default" : "outline"}
                    className="w-full rounded-xl font-semibold py-5 text-sm"
                  >
                    {v.label}
                  </Button>
                ))
              )}
              {!user && (
                <p className="text-center text-xs text-muted-foreground pt-1">
                  <Link to="/auth" className="text-primary font-semibold hover:underline">Log masuk</Link>{" "}
                  untuk check-in
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MasjidDetail;
