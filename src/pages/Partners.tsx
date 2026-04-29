import { useMemo, useState } from "react";
import { usePartners, useCreatePartner, useUpdatePartner, useDeletePartner, type Partner } from "@/hooks/use-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Download, Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Filter, Users, CheckCircle2, Clock, Activity } from "lucide-react";
import { PartnerForm } from "@/components/partners/PartnerForm";
import { exportPartnersToExcel } from "@/lib/export-excel";
import { PARTNER_TYPES, PARTNERSHIP_STATUSES, FOLLOW_UP_STATUSES, STATUS_COLORS, FOLLOW_UP_COLORS } from "@/lib/partner-constants";
import type { PartnerFormValues } from "@/lib/partner-schema";
import { toast } from "sonner";

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

  const stats = useMemo(() => {
    const active = partners.filter(p => p.partnership_status === "Actif").length;
    const pending = partners.filter(p => p.partnership_status === "Prospect" || p.partnership_status === "En négociation").length;
    const alerts = partners.filter(p => p.follow_up_status === "À relancer" || p.follow_up_status === "Urgent").length;
    return { total: partners.length, active, pending, alerts };
  }, [partners]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const resetFilters = () => {
    setSearch(""); setTypeFilter("__all"); setStatusFilter("__all"); setFollowFilter("__all"); setPage(1);
  };

  const handleCreate = async (values: PartnerFormValues) => {
    try {
      await createMut.mutateAsync(values);
      setCreateOpen(false);
      toast.success("Partenaire créé avec succès");
    } catch (e) {
      toast.error("Erreur lors de la création du partenaire");
    }
  };
  const handleUpdate = async (values: PartnerFormValues) => {
    if (!editing) return;
    try {
      await updateMut.mutateAsync({ id: editing.id, values });
      setEditing(null);
      toast.success("Partenaire mis à jour");
    } catch (e) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Partenaires</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Gérez votre base de données de partenaires et suivez les interactions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => exportPartnersToExcel(filtered)} disabled={!filtered.length} className="bg-background shadow-sm hover:bg-muted transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-elegant transition-all duration-300 transform hover:-translate-y-0.5 text-primary-foreground font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau partenaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold text-primary">Nouveau partenaire</DialogTitle>
                <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous pour ajouter un nouveau partenaire.</p>
              </DialogHeader>
              <div className="p-6 pt-0">
                <PartnerForm onSubmit={handleCreate} submitting={createMut.isPending} submitLabel="Créer le partenaire" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-none bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Partenaires</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-primary/5">
              <Users className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-none bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Actifs</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-success/5">
              <CheckCircle2 className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-none bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Prospects</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl text-warning">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-warning/5">
              <Clock className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-none bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">À Relancer</p>
                <p className="text-3xl font-bold">{stats.alerts}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl text-destructive">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-destructive/5">
              <Activity className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-none overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-5 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher (nom, code, contact...)" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/50 transition-all rounded-lg" />
            </div>
            <div className="flex-1 w-full flex flex-wrap gap-3 md:justify-end">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] bg-background shadow-sm border-muted-foreground/20 rounded-lg"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                  <SelectItem value="__all" className="font-medium">Tous types</SelectItem>
                  {PARTNER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] bg-background shadow-sm border-muted-foreground/20 rounded-lg"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                  <SelectItem value="__all" className="font-medium">Tous statuts</SelectItem>
                  {PARTNERSHIP_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={followFilter} onValueChange={(v) => { setFollowFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] bg-background shadow-sm border-muted-foreground/20 rounded-lg"><SelectValue placeholder="Suivi" /></SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                  <SelectItem value="__all" className="font-medium">Tous suivis</SelectItem>
                  {FOLLOW_UP_STATUSES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {(search || typeFilter !== "__all" || statusFilter !== "__all" || followFilter !== "__all") && (
                <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                  <Filter className="h-4 w-4 mr-2" />Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b-border/50 hover:bg-transparent">
                <TableHead className="cursor-pointer select-none font-semibold text-muted-foreground h-12 px-4" onClick={() => toggleSort("partner_code")}>
                  <div className="flex items-center gap-2 whitespace-nowrap">ID Partenaire <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                </TableHead>
                <TableHead className="cursor-pointer select-none font-semibold text-muted-foreground h-12 px-4" onClick={() => toggleSort("name")}>
                  <div className="flex items-center gap-2">Nom <ArrowUpDown className="h-3 w-3 opacity-50" /></div>
                </TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-muted-foreground h-12 px-4">Type</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold text-muted-foreground h-12 px-4">Domaine</TableHead>
                <TableHead className="hidden xl:table-cell font-semibold text-muted-foreground h-12 px-4">Région</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-muted-foreground h-12 px-4">Pays</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold text-muted-foreground h-12 px-4">Contact</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-muted-foreground h-12 px-4">Suivi</TableHead>
                <TableHead className="hidden xl:table-cell font-semibold text-muted-foreground h-12 px-4">Score</TableHead>
                <TableHead className="hidden 2xl:table-cell font-semibold text-muted-foreground h-12 px-4">Responsable</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground h-12 px-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b-border/50">
                    {Array.from({ length: 11 }).map((__, j) => <TableCell key={j} className="px-4 py-4"><Skeleton className="h-4 w-full bg-muted/60" /></TableCell>)}
                  </TableRow>
                ))
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="bg-muted/30 p-4 rounded-full mb-4">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium text-foreground">Aucun partenaire trouvé</p>
                      <p className="text-sm mt-1">Essayez de modifier vos filtres ou ajoutez un nouveau partenaire.</p>
                      <Button onClick={resetFilters} variant="outline" className="mt-4">Réinitialiser les filtres</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pageRows.map((p) => (
                <TableRow key={p.id} className="group border-b-border/50 hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground px-4 py-4">{p.partner_code}</TableCell>
                  <TableCell className="font-semibold text-foreground px-4 py-4">{p.name}</TableCell>
                  <TableCell className="hidden sm:table-cell px-4 py-4">
                    <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/80 font-medium text-secondary-foreground border-none">
                      {p.partner_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground px-4 py-4 whitespace-nowrap">{p.intervention_domain || "—"}</TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground px-4 py-4 whitespace-nowrap">{p.region || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground px-4 py-4 whitespace-nowrap">{p.country || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm px-4 py-4">
                    <div className="font-medium text-foreground whitespace-nowrap">{p.contact_name || "—"}</div>
                    {p.email && <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">{p.email}</div>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell px-4 py-4">
                    {p.follow_up_status ? (
                      <Badge variant="outline" className={`font-medium border-transparent shadow-sm whitespace-nowrap ${FOLLOW_UP_COLORS[p.follow_up_status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {p.follow_up_status}
                      </Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm px-4 py-4">
                    {p.relational_score ? (
                      <div className="flex items-center gap-1 font-medium">
                        <span className="text-primary">{p.relational_score}</span><span className="text-muted-foreground text-xs">/10</span>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell text-sm text-muted-foreground px-4 py-4 whitespace-nowrap">{p.internal_manager || "—"}</TableCell>
                  <TableCell className="text-right px-4 py-4">
                    <div className="inline-flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label="Modifier" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Supprimer" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl border-none shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">Supprimer {p.name} ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-base mt-2">
                              Cette action est irréversible. Toutes les données associées à ce partenaire seront définitivement effacées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6 gap-3">
                            <AlertDialogCancel className="rounded-lg shadow-sm">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                              deleteMut.mutate(p.id, {
                                onSuccess: () => toast.success("Partenaire supprimé"),
                                onError: () => toast.error("Erreur lors de la suppression")
                              });
                            }} className="bg-destructive hover:bg-destructive/90 rounded-lg shadow-sm text-destructive-foreground">
                              Supprimer
                            </AlertDialogAction>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card/50">
            <div className="text-sm font-medium text-muted-foreground">
              Affichage de {((currentPage - 1) * PAGE_SIZE) + 1} à {Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg shadow-sm h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg shadow-sm h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-primary">Modifier {editing?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">Mettez à jour les informations du partenaire {editing?.partner_code}.</p>
          </DialogHeader>
          {editing && (
            <div className="p-6 pt-0">
              <PartnerForm defaultValues={editing} onSubmit={handleUpdate} submitting={updateMut.isPending} submitLabel="Enregistrer les modifications" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}