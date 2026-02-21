import { useState } from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AddMasjid = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    location: "",
    state: "",
    description: "",
    hasTerawih: false,
    hasIftar: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Masjid berjaya ditambah! 🕌",
      description: `${form.name} kini boleh dilihat oleh komuniti. Ia akan disahkan selepas 3 pengesahan.`,
    });
    setForm({ name: "", location: "", state: "", description: "", hasTerawih: false, hasIftar: false });
  };

  const states = [
    "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Melaka", "Negeri Sembilan",
    "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak",
    "Selangor", "Terengganu",
  ];

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
            Kongsi info masjid ni dengan komuniti. Ia akan muncul terus dengan tag "Belum disahkan".
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Nama Masjid *</Label>
              <Input
                id="name"
                placeholder="cth: Masjid Al-Ikhlas"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl bg-background"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="font-medium">Lokasi / Kawasan *</Label>
                <Input
                  id="location"
                  placeholder="cth: Taman Sri Muda"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="rounded-xl bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="font-medium">Negeri *</Label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih negeri</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">Maklumat Tambahan</Label>
              <Textarea
                id="description"
                placeholder="cth: Masjid ini terletak berhampiran pasar malam. Ada parkir luas..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl bg-background min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="font-medium">Kemudahan Ramadan</Label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={form.hasTerawih}
                    onCheckedChange={(c) => setForm({ ...form, hasTerawih: !!c })}
                  />
                  🌙 Ada Terawih
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={form.hasIftar}
                    onCheckedChange={(c) => setForm({ ...form, hasIftar: !!c })}
                  />
                  🍽️ Ada Iftar
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base">
            <MapPin className="mr-2 h-5 w-5" />
            Kongsi Masjid Ini
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
