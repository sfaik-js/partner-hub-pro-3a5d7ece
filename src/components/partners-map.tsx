// partners-map.tsx — redesigned sci-fi style
import { useEffect, useRef, useState } from "react";
import type { Partner } from "@/data/partners";

const STATUS_COLOR: Record<string, string> = {
  Actif: "#00e5a0",
  Prospect: "#00b4ff",
  "En négociation": "#f59e0b",
  Suspendu: "#f97316",
  Archivé: "#888",
};

const REGION_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  "Tanger-Tétouan-Al Hoceïma": { lat: 35.76, lng: -5.83, label: "Tanger" },
  "L'Oriental": { lat: 34.68, lng: -1.91, label: "Oujda" },
  "Fès-Meknès": { lat: 34.02, lng: -5.01, label: "Fès" },
  "Rabat-Salé-Kénitra": { lat: 34.02, lng: -6.84, label: "Rabat" },
  "Béni Mellal-Khénifra": { lat: 32.34, lng: -6.35, label: "Béni Mellal" },
  "Casablanca-Settat": { lat: 33.57, lng: -7.59, label: "Casablanca" },
  "Marrakech-Safi": { lat: 31.63, lng: -7.98, label: "Marrakech" },
  "Drâa-Tafilalet": { lat: 31.93, lng: -4.42, label: "Errachidia" },
  "Souss-Massa": { lat: 30.43, lng: -9.60, label: "Agadir" },
  "Guelmim-Oued Noun": { lat: 28.99, lng: -10.06, label: "Guelmim" },
  "Laâyoune-Sakia El Hamra": { lat: 27.15, lng: -13.20, label: "Laâyoune" },
  "Dakhla-Oued Ed-Dahab": { lat: 23.68, lng: -15.96, label: "Dakhla" },
  "Île-de-France": { lat: 48.85, lng: 2.35, label: "Paris" },
  "Cataluña": { lat: 41.38, lng: 2.17, label: "Barcelone" },
  "Lombardia": { lat: 45.46, lng: 9.19, label: "Milan" },
  "Brussels": { lat: 50.85, lng: 4.35, label: "Bruxelles" },
  "Tokyo": { lat: 35.68, lng: 139.69, label: "Tokyo" },
  "Dubai": { lat: 25.20, lng: 55.27, label: "Dubaï" },
  "Beijing": { lat: 39.91, lng: 116.39, label: "Pékin" },
};

function toXY(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (h / 2) - (w * mercN) / (2 * Math.PI);
  return { x, y };
}

const VIEWS = {
  maroc: { label: "Maroc", minLng: -17.5, maxLng: -1.0, minLat: 20.5, maxLat: 36.5 },
  europe: { label: "Europe", minLng: -11, maxLng: 25, minLat: 34, maxLat: 56 },
  monde: { label: "Monde", minLng: -20, maxLng: 150, minLat: 18, maxLat: 58 },
};

type ViewKey = keyof typeof VIEWS;

function project(lat: number, lng: number, view: typeof VIEWS[ViewKey], svgW: number, svgH: number) {
  const W = 1000, H = 1000;
  const full = toXY(lat, lng, W, H);
  const topLeft = toXY(view.maxLat, view.minLng, W, H);
  const bottomRight = toXY(view.minLat, view.maxLng, W, H);
  const scaleX = svgW / (bottomRight.x - topLeft.x);
  const scaleY = svgH / (bottomRight.y - topLeft.y);
  return { x: (full.x - topLeft.x) * scaleX, y: (full.y - topLeft.y) * scaleY };
}

type TooltipState = { x: number; y: number; partner: Partner } | null;

