import { usePartners } from "@/hooks/use-partners";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo } from "react";

const PIE_COLORS = ["hsl(221 83% 53%)", "hsl(199 89% 48%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(280 70% 55%)", "hsl(340 75% 55%)", "hsl(180 60% 45%)", "hsl(15 80% 55%)"];

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string | number; accent: string }) {
  return (
    <Card className="shadow-card hover:shadow-elegant transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: partners, isLoading } = usePartners();

  const stats = useMemo(() => {
    if (!partners) return null;
    const total = partners.length;
    const actifs = partners.filter((p) => p.partnership_status === "Actif").length;
    const prospects = partners.filter((p) => p.partnership_status === "Prospect").length;
    const critiques = partners.filter((p) => p.follow_up_status === "Critique").length;

    const byType = Object.entries(
      partners.reduce<Record<string, number>>((acc, p) => {
        const k = p.partner_type || "Autre"; acc[k] = (acc[k] || 0) + 1; return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const byStatus = Object.entries(
      partners.reduce<Record<string, number>>((acc, p) => {
        const k = p.partnership_status || "—"; acc[k] = (acc[k] || 0) + 1; return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return { total, actifs, prospects, critiques, byType, byStatus };
  }, [partners]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre réseau de partenaires</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Partenaires totaux" value={stats.total} accent="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle2} label="Actifs" value={stats.actifs} accent="bg-success/10 text-success" />
        <StatCard icon={TrendingUp} label="Prospects" value={stats.prospects} accent="bg-accent/10 text-accent" />
        <StatCard icon={AlertCircle} label="Suivi critique" value={stats.critiques} accent="bg-destructive/10 text-destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Répartition par type</CardTitle></CardHeader>
          <CardContent className="h-72">
            {stats.byType.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {stats.byType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Statut du partenariat</CardTitle></CardHeader>
          <CardContent className="h-72">
            {stats.byStatus.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byStatus}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}