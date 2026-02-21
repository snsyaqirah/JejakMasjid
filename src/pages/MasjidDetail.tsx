import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockMasjids } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MasjidDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const masjid = mockMasjids.find((m) => m.id === id);

  const requireLogin = (action: string) => {
    if (!user) {
      toast({
        title: "Log masuk diperlukan",
        description: `Sila log masuk untuk ${action}.`,
        variant: "destructive",
      });
      navigate("/auth");
      return true;
    }
    return false;
  };

  const handleTrack = (type: string) => {
    if (requireLogin(`merekod ${type}`)) return;
    toast({ title: `${type} direkodkan! 🌙`, description: `Kunjungan anda ke ${masjid?.name} telah disimpan.` });
  };

  const handleVerify = () => {
    if (requireLogin("mengesahkan masjid")) return;
    toast({ title: "Terima kasih! ✅", description: "Pengesahan anda telah direkodkan." });
  };

  if (!masjid) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold">Masjid tidak dijumpai</h2>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/browse">Kembali ke senarai</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke senarai
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center">
              {masjid.image ? (
                <img src={masjid.image} alt={masjid.name} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <MapPin className="mx-auto h-16 w-16 text-muted-foreground/20" />
                  <p className="mt-2 text-sm text-muted-foreground">Belum ada gambar</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="font-serif text-3xl font-bold text-foreground">{masjid.name}</h1>
                {masjid.verified ? (
                  <Badge className="bg-accent text-accent-foreground gap-1 font-sans mt-1">
                    <CheckCircle className="h-3 w-3" />
                    Disahkan
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-sans mt-1">
                    Belum disahkan ({masjid.verificationCount}/3)
                  </Badge>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {masjid.location}, {masjid.state}
              </p>
            </div>

            <div className="flex gap-2">
              {masjid.hasTerawih && (
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm bg-primary/10 text-primary">
                  🌙 Terawih tersedia
                </Badge>
              )}
              {masjid.hasIftar && (
                <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm bg-primary/10 text-primary">
                  🍽️ Iftar tersedia
                </Badge>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold mb-3">Tentang Masjid</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Maklumat lanjut tentang masjid ini belum ditambah lagi. Anda boleh membantu
                melengkapkan maklumat ini jika anda pernah mengunjungi masjid ini.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">Statistik</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{masjid.totalVisits}</p>
                    <p className="text-xs text-muted-foreground">Jumlah kunjungan</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{masjid.verificationCount}/3</p>
                    <p className="text-xs text-muted-foreground">Pengesahan diterima</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleTrack("Terawih")}
              className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6"
            >
              🌙 Saya di sini untuk Terawih
            </Button>
            <Button
              onClick={() => handleTrack("Iftar")}
              variant="outline"
              className="w-full rounded-xl font-semibold py-6"
            >
              🍽️ Saya di sini untuk Iftar
            </Button>

            {!masjid.verified && (
              <Button
                onClick={handleVerify}
                variant="outline"
                className="w-full rounded-xl text-accent border-accent/30 hover:bg-accent/10 font-semibold py-6"
              >
                ✅ Sahkan masjid ini betul
              </Button>
            )}

            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/auth" className="text-primary font-semibold hover:underline">Log masuk</Link>{" "}
                untuk merekod kunjungan dan mengesahkan masjid
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MasjidDetail;