export function PartnersMap({ partners }: { partners: Partner[] }) {
  const [view, setView] = useState<ViewKey>("maroc");
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const SVG_W = 820, SVG_H = 480;

  useEffect(() => {
    setLoading(true);
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(world => { setWorldData(world); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [paths, setPaths] = useState<{ d: string; id: string; isMarocco: boolean }[]>([]);

  useEffect(() => {
    if (!worldData) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js";
    script.onload = () => {
      const topojson = (window as any).topojson;
      if (!topojson) return;
      const features = topojson.feature(worldData, worldData.objects.countries).features;
      const currentView = VIEWS[view];
      const newPaths: { d: string; id: string; isMarocco: boolean }[] = [];
      features.forEach((f: any) => {
        const isMarocco = f.id === "504";
        const geom = f.geometry;
        if (!geom) return;
        const polygons = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
        let d = "";
        for (const poly of polygons) {
          for (const ring of poly) {
            let move = true;
            for (const [lng, lat] of ring) {
              if (lng < currentView.minLng - 5 || lng > currentView.maxLng + 5 || lat < currentView.minLat - 5 || lat > currentView.maxLat + 5) { move = true; continue; }
              const { x, y } = project(lat, lng, currentView, SVG_W, SVG_H);
              d += move ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`;
              move = false;
            }
            if (!move) d += "Z";
          }
        }
        if (d) newPaths.push({ d, id: f.id, isMarocco });
      });
      setPaths(newPaths);
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, [worldData, view]);

  const regionCounts = partners.reduce<Record<string, { count: number; partners: Partner[] }>>((acc, p) => {
    if (!acc[p.region]) acc[p.region] = { count: 0, partners: [] };
    acc[p.region].count++;
    acc[p.region].partners.push(p);
    return acc;
  }, {});

  const maxCount = Math.max(1, ...Object.values(regionCounts).map(v => v.count));
  const currentView = VIEWS[view];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* View switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: "rgba(0,180,255,0.5)", letterSpacing: "0.1em" }}>Vue</span>
        {(Object.keys(VIEWS) as ViewKey[]).map((k) => (
          <button key={k} onClick={() => { setView(k); setTooltip(null); }} style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
            background: view === k ? "rgba(0,180,255,0.15)" : "transparent",
            border: view === k ? "1px solid rgba(0,180,255,0.5)" : "1px solid rgba(0,180,255,0.15)",
            color: view === k ? "#00b4ff" : "rgba(120,200,255,0.5)",
            transition: "all 0.2s",
          }}>{VIEWS[k].label}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(0,180,255,0.4)" }}>{partners.length} pts</span>
      </div>

      {/* Map SVG */}
      <div style={{
        position: "relative", borderRadius: 8,
        border: "1px solid rgba(0,180,255,0.15)",
        background: "rgba(0,10,25,0.9)",
        overflow: "hidden",
      }}>
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,180,255,0.015) 0px, rgba(0,180,255,0.015) 1px, transparent 1px, transparent 3px)",
        }} />

        {loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,10,25,0.9)", zIndex: 10, fontSize: 11, color: "rgba(0,180,255,0.6)",
          }}>
            <span>载入地图中…</span>
          </div>
        )}

        <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="100%"
          style={{ display: "block", height: 480 }}>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#010a1a" />

          {/* Grid lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * SVG_W / 11} y1={0} x2={(i + 1) * SVG_W / 11} y2={SVG_H}
              stroke="rgba(0,180,255,0.04)" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * SVG_H / 7} x2={SVG_W} y2={(i + 1) * SVG_H / 7}
              stroke="rgba(0,180,255,0.04)" strokeWidth={0.5} />
          ))}

          {/* Countries */}
          {paths.map((p) => (
            <path key={p.id} d={p.d}
              fill={p.isMarocco ? "rgba(0,100,200,0.25)" : "rgba(0,60,120,0.12)"}
              stroke={p.isMarocco ? "rgba(0,180,255,0.5)" : "rgba(0,120,200,0.2)"}
              strokeWidth={p.isMarocco ? 0.8 : 0.4}
            />
          ))}

          {/* Connection lines from Morocco to other regions */}
          {view !== "maroc" && (() => {
            const moroccoCenter = project(32, -7, currentView, SVG_W, SVG_H);
            return Object.entries(regionCounts).map(([region, { count }]) => {
              const coords = REGION_COORDS[region];
              if (!coords || region.startsWith("Tanger") || region.startsWith("Fès") || region.startsWith("Marrakech") || region.startsWith("Casablanca") || region.startsWith("Rabat") || region.startsWith("Souss") || region.startsWith("Drâa") || region.startsWith("L'Or") || region.startsWith("Béni") || region.startsWith("Guelmim") || region.startsWith("Laâ") || region.startsWith("Dakhla")) return null;
              const pt = project(coords.lat, coords.lng, currentView, SVG_W, SVG_H);
              if (pt.x < 0 || pt.x > SVG_W || pt.y < 0 || pt.y > SVG_H) return null;
              return (
                <line key={region} x1={moroccoCenter.x} y1={moroccoCenter.y} x2={pt.x} y2={pt.y}
                  stroke="rgba(0,180,255,0.12)" strokeWidth={0.8} strokeDasharray="4 6" />
              );
            });
          })()}

          {/* Region bubbles */}
          {Object.entries(regionCounts).map(([region, { count, partners: rPartners }]) => {
            const coords = REGION_COORDS[region];
            if (!coords) return null;
            if (coords.lng < currentView.minLng - 2 || coords.lng > currentView.maxLng + 2 ||
              coords.lat < currentView.minLat - 2 || coords.lat > currentView.maxLat + 2) return null;
            const { x, y } = project(coords.lat, coords.lng, currentView, SVG_W, SVG_H);
            if (x < -20 || x > SVG_W + 20 || y < -20 || y > SVG_H + 20) return null;
            const r = Math.max(8, Math.min(24, 8 + (count / maxCount) * 16));
            const statusCounts = rPartners.reduce<Record<string, number>>((acc, p) => {
              acc[p.partnership_status] = (acc[p.partnership_status] || 0) + 1; return acc;
            }, {});
            const dominantStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Actif";
            const fill = STATUS_COLOR[dominantStatus] ?? "#00b4ff";

            return (
              <g key={region} style={{ cursor: "pointer" }}
                onClick={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, partner: rPartners[0] });
                }}
                onMouseLeave={() => setTooltip(null)}>
                {/* Pulse ring */}
                <circle cx={x} cy={y} r={r + 8} fill="none" stroke={fill} strokeWidth={0.5} opacity={0.2} />
                <circle cx={x} cy={y} r={r + 4} fill="none" stroke={fill} strokeWidth={0.8} opacity={0.35} />
                {/* Main bubble */}
                <circle cx={x} cy={y} r={r} fill={`${fill}22`} stroke={fill} strokeWidth={1.2} />
                {/* Inner dot */}
                <circle cx={x} cy={y} r={r * 0.35} fill={fill} opacity={0.9} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={r > 14 ? 9 : 8} fontWeight="600" fill="white">{count}</text>
                {view === "maroc" && (
                  <text x={x} y={y + r + 10} textAnchor="middle" dominantBaseline="hanging"
                    fontSize={8} fill={fill} opacity={0.8}>{coords.label}</text>
                )}
                {/* Callout box for selected regions */}
                {count >= 3 && (
                  <>
                    <line x1={x} y1={y - r - 2} x2={x} y2={y - r - 16} stroke={fill} strokeWidth={0.6} opacity={0.6} />
                    <rect x={x - 22} y={y - r - 30} width={44} height={12} rx={3}
                      fill="rgba(5,15,35,0.85)" stroke={`${fill}40`} strokeWidth={0.5} />
                    <text x={x} y={y - r - 22} textAnchor="middle" dominantBaseline="middle"
                      fontSize={8} fill={fill}>{count} sites</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (() => {
          const region = tooltip.partner.region;
          const rData = regionCounts[region];
          const statuses = rData?.partners.reduce<Record<string, number>>((acc, p) => {
            acc[p.partnership_status] = (acc[p.partnership_status] || 0) + 1; return acc;
          }, {}) ?? {};
          return (
            <div style={{
              position: "absolute", zIndex: 20,
              left: Math.min(tooltip.x + 14, SVG_W - 180),
              top: tooltip.y - 10,
              minWidth: 160,
              background: "rgba(5,15,35,0.95)",
              border: "1px solid rgba(0,180,255,0.3)",
              borderRadius: 8,
              padding: "10px 12px",
              pointerEvents: "none",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#e0f4ff", marginBottom: 2 }}>{REGION_COORDS[region]?.label ?? region}</div>
              <div style={{ fontSize: 9, color: "rgba(120,200,255,0.5)", marginBottom: 6 }}>{region}</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#00b4ff", marginBottom: 6 }}>{rData?.count ?? 0} partenaire(s)</div>
              {Object.entries(statuses).map(([s, n]) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(150,200,255,0.7)", marginBottom: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[s], display: "inline-block", flexShrink: 0 }} />
                  {s}: {n}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 10, left: 10, zIndex: 5,
          background: "rgba(5,15,35,0.9)",
          border: "1px solid rgba(0,180,255,0.15)",
          borderRadius: 8, padding: "8px 10px",
          backdropFilter: "blur(6px)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(0,180,255,0.7)", marginBottom: 6, letterSpacing: "0.1em" }}>STATUT</div>
          {Object.entries(STATUS_COLOR).map(([k, c]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block" }} />
              <span style={{ fontSize: 9, color: "rgba(150,200,255,0.6)" }}>{k}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(0,180,255,0.1)", marginTop: 4, paddingTop: 4, fontSize: 9, color: "rgba(120,200,255,0.4)" }}>
            <span style={{ color: "rgba(0,180,255,0.6)" }}>●</span> taille = nb partenaires
          </div>
        </div>

        {view === "maroc" && (
          <div style={{
            position: "absolute", top: 10, right: 10, zIndex: 5,
            background: "rgba(0,60,120,0.4)",
            border: "1px solid rgba(0,180,255,0.3)",
            borderRadius: 6, padding: "4px 10px",
            fontSize: 10, color: "#00b4ff",
          }}>
            🇲🇦 Maroc — {partners.filter(p => Object.keys(REGION_COORDS).slice(0, 12).includes(p.region)).length} pts
          </div>
        )}
      </div>
    </div>
  );
}