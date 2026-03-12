import { useState } from "react";
import { MapPin, ArrowLeft, LocateFixed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { masjidsApi, facilitiesApi, ApiError } from "@/lib/api";
import { MALAYSIA_STATES } from "@/lib/constants";

const AddMasjid = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
    hasTerawih: false,
    hasIftar: false,
    hasOKUAccess: false,
    hasKidsArea: false,
    hasCoway: false,
    terawihRakaat: "",
    iftarInfo: "",
  });

  if (!user) return <Navigate to="/auth" replace />;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS tidak disokong", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        toast({ title: "Lokasi dikesan!", description: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      },
      () => {
        toast({ title: "Gagal kesan GPS", description: "Sila benarkan akses GPS atau isi koordinat manual.", variant: "destructive" });
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      toast({ title: "Koordinat diperlukan", description: "Gunakan butang GPS atau isi koordinat.", variant: "destructive" });
      return;
    }
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      toast({ title: "Koordinat tidak sah", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Check for nearby duplicates first
      const nearby = await masjidsApi.checkNearby(lat, lng, 100) as Array<{ id: string; name: string }>;
      if (nearby.length > 0) {
        toast({
          title: "Masjid mungkin sudah wujud",
          description: `"${nearby[0].name}" ditemui dalam radius 100m. Sila semak dahulu.`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const result = await masjidsApi.create({
        name: form.name,
        address: form.address,
        description: form.description || undefined,
        latitude: lat,
        longitude: lng,
      }) as { id: string };

      // Save facilities data if any checkboxes were selected
      const hasFacilityData = form.hasTerawih || form.hasIftar || form.hasOKUAccess ||
        form.hasKidsArea || form.hasCoway;
      if (hasFacilityData) {
        try {
          const facilitiesPayload: Record<string, unknown> = {
            has_iftar: form.hasIftar,
            has_parking_oku: form.hasOKUAccess,
            has_kids_area: form.hasKidsArea,
            has_coway: form.hasCoway,
            is_family_friendly: true,
          };
          if (form.hasTerawih && form.terawihRakaat) {
            facilitiesPayload.terawih_rakaat = parseInt(form.terawihRakaat);
          }
          if (form.hasIftar && form.iftarInfo) {
            facilitiesPayload.iftar_menu = form.iftarInfo;
          }
          await facilitiesApi.create(result.id, facilitiesPayload);
        } catch {
          // Non-critical: masjid is already saved, facilities can be added later
        }
      }

      toast({
        title: "Masjid berjaya ditambah! 🕌",
        description: `${form.name} kini boleh dilihat oleh komuniti. 3 pengesahan diperlukan.`,
      });
      navigate(`/masjid/${result.id}`);
    } catch (err) {
      toast({
        title: "Gagal tambah masjid",
        description: err instanceof ApiError ? err.message : "Sila cuba lagi.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Tambah Masjid Baru
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kongsi info masjid ni dengan komuniti. Masjid akan muncul terus dengan tag "Belum disahkan".
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <h3 className="font-serif text-base font-semibold">Maklumat Asas</h3>
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Nama Masjid *</Label>
              <Input id="name" placeholder="cth: Masjid Al-Ikhlas" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl bg-background" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="font-medium">Alamat Penuh *</Label>
              <Input id="address" placeholder="cth: No 1, Jalan Masjid, Taman Sri Muda, 40150 Shah Alam, Selangor" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl bg-background" required />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Koordinat GPS *</Label>
              <Button type="button" variant="outline" className="w-full rounded-xl gap-2" onClick={detectLocation} disabled={locating}>
                <LocateFixed className="h-4 w-4" />
                {locating ? "Mengesan lokasi..." : "Gunakan Lokasi Semasa (GPS)"}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lat" className="text-xs text-muted-foreground">Latitud</Label>
                  <Input id="lat" placeholder="3.139003" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="rounded-xl bg-background" />
                </div>
                <div>
                  <Label htmlFor="lng" className="text-xs text-muted-foreground">Longitud</Label>
                  <Input id="lng" placeholder="101.686855" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="rounded-xl bg-background" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Koordinat diperlukan untuk ciri berdekatan & check-in</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">Maklumat Tambahan</Label>
              <Textarea id="description" placeholder="cth: Masjid berhampiran pasar malam. Ada parkir luas..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-background min-h-[80px]" />
            </div>
          </div>

          {/* Facilities (basic — can be updated later) */}
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <h3 className="font-serif text-base font-semibold">Kemudahan (Opsyen)</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "hasTerawih", label: "Ada Terawih" },
                { key: "hasIftar", label: "Ada Iftar" },
                { key: "hasOKUAccess", label: "Mesra OKU" },
                { key: "hasKidsArea", label: "Ruang Kanak-kanak" },
                { key: "hasCoway", label: "Ada Coway" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer rounded-xl border p-3 hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={form[item.key as keyof typeof form] as boolean}
                    onCheckedChange={(c) => setForm({ ...form, [item.key]: !!c })}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            {form.hasTerawih && (
              <div className="space-y-2">
                <Label className="font-medium">Terawih berapa rakaat?</Label>
                <div className="flex gap-2">
                  {["8", "11", "20", "23"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, terawihRakaat: form.terawihRakaat === r ? "" : r })}
                      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                        form.terawihRakaat === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {r} rakaat
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.hasIftar && (
              <div className="space-y-2">
                <Label className="font-medium">Info Iftar</Label>
                <Input placeholder="cth: Walk-in / Kena daftar dulu" value={form.iftarInfo} onChange={(e) => setForm({ ...form, iftarInfo: e.target.value })} className="rounded-xl bg-background" />
              </div>
            )}
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base">
            <MapPin className="mr-2 h-5 w-5" />
            {submitting ? "Menyimpan..." : "Kongsi Masjid Ini"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Masjid akan dipaparkan dengan status "Belum disahkan" sehingga 3 pengguna lain mengesahkannya.
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AddMasjid;
