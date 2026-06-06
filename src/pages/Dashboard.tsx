// Dashboard.tsx - redesigned
import { useMemo, useState } from "react";
import { usePartners } from "@/hooks/use-partners";
import { MOROCCO_REGIONS, type Partner } from "@/data/partners";
import { PartnersMap } from "@/components/partners-map";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, LineChart, Line, Area, AreaChart,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, TrendingUp, AlertCircle, Filter as FilterIcon, Sparkles } from "lucide-react";

const ALL = "__all__";

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

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 40%, #0a1628 70%, #061020 100%)",
      padding: "24px",
      fontFamily: "sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,180,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 28, padding: "16px 24px",
          background: "rgba(0,140,255,0.05)",
          border: "1px solid rgba(0,180,255,0.15)",
          borderRadius: 12,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(0,180,255,0.15)",
              border: "1px solid rgba(0,180,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles style={{ width: 20, height: 20, color: "#00b4ff" }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#e0f4ff", letterSpacing: "0.2em", textTransform: "uppercase" }}>
               TABLEAU DE BORD PARTENAIRES
              </h1>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(120,200,255,0.6)", letterSpacing: "0.15em" }}>
                VISUALISATION · PARTENAIRES · DASHBOARD
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 12, color: "rgba(120,200,255,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5a0", display: "inline-block" }} />
              {filtered.length} partenaires actifs
            </span>
            <span style={{ fontSize: 14, color: "#00b4ff", fontWeight: 500 }}>
              {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "INDICATEUR  1", sublabel: "Total Partenaires", value: stats.total.toLocaleString(), color: "#00b4ff", icon: <Users style={{ width: 18, height: 18 }} /> },
            { label: "INDICATEUR  2", sublabel: "Partenaires Actifs", value: stats.actifs.toLocaleString(), color: "#00e5a0", icon: <CheckCircle2 style={{ width: 18, height: 18 }} /> },
            { label: "INDICATEUR  3", sublabel: "Score Moyen", value: stats.avgScore, color: "#a78bfa", icon: <TrendingUp style={{ width: 18, height: 18 }} /> },
            { label: "INDICATEUR  4", sublabel: "Cas Critiques", value: stats.critiques, color: "#f97316", icon: <AlertCircle style={{ width: 18, height: 18 }} /> },
          ].map((kpi, i) => (
            <div key={i} style={{
              background: "rgba(5,20,40,0.7)",
              border: `1px solid ${kpi.color}30`,
              borderTop: `2px solid ${kpi.color}`,
              borderRadius: 10,
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${kpi.color}08` }} />
              <div style={{ fontSize: 11, color: "rgba(150,200,255,0.6)", letterSpacing: "0.12em", marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, letterSpacing: "0.02em", marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(180,220,255,0.5)" }}>{kpi.sublabel}</div>
              <div style={{ position: "absolute", bottom: 12, right: 12, color: `${kpi.color}60` }}>{kpi.icon}</div>
            </div>
          ))}
        </div>

        {/* Main layout: 3 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 16, marginBottom: 16 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PanelBox title="Répartition par type" accent="#00b4ff">
              <div style={{ height: 160 }}>
                {stats.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.byType.map((d, i) => ({ ...d, idx: i + 1 }))}>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00b4ff" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#00b4ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: "rgba(120,200,255,0.5)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid #00b4ff40", borderRadius: 6, fontSize: 11, color: "#e0f4ff" }} />
                      <Area type="monotone" dataKey="value" stroke="#00b4ff" strokeWidth={1.5} fill="url(#grad1)" dot={{ fill: "#00b4ff", r: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <LegendDot color="#00b4ff" label="Série 1" />
                <LegendDot color="#00e5a0" label="Série 2" />
              </div>
            </PanelBox>

            <PanelBox title="État des partenariats" accent="#00e5a0">
              <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                <div><span style={{ fontSize: 10, color: "rgba(120,200,255,0.5)" }}>Total</span> <span style={{ fontSize: 14, fontWeight: 600, color: "#00e5a0" }}>{stats.total.toLocaleString()}</span></div>
                <div><span style={{ fontSize: 10, color: "rgba(120,200,255,0.5)" }}>Actifs</span> <span style={{ fontSize: 14, fontWeight: 600, color: "#00b4ff" }}>{stats.actifs.toLocaleString()}</span></div>
              </div>
              <div style={{ height: 120 }}>
                {stats.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.byStatus}>
                      <XAxis dataKey="name" tick={{ fill: "rgba(120,200,255,0.4)", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid #00e5a040", borderRadius: 6, fontSize: 11, color: "#e0f4ff" }} />
                      <Line type="monotone" dataKey="value" stroke="#00e5a0" strokeWidth={1.5} dot={{ fill: "#00e5a0", r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </PanelBox>

            <PanelBox title="Derniers partenaires" accent="#a78bfa">
              <div style={{ fontSize: 11, color: "rgba(120,200,255,0.5)", marginBottom: 8 }}>Liste des partenaires</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(partners || []).slice(0, 5).map((p, i) => (
                  <div key={p.id} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "5px 8px",
                    background: i === 2 ? "rgba(0,180,255,0.08)" : "transparent",
                    borderRadius: 4, fontSize: 10, color: "rgba(180,220,255,0.7)",
                    border: i === 2 ? "1px solid rgba(0,180,255,0.2)" : "1px solid transparent",
                  }}>
                    <span style={{ fontFamily: "monospace", color: "rgba(120,200,255,0.5)" }}>{String(i + 1).padStart(3, "0")}</span>
                    <span style={{ flex: 1, marginLeft: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name.slice(0, 16)}
                    </span>
                    <span style={{ color: "rgba(120,200,255,0.4)", fontSize: 9 }}>2023-05-16</span>
                  </div>
                ))}
              </div>
            </PanelBox>
          </div>

          {/* Center: Map */}
          <div style={{
            background: "rgba(5,15,35,0.8)",
            border: "1px solid rgba(0,180,255,0.15)",
            borderRadius: 12,
            overflow: "hidden",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(0,180,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(150,200,255,0.8)", letterSpacing: "0.12em" }}>
                🗺 CARTE GÉOGRAPHIQUE — RÉSEAU PARTENAIRES
              </span>
              <span style={{ fontSize: 10, color: "rgba(0,180,255,0.6)" }}>{filtered.length} pts</span>
            </div>
            <div style={{ padding: 12 }}>
              <PartnersMap partners={filtered} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PanelBox title="Indicateurs clés" accent="#a78bfa">
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
                {[
                  { pct: 65, val: stats.total, label: "Catégorie" },
                  { pct: 32, val: stats.actifs, label: "Catégorie" },
                ].map((d, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <RingGauge pct={d.pct} color={i === 0 ? "#00b4ff" : "#a78bfa"} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? "#00b4ff" : "#a78bfa", marginTop: 4 }}>{d.val}</div>
                    <div style={{ fontSize: 9, color: "rgba(120,200,255,0.5)" }}>{d.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Série 1", "Série 2", "Série 3"].map((label, i) => {
                  const pct = [78, 61, 47][i];
                  const colors = ["#00b4ff", "#00e5a0", "#a78bfa"];
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "rgba(150,200,255,0.6)" }}>{label}</span>
                        <span style={{ fontSize: 10, color: colors[i] }}>{pct}%</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: colors[i], borderRadius: 2, transition: "width 0.8s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </PanelBox>

            <PanelBox title="Répartition régionale" accent="#00e5a0">
              <div style={{ fontSize: 10, color: "rgba(120,200,255,0.5)", marginBottom: 8 }}>Taux d'analyse   40%</div>
              <div style={{ height: 140 }}>
                {stats.byRegion.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byRegion.slice(0, 6)}>
                      <defs>
                        <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00b4ff" />
                          <stop offset="100%" stopColor="#00b4ff" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: "rgba(120,200,255,0.4)", fontSize: 8 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "#0d1b2e", border: "1px solid #00b4ff40", borderRadius: 6, fontSize: 11, color: "#e0f4ff" }} />
                      <Bar dataKey="value" fill="url(#barG)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </PanelBox>

            <PanelBox title="Statistiques globales" accent="#f97316">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "Total", val: stats.total, change: "+28%", pos: true },
                  { label: "Actifs", val: stats.actifs, change: "+18%", pos: true },
                  { label: "Critiques", val: stats.critiques, change: "+56%", pos: false },
                  { label: "Score", val: stats.avgScore, change: "-7%", pos: false },
                ].map((d, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e0f4ff" }}>{d.val.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: d.pos ? "#00e5a0" : "#f97316" }}>{d.change}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00b4ff", flexShrink: 0 }} />
                <div style={{ height: 1, flex: 1, background: "rgba(0,180,255,0.25)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e5a0", flexShrink: 0 }} />
                <div style={{ height: 1, flex: 1, background: "rgba(0,229,160,0.25)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />
              </div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <InputBar placeholder="Champ de saisie d'information" />
                <InputBar placeholder="Champ de saisie d'information" />
              </div>
            </PanelBox>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 40, padding: "14px 0",
          borderTop: "1px solid rgba(0,180,255,0.1)",
        }}>
          {["Tableau de bord", "Partenaires", "Analyses", "Paramètres"].map((label, i) => (
            <button key={i} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: i === 0 ? "#00b4ff" : "rgba(150,200,255,0.5)",
              letterSpacing: "0.1em", padding: "4px 12px",
              borderBottom: i === 0 ? "1px solid #00b4ff" : "1px solid transparent",
              transition: "color 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Filters (below nav, compact) */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", padding: "12px 0",
          alignItems: "center",
        }}>
          <FilterIcon style={{ width: 14, height: 14, color: "rgba(0,180,255,0.6)" }} />
          {[
            { val: type, set: setType, opts: partners ? Array.from(new Set(partners.map(p => p.partner_type))) : [], ph: "Type" },
            { val: region, set: setRegion, opts: [...MOROCCO_REGIONS], ph: "Région" },
            { val: status, set: setStatus, opts: partners ? Array.from(new Set(partners.map(p => p.partnership_status))) : [], ph: "Statut" },
            { val: follow, set: setFollow, opts: partners ? Array.from(new Set(partners.map(p => p.follow_up_status))) : [], ph: "Suivi" },
          ].map((f, i) => (
            <Select key={i} value={f.val} onValueChange={f.set}>
              <SelectTrigger style={{
                width: 160, height: 32, fontSize: 11,
                background: "rgba(0,140,255,0.06)",
                border: "1px solid rgba(0,180,255,0.2)",
                color: "rgba(150,200,255,0.8)",
                borderRadius: 6,
              }}>
                <SelectValue placeholder={f.ph} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{f.ph} — Tous</SelectItem>
                {f.opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          <button onClick={reset} style={{
            fontSize: 11, color: "rgba(0,180,255,0.7)",
            background: "none", border: "1px solid rgba(0,180,255,0.2)",
            borderRadius: 6, padding: "4px 12px", cursor: "pointer",
          }}>Réinitialiser</button>
        </div>

      </div>
    </div>
  );
}

function PanelBox({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(5,15,35,0.75)",
      border: `1px solid ${accent}20`,
      borderTop: `2px solid ${accent}60`,
      borderRadius: 10,
      padding: "12px 14px",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
        color: accent, marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block" }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function RingGauge({ pct, color }: { pct: number; color: string }) {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
      <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)" />
      <text x={28} y={32} textAnchor="middle" fontSize={10} fontWeight={600} fill={color}>{pct}%</text>
    </svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 9, color: "rgba(120,200,255,0.5)" }}>{label}</span>
    </div>
  );
}

function EmptyChart() {
  return <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(120,200,255,0.2)", fontSize: 11 }}>Chargement…</div>;
}

function InputBar({ placeholder }: { placeholder: string }) {
  return (
    <div style={{
      height: 24, borderRadius: 4, border: "1px solid rgba(0,180,255,0.2)",
      background: "rgba(0,140,255,0.04)", padding: "0 8px",
      display: "flex", alignItems: "center",
    }}>
      <span style={{ fontSize: 9, color: "rgba(120,200,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{placeholder}</span>
    </div>
  );
}