import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { ShieldCheck, ExternalLink, CheckCircle2, XCircle, Clock, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { adminApi, profileApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Report, ReportStatus } from "@/types";

const REPORT_TYPE_LABELS: Record<string, string> = {
  does_not_exist: "Tidak wujud",
  wrong_location: "Lokasi salah",
  duplicate: "Duplikat",
  wrong_info: "Info tidak tepat",
  inappropriate_content: "Kandungan tidak sesuai",
  other: "Lain-lain",
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending:    { label: "Menunggu",  variant: "secondary",   icon: <Clock className="h-3 w-3" /> },
  reviewing:  { label: "Disemak",  variant: "default",     icon: <Loader2 className="h-3 w-3" /> },
  resolved:   { label: "Selesai",  variant: "outline",     icon: <CheckCircle2 className="h-3 w-3" /> },
  dismissed:  { label: "Tolak",    variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

const PAGE_SIZE = 10;

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("ms-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Report | null>(null);
  const [resolveStatus, setResolveStatus] = useState<string>("");
  const [resolveNotes, setResolveNotes] = useState("");

  // Check admin‑gated fetch — redirect if not admin
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileApi.get(),
    enabled: !!user,
  });

  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => adminApi.listReports(),
    enabled: !!profile?.is_admin,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes: string }) =>
      adminApi.resolveReport(id, { status, resolution_notes: notes || undefined }),
    onSuccess: () => {
      toast({ title: "Laporan dikemaskini" });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setSelected(null);
    },
    onError: () => toast({ title: "Gagal kemaskini", variant: "destructive" }),
  });

  if (!user || (!loadingProfile && !profile?.is_admin)) {
    return <Navigate to="/" replace />;
  }

  const filtered = (reports ?? []).filter((r: Report) => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      r.masjids?.name.toLowerCase().includes(term) ||
      (r.description ?? "").toLowerCase().includes(term) ||
      REPORT_TYPE_LABELS[r.report_type]?.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = (reports ?? []).reduce(
    (acc: Record<string, number>, r: Report) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">Panel Admin</h1>
            <p className="text-sm text-muted-foreground">Urus laporan dari pengguna</p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(["all", "pending", "reviewing", "resolved", "dismissed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s === "all" ? "Semua" : STATUS_CONFIG[s as ReportStatus].label}{" "}
              <span className="opacity-70">
                ({s === "all" ? (reports?.length ?? 0) : (counts[s] ?? 0)})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama masjid atau keterangan..."
            className="pl-9 rounded-xl"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Report list */}
        {loadingProfile || loadingReports ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            Tiada laporan ditemui
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((r: Report) => {
              const cfg = STATUS_CONFIG[r.status];
              return (
                <div
                  key={r.id}
                  className="rounded-xl border bg-card p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => { setSelected(r); setResolveStatus(r.status); setResolveNotes(r.resolution_notes ?? ""); }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/masjid/${r.masjid_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-sm hover:underline truncate max-w-[200px]"
                        >
                          {r.masjids?.name ?? r.masjid_id}
                          <ExternalLink className="inline ml-1 h-3 w-3 opacity-50" />
                        </Link>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}
                        </Badge>
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {fmtDate(r.created_at)}
                      </p>
                    </div>
                    <Badge variant={cfg.variant} className="flex items-center gap-1 shrink-0 text-xs">
                      {cfg.icon} {cfg.label}
                    </Badge>
                  </div>
                  {r.resolution_notes && (
                    <p className="mt-2 text-xs bg-muted/60 rounded-lg px-2 py-1 text-muted-foreground">
                      📝 {r.resolution_notes}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} daripada {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline" size="sm" className="rounded-lg"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >Sebelum</Button>
                  <Button
                    variant="outline" size="sm" className="rounded-lg"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >Seterus</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />

      {/* ── Resolve Dialog ── */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kemaskini Laporan</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-1">
              <div className="rounded-xl bg-muted/50 p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Masjid:</span> <strong>{selected.masjids?.name ?? selected.masjid_id}</strong></p>
                <p><span className="text-muted-foreground">Jenis:</span> {REPORT_TYPE_LABELS[selected.report_type] ?? selected.report_type}</p>
                {selected.description && <p><span className="text-muted-foreground">Keterangan:</span> {selected.description}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={resolveStatus} onValueChange={setResolveStatus}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="reviewing">Sedang Disemak</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                    <SelectItem value="dismissed">Tolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Nota resolusi (pilihan)</label>
                <Textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Contoh: Alamat telah diperbetulkan..."
                  className="mt-1.5 rounded-xl min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
            <Button
              disabled={!resolveStatus || resolveMutation.isPending}
              onClick={() => selected && resolveMutation.mutate({ id: selected.id, status: resolveStatus, notes: resolveNotes })}
            >
              {resolveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
