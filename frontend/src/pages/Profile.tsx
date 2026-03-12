import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { User, Edit2, Save, X, Trophy, Calendar, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type ProfileData = {
  id: string;
  full_name: string;
  phone_number: string | null;
  reputation_points: number;
  streak_count: number;
  longest_streak: number;
  last_checkin_at: string | null;
  created_at: string | null;
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone_number: "" });

  if (!user) return <Navigate to="/auth" replace />;

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile", "me"],
    queryFn: () => profileApi.get(),
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone_number: profile.phone_number ?? "",
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () =>
      profileApi.update({
        full_name: form.full_name || undefined,
        phone_number: form.phone_number || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setEditing(false);
      toast({ title: "Profil dikemaskini!", description: "Maklumat anda telah disimpan." });
    },
    onError: (err) => {
      toast({
        title: "Gagal kemaskini",
        description: err instanceof ApiError ? err.message : "Sila cuba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = () => {
    setForm({
      full_name: profile?.full_name ?? "",
      phone_number: profile?.phone_number ?? "",
    });
    setEditing(true);
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Profil Saya</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar + name card */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {(profile?.full_name ?? user.fullName).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">
                      {profile?.full_name ?? user.fullName}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ahli sejak {formatDate(profile?.created_at)}
                    </p>
                  </div>
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                    className="rounded-lg gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Edit form */}
              {editing && (
                <div className="mt-6 space-y-4 border-t pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Penuh</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      className="rounded-xl bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">No. Telefon (Opsyen)</Label>
                    <Input
                      id="phone_number"
                      placeholder="cth: 0123456789"
                      value={form.phone_number}
                      onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                      className="rounded-xl bg-background"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => mutation.mutate()}
                      disabled={mutation.isPending}
                      className="rounded-xl gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {mutation.isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="rounded-xl gap-2"
                    >
                      <X className="h-4 w-4" />
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Trophy,
                  label: "Mata Reputasi",
                  value: profile?.reputation_points ?? 0,
                  color: "text-accent",
                },
                {
                  icon: TrendingUp,
                  label: "Streak Semasa",
                  value: profile?.streak_count ?? 0,
                  color: "text-primary",
                },
                {
                  icon: Calendar,
                  label: "Streak Terpanjang",
                  value: profile?.longest_streak ?? 0,
                  color: "text-primary",
                },
                {
                  icon: MapPin,
                  label: "Check-in Terakhir",
                  value: formatDate(profile?.last_checkin_at),
                  color: "text-accent",
                  isText: true,
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border bg-card p-5">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  {stat.isText ? (
                    <p className="font-semibold text-foreground text-sm">{stat.value}</p>
                  ) : (
                    <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Phone number display */}
            {profile?.phone_number && !editing && (
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-medium text-muted-foreground mb-1">No. Telefon</p>
                <p className="text-sm font-medium text-foreground">{profile.phone_number}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
