import { useMemo, useState } from "react";
import { usePartners, useCreatePartner, useUpdatePartner, useDeletePartner, type Partner } from "@/hooks/use-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Download, Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { PartnerForm } from "@/components/partners/PartnerForm";
import { exportPartnersToExcel } from "@/lib/export-excel";
import { PARTNER_TYPES, PARTNERSHIP_STATUSES, FOLLOW_UP_STATUSES, STATUS_COLORS, FOLLOW_UP_COLORS } from "@/lib/partner-constants";
import type { PartnerFormValues } from "@/lib/partner-schema";

const PAGE_SIZE = 10;
type SortKey = "partner_code" | "name" | "partner_type" | "partnership_status" | "created_at";

export default function Partners() {
  const { data: partners = [], isLoading } = usePartners();
  const createMut = useCreatePartner();
  const updateMut = useUpdatePartner();
  const deleteMut = useDeletePartner();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("__all");
  const [statusFilter, setStatusFilter] = useState<string>("__all");
  const [followFilter, setFollowFilter] = useState<string>("__all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = partners.filter((p) => {
      if (typeFilter !== "__all" && p.partner_type !== typeFilter) return false;
      if (statusFilter !== "__all" && p.partnership_status !== statusFilter) return false;
      if (followFilter !== "__all" && p.follow_up_status !== followFilter) return false;
      if (!q) return true;
      return [p.name, p.partner_code, p.contact_name, p.email, p.country, p.city, p.intervention_domain]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
    list = [...list].sort((a, b) => {
      const av = (a[sortKey] ?? "") as string;
      const bv = (b[sortKey] ?? "") as string;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [partners, search, typeFilter, statusFilter, followFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const resetFilters = () => {
    setSearch(""); setTypeFilter("__all"); setStatusFilter("__all"); setFollowFilter("__all"); setPage(1);
  };

  const handleCreate = async (values: PartnerFormValues) => {
    await createMut.mutateAsync(values);
    setCreateOpen(false);
  };
  const handleUpdate = async (values: PartnerFormValues) => {
    if (!editing) return;
    await updateMut.mutateAsync({ id: editing.id, values });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partenaires</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportPartnersToExcel(filtered)} disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-2" />Excel
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-elegant">
                <Plus className="h-4 w-4 mr-2" />Nouveau partenaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nouveau partenaire</DialogTitle></DialogHeader>
              <PartnerForm onSubmit={handleCreate} submitting={createMut.isPending} submitLabel="Créer" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher (nom, code, contact, pays...)" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tous types</SelectItem>
              {PARTNER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tous statuts</SelectItem>
              {PARTNERSHIP_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={followFilter} onValueChange={(v) => { setFollowFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Suivi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tous suivis</SelectItem>
              {FOLLOW_UP_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={resetFilters}><Filter className="h-4 w-4 mr-2" />Réinitialiser</Button>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("partner_code")}>
                  <span className="inline-flex items-center gap-1">Code <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                  <span className="inline-flex items-center gap-1">Nom <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("partner_type")}>Type</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Pays</TableHead>
                <TableHead onClick={() => toggleSort("partnership_status")} className="cursor-pointer">Statut</TableHead>
                <TableHead className="hidden md:table-cell">Suivi</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => <TableCell key={j}><Skeleton className="h-5" /></TableCell>)}
                  </TableRow>
                ))
              ) : pageRows.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucun partenaire trouvé</TableCell></TableRow>
              ) : pageRows.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{p.partner_code}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="secondary">{p.partner_type}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    <div>{p.contact_name || "—"}</div>
                    {p.email && <div className="text-xs text-muted-foreground">{p.email}</div>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{p.country || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[p.partnership_status ?? ""] ?? ""}>
                      {p.partnership_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.follow_up_status ? (
                      <Badge variant="outline" className={FOLLOW_UP_COLORS[p.follow_up_status] ?? ""}>{p.follow_up_status}</Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Supprimer">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce partenaire ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. {p.name} ({p.partner_code}) sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMut.mutate(p.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-2 p-4 border-t">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} / {totalPages}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier {editing?.partner_code}</DialogTitle></DialogHeader>
          {editing && (
            <PartnerForm defaultValues={editing} onSubmit={handleUpdate} submitting={updateMut.isPending} submitLabel="Mettre à jour" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}