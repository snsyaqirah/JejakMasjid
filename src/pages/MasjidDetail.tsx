import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, ArrowLeft, Users, Star, Car, Train, Accessibility, Wind, Wifi, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockMasjids, QUICK_TAGS, VIBE_TAGS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-5 w-5 transition-colors ${
          i <= rating ? "text-accent fill-accent" : "text-muted-foreground/30"
        } ${interactive ? "cursor-pointer hover:text-accent" : ""}`}
        onClick={() => interactive && onRate?.(i)}
      />
    ))}
  </div>
);

const MasjidDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const masjid = mockMasjids.find((m) => m.id === id);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: "", vibeTags: [] as string[] });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const requireLogin = (action: string) => {
    if (!user) {
      toast({ title: "Log masuk diperlukan", description: `Sila log masuk untuk ${action}.`, variant: "destructive" });
      navigate("/auth");
      return true;
    }
    return false;
  };

  const handleTrack = (type: string) => {
    if (requireLogin(`merekod ${type}`)) return;
    toast({ title: `${type} direkodkan!`, description: `Kunjungan anda ke ${masjid?.name} telah disimpan.` });
  };

  const handleVerify = () => {
    if (requireLogin("mengesahkan masjid")) return;
    toast({ title: "Terima kasih!", description: "Pengesahan anda telah direkodkan." });
  };

  const handleReviewSubmit = () => {
    if (requireLogin("menulis review")) return;
    if (reviewForm.rating === 0) {
      toast({ title: "Rating diperlukan", description: "Sila bagi rating bintang.", variant: "destructive" });
      return;
    }
    toast({ title: "Review dihantar!", description: "Terima kasih atas sumbangan anda." });
    setReviewForm({ rating: 0, text: "", vibeTags: [] });
    setShowReviewForm(false);
  };

  const toggleVibeTag = (tag: string) => {
    setReviewForm((prev) => ({
      ...prev,
      vibeTags: prev.vibeTags.includes(tag)
        ? prev.vibeTags.filter((t) => t !== tag)
        : [...prev.vibeTags, tag],
    }));
  };

  if (!masjid) {
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

  const parkingLabel = { luas: "Parking luas", terhad: "Parking terhad", tiada: "Tiada parking", "": "" };
  const displayedReviews = showAllReviews ? masjid.reviews : masjid.reviews.slice(0, 2);

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
            {/* Image */}
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

            {/* Info */}
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="font-serif text-3xl font-bold text-foreground">{masjid.name}</h1>
                {masjid.verified ? (
                  <Badge className="bg-accent text-accent-foreground gap-1 font-sans mt-1">
                    <CheckCircle className="h-3 w-3" /> Disahkan
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-sans mt-1">Belum disahkan ({masjid.verificationCount}/3)</Badge>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {masjid.location}, {masjid.state}
              </p>
              {masjid.averageRating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={Math.round(masjid.averageRating)} />
                  <span className="text-sm font-semibold text-foreground">{masjid.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({masjid.reviews.length} review)</span>
                </div>
              )}
            </div>

            {/* Facilities Grid */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-serif text-lg font-semibold mb-4">Kemudahan & Info</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {masjid.hasTerawih && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <Star className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Terawih</p>
                      {masjid.terawihRakaat && <p className="text-xs text-muted-foreground">{masjid.terawihRakaat} rakaat</p>}
                    </div>
                  </div>
                )}
                {masjid.hasIftar && (
                   <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                     <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Iftar</p>
                      {masjid.iftarInfo && <p className="text-xs text-muted-foreground line-clamp-2">{masjid.iftarInfo}</p>}
                    </div>
                  </div>
                )}
                {masjid.hasOKUAccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <Accessibility className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Mesra OKU</p>
                      <p className="text-xs text-muted-foreground">Lift / kerusi roda</p>
                    </div>
                  </div>
                )}
                {masjid.hasWomenSpace && (
                   <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                     <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Ruang Wanita</p>
                      {masjid.womenSpaceInfo && <p className="text-xs text-muted-foreground line-clamp-2">{masjid.womenSpaceInfo}</p>}
                    </div>
                  </div>
                )}
                {masjid.hasAC && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <Wind className="h-4 w-4 text-primary" />
                    <p className="font-medium text-foreground">Aircon</p>
                  </div>
                )}
                {masjid.hasWifi && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <Wifi className="h-4 w-4 text-primary" />
                    <p className="font-medium text-foreground">WiFi</p>
                  </div>
                )}
                {masjid.nearPublicTransport && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <Train className="h-4 w-4 text-primary" />
                    <p className="font-medium text-foreground">Dekat transit</p>
                  </div>
                )}
                {masjid.parkingStatus && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <Car className="h-4 w-4 text-primary" />
                    <p className="font-medium text-foreground">{parkingLabel[masjid.parkingStatus]}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold">Review Komuniti ({masjid.reviews.length})</h3>
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    Tulis Review
                  </Button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-6 rounded-xl border bg-background p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Rating anda</p>
                    <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} interactive />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Vibe masjid ni (pilih yang sesuai)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {VIBE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleVibeTag(tag)}
                          className={`rounded-full px-3 py-1 text-xs transition-colors ${
                            reviewForm.vibeTags.includes(tag)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Kongsi pengalaman anda di masjid ni... (cth: Imam bacaan sedap, carpet baru, parking senang)"
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    className="rounded-xl bg-card min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReviewSubmit} size="sm" className="rounded-lg">
                      Hantar Review
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)} className="rounded-lg">
                      Batal
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {masjid.reviews.length > 0 ? (
                <div className="space-y-4">
                  {displayedReviews.map((review) => (
                    <div key={review.id} className="rounded-xl border bg-background p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{review.userName}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.vibeTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {review.vibeTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs rounded-full">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                    </div>
                  ))}

                  {masjid.reviews.length > 2 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                    >
                      {showAllReviews ? (
                        <><ChevronUp className="h-4 w-4" /> Tutup</>
                      ) : (
                        <><ChevronDown className="h-4 w-4" /> Lihat semua {masjid.reviews.length} review</>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada review. Jadilah yang pertama!</p>
              )}

              {!user && (
                <p className="mt-4 text-xs text-muted-foreground">
                  <Link to="/auth" className="text-primary font-semibold hover:underline">Log masuk</Link>{" "}
                  untuk tulis review
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

            <div className="rounded-2xl border bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Rekod Kunjungan</p>
              <Button onClick={() => handleTrack("Solat")} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5 text-sm">
                Saya solat di sini
              </Button>
              <Button onClick={() => handleTrack("Terawih")} variant="outline" className="w-full rounded-xl font-semibold py-5 text-sm">
                Terawih
              </Button>
              <Button onClick={() => handleTrack("Iftar")} variant="outline" className="w-full rounded-xl font-semibold py-5 text-sm">
                Iftar
              </Button>
              <Button onClick={() => handleTrack("Jumaat")} variant="outline" className="w-full rounded-xl font-semibold py-5 text-sm">
                Solat Jumaat
              </Button>
              <Button onClick={() => handleTrack("Ziarah")} variant="outline" className="w-full rounded-xl font-semibold py-5 text-sm">
                Ziarah
              </Button>
            </div>

            {!masjid.verified && (
              <Button onClick={handleVerify} variant="outline" className="w-full rounded-xl text-accent border-accent/30 hover:bg-accent/10 font-semibold py-6">
                Sahkan masjid ini betul
              </Button>
            )}

            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/auth" className="text-primary font-semibold hover:underline">Log masuk</Link>{" "}
                untuk merekod kunjungan
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
