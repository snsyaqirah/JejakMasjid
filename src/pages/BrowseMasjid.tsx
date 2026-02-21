import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MasjidCard from "@/components/MasjidCard";
import { mockMasjids } from "@/data/mockData";
import { Link } from "react-router-dom";

const BrowseMasjid = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "terawih" | "iftar">("all");

  const filtered = mockMasjids.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase());
    if (filter === "verified") return matchSearch && m.verified;
    if (filter === "terawih") return matchSearch && m.hasTerawih;
    if (filter === "iftar") return matchSearch && m.hasIftar;
    return matchSearch;
  });

  const filters = [
    { key: "all" as const, label: "Semua" },
    { key: "verified" as const, label: "Disahkan" },
    { key: "terawih" as const, label: "🌙 Terawih" },
    { key: "iftar" as const, label: "🍽️ Iftar" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Cari Masjid
          </h1>
          <p className="mt-2 text-muted-foreground">
            Temui masjid berdekatan yang dikongsi oleh komuniti
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama masjid atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl pl-11 py-6 text-base bg-card"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
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
