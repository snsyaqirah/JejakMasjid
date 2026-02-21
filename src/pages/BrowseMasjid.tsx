import { useState } from "react";
import { Search, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MasjidCard from "@/components/MasjidCard";
import { mockMasjids, QUICK_TAGS } from "@/data/mockData";
import { Link } from "react-router-dom";

const BrowseMasjid = () => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"visits" | "rating">("visits");

  const toggleTag = (key: string) => {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const filtered = mockMasjids
    .filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase()) ||
        m.state.toLowerCase().includes(search.toLowerCase());
      const matchTags =
        selectedTags.length === 0 || selectedTags.every((t) => m.tags.includes(t));
      return matchSearch && matchTags;
    })
    .sort((a, b) =>
      sortBy === "rating"
        ? b.averageRating - a.averageRating
        : b.totalVisits - a.totalVisits
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Cari Masjid
          </h1>
          <p className="mt-2 text-muted-foreground">
            Temui masjid berdekatan — filter ikut kemudahan yang anda perlukan
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama masjid, lokasi, atau negeri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl pl-11 py-6 text-base bg-card"
            />
          </div>
        </div>

        {/* Quick Tags Filter */}
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Filter kemudahan:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag.key)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Susun:</span>
          <button
            onClick={() => setSortBy("visits")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sortBy === "visits" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            Paling Dikunjungi
          </button>
          <button
            onClick={() => setSortBy("rating")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
              sortBy === "rating" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <Star className="h-3 w-3" /> Rating Tertinggi
          </button>
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((masjid) => (
              <MasjidCard key={masjid.id} masjid={masjid} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Tiada masjid dijumpai
            </h3>
            <p className="mt-2 text-muted-foreground">
              Cuba carian lain atau tambah masjid baru!
            </p>
            <Button asChild className="mt-4 rounded-xl">
              <Link to="/add">Tambah Masjid</Link>
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BrowseMasjid;
