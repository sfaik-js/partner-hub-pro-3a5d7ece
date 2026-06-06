import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, TrendingUp, AlertCircle, Filter as FilterIcon, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid,
} from "recharts";
import { usePartners } from "@/hooks/use-partners";
import { MOROCCO_REGIONS, type Partner } from "@/data/partners";
import { PartnersMap } from "@/components/partners-map";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Partenaires" }, { name: "description", content: "Vue d'ensemble du réseau de partenaires" }] }),
  component: DashboardPage,
});

const PIE_COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
const ALL = "__all__";

type StatProps = {
  icon: typeof Users;
  label: string;
  value: string | number;
  gradient: string;
  trend?: string;
};

function StatCard({ icon: Icon, label, value, gradient, trend }: StatProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 h-16 w-16 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-90">{label}</p>
          <p className="mt-2 text-4xl font-bold">{value}</p>
          {trend && <p className="mt-1 text-xs opacity-90">{trend}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: partners, isLoading } = usePartners();
  const [type, setType] = useState<string>(ALL);
  const [region, setRegion] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [follow, setFollow] = useState<string>(ALL);

  const filtered = useMemo<Partner[]>(() => {
    if (!partners) return [];
    return partners.filter((p) =>
      (type === ALL || p.partner_type === type) &&
      (region === ALL || p.region === region) &&
      (status === ALL || p.partnership_status === status) &&
      (follow === ALL || p.follow_up_status === follow)
    );
  }, [partners, type, region, status, follow]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const actifs = filtered.filter((p) => p.partnership_status === "Actif").length;
    const critiques = filtered.filter((p) => p.follow_up_status === "Critique").length;
    const avgScore = total ? Math.round(filtered.reduce((s, p) => s + p.relation_score, 0) / total) : 0;

    const group = (key: (p: Partner) => string) => Object.entries(
      filtered.reduce<Record<string, number>>((acc, p) => { const k = key(p); acc[k] = (acc[k] || 0) + 1; return acc; }, {})
    ).map(([name, value]) => ({ name, value }));

    const byType = group((p) => p.partner_type);
    const byStatus = group((p) => p.partnership_status);
    const byRegion = group((p) => p.region).sort((a, b) => b.value - a.value);

    const domains = ["strategique", "operationnel", "financier", "innovation"] as const;
    const byDomain = domains.map((d) => ({
      domain: d.charAt(0).toUpperCase() + d.slice(1),
      score: total ? Math.round(filtered.reduce((s, p) => s + p.domain_scores[d], 0) / total) : 0,
    }));

    return { total, actifs, critiques, avgScore, byType, byStatus, byRegion, byDomain };
  }, [filtered]);

  const reset = () => { setType(ALL); setRegion(ALL); setStatus(ALL); setFollow(ALL); };

  if (isLoading || !partners) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="container mx-auto space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto space-y-6 p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Partenaires</h1>
              <p className="text-sm text-white/80">Vue d'ensemble de votre réseau au Maroc</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur">
            <span className="font-semibold">{filtered.length}</span> partenaire(s) affiché(s)
          </div>
        </header>

        {/* Filters */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
              <FilterIcon className="h-4 w-4" /> Filtres
            </div>
            <FilterSelect value={type} onChange={setType} placeholder="Type de partenaire"
              options={Array.from(new Set(partners.map((p) => p.partner_type)))} />
            <FilterSelect value={region} onChange={setRegion} placeholder="Région"
              options={[...MOROCCO_REGIONS]} />
            <FilterSelect value={status} onChange={setStatus} placeholder="Statut partenariat"
              options={Array.from(new Set(partners.map((p) => p.partnership_status)))} />
            <FilterSelect value={follow} onChange={setFollow} placeholder="Statut de suivi"
              options={Array.from(new Set(partners.map((p) => p.follow_up_status)))} />
            <Button variant="ghost" size="sm" onClick={reset} className="ml-auto text-indigo-700 hover:bg-indigo-50">
              Réinitialiser
            </Button>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Partenaires" value={stats.total}
            gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
            trend="Réseau global" />
          <StatCard icon={CheckCircle2} label="Partenaires Actifs" value={stats.actifs}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            trend={`${stats.total ? Math.round((stats.actifs / stats.total) * 100) : 0}% du réseau`} />
          <StatCard icon={TrendingUp} label="Score Relation Moy." value={stats.avgScore}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            trend="Sur 100 points" />
          <StatCard icon={AlertCircle} label="Cas Critiques" value={stats.critiques}
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            trend="À traiter en priorité" />
        </div>

        {/* Charts grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Répartition par type de partenaire" accent="from-indigo-500 to-purple-500">
            {stats.byType.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={stats.byType} dataKey="value" nameKey="name" outerRadius={95} innerRadius={50} paddingAngle={3} label>
                    {stats.byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Distribution des statuts" accent="from-cyan-500 to-blue-500">
            {stats.byStatus.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.byStatus}>
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="url(#barGrad1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Score moyen par domaine" accent="from-pink-500 to-rose-500">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.byDomain}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Couverture géographique (top régions)" accent="from-emerald-500 to-teal-500">
            {stats.byRegion.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.byRegion.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                  <defs>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="url(#barGrad2)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Map */}
        <Card className="overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="text-base">🗺️ Carte des partenaires</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <PartnersMap partners={filtered} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={`h-6 w-1.5 rounded-full bg-gradient-to-b ${accent}`} />
          <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Empty() {
  return <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>;
}

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px] rounded-xl border-slate-200"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder} — Tous</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
