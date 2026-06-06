import { useEffect, useRef, useState } from "react";
import type { Partner } from "@/data/partners";

const STATUS_COLOR: Record<string, string> = {
  Actif: "#16a34a",
  Prospect: "#0ea5e9",
  "En négociation": "#f59e0b",
  Suspendu: "#dc2626",
  Archivé: "#6b7280",
};

// City/region coordinates for Morocco (precise), Europe, Asia
const REGION_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  // Morocco regions
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
  // Europe
  "Île-de-France": { lat: 48.85, lng: 2.35, label: "Paris" },
  "Cataluña": { lat: 41.38, lng: 2.17, label: "Barcelone" },
  "Lombardia": { lat: 45.46, lng: 9.19, label: "Milan" },
  "Brussels": { lat: 50.85, lng: 4.35, label: "Bruxelles" },
  // Asia
  "Tokyo": { lat: 35.68, lng: 139.69, label: "Tokyo" },
  "Dubai": { lat: 25.20, lng: 55.27, label: "Dubaï" },
  "Beijing": { lat: 39.91, lng: 116.39, label: "Pékin" },
};

// Mercator projection helpers
function toXY(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (h / 2) - (w * mercN) / (2 * Math.PI);
  return { x, y };
}

// Zoom presets
const VIEWS = {
  maroc: { label: "Maroc", minLng: -17.5, maxLng: -1.0, minLat: 20.5, maxLat: 36.5 },
  europe: { label: "Europe", minLng: -11, maxLng: 25, minLat: 34, maxLat: 56 },
  monde: { label: "Monde", minLng: -20, maxLng: 150, minLat: 18, maxLat: 58 },
};

type ViewKey = keyof typeof VIEWS;

// Map bounding box to SVG coords
function project(lat: number, lng: number, view: typeof VIEWS[ViewKey], svgW: number, svgH: number) {
  const W = 1000, H = 1000;
  const full = toXY(lat, lng, W, H);
  const topLeft = toXY(view.maxLat, view.minLng, W, H);
  const bottomRight = toXY(view.minLat, view.maxLng, W, H);
  const scaleX = svgW / (bottomRight.x - topLeft.x);
  const scaleY = svgH / (bottomRight.y - topLeft.y);
  return {
    x: (full.x - topLeft.x) * scaleX,
    y: (full.y - topLeft.y) * scaleY,
  };
}

type TooltipState = { x: number; y: number; partner: Partner } | null;

export function PartnersMap({ partners }: { partners: Partner[] }) {
  const [view, setView] = useState<ViewKey>("maroc");
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const SVG_W = 820;
  const SVG_H = 520;

  // Load Morocco topology + world countries
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((r) => r.json()),
    ]).then(([world]) => {
      setWorldData(world);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Convert topojson features to SVG path strings
  const [paths, setPaths] = useState<{ d: string; id: string; isMarocco: boolean }[]>([]);

  useEffect(() => {
    if (!worldData) return;
    const script1 = document.createElement("script");
    script1.src = "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js";
    script1.onload = () => {
      const topojson = (window as any).topojson;
      if (!topojson) return;
      const features = topojson.feature(worldData, worldData.objects.countries).features;
      const currentView = VIEWS[view];

      const newPaths: { d: string; id: string; isMarocco: boolean }[] = [];

      features.forEach((f: any) => {
        const isMarocco = f.id === "504";
        const geom = f.geometry;
        if (!geom) return;

        const polygons =
          geom.type === "Polygon"
            ? [geom.coordinates]
            : geom.type === "MultiPolygon"
            ? geom.coordinates
            : [];

        let d = "";
        for (const poly of polygons) {
          for (const ring of poly) {
            let move = true;
            for (const [lng, lat] of ring) {
              if (
                lng < currentView.minLng - 5 || lng > currentView.maxLng + 5 ||
                lat < currentView.minLat - 5 || lat > currentView.maxLat + 5
              ) { move = true; continue; }
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
    document.head.appendChild(script1);
    return () => { document.head.removeChild(script1); };
  }, [worldData, view]);

  // Group partners by region for bubble sizing
  const regionCounts = partners.reduce<Record<string, { count: number; partners: Partner[] }>>((acc, p) => {
    const key = p.region;
    if (!acc[key]) acc[key] = { count: 0, partners: [] };
    acc[key].count++;
    acc[key].partners.push(p);
    return acc;
  }, {});

  const maxCount = Math.max(1, ...Object.values(regionCounts).map((v) => v.count));

  const currentView = VIEWS[view];

  return (
    <div className="flex flex-col gap-3">
      {/* View switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground">Vue :</span>
        {(Object.keys(VIEWS) as ViewKey[]).map((k) => (
          <button
            key={k}
            onClick={() => { setView(k); setTooltip(null); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
              view === k
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : "bg-background text-muted-foreground border-muted-foreground/20 hover:bg-muted"
            }`}
          >
            {VIEWS[k].label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {partners.length} partenaire(s) affiché(s)
        </span>
      </div>

      {/* Map */}
      <div className="relative w-full rounded-xl border bg-[#e8f4f8] overflow-hidden" style={{ height: 520 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#e8f4f8] z-10">
            <div className="text-sm text-muted-foreground animate-pulse">Chargement de la carte…</div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          height="100%"
          style={{ display: "block" }}
        >
          {/* Ocean */}
          <rect width={SVG_W} height={SVG_H} fill="#c8dff0" />

          {/* Countries */}
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill={p.isMarocco ? "#b8cfa0" : "#d6e4c2"}
              stroke={p.isMarocco ? "#5a8a3a" : "#a0b88a"}
              strokeWidth={p.isMarocco ? 1.2 : 0.5}
            />
          ))}

          {/* Region bubbles */}
          {Object.entries(regionCounts).map(([region, { count, partners: rPartners }]) => {
            const coords = REGION_COORDS[region];
            if (!coords) return null;

            // Check visibility in current view
            if (
              coords.lng < currentView.minLng - 2 || coords.lng > currentView.maxLng + 2 ||
              coords.lat < currentView.minLat - 2 || coords.lat > currentView.maxLat + 2
            ) return null;

            const { x, y } = project(coords.lat, coords.lng, currentView, SVG_W, SVG_H);
            if (x < -20 || x > SVG_W + 20 || y < -20 || y > SVG_H + 20) return null;

            const r = Math.max(10, Math.min(28, 10 + (count / maxCount) * 18));

            // Dominant status color
            const statusCounts = rPartners.reduce<Record<string, number>>((acc, p) => {
              acc[p.partnership_status] = (acc[p.partnership_status] || 0) + 1;
              return acc;
            }, {});
            const dominantStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Actif";
            const fill = STATUS_COLOR[dominantStatus] ?? "#0ea5e9";

            return (
              <g
                key={region}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, partner: rPartners[0] });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Glow ring */}
                <circle cx={x} cy={y} r={r + 5} fill={fill} opacity={0.18} />
                {/* Main bubble */}
                <circle cx={x} cy={y} r={r} fill={fill} opacity={0.88} stroke="white" strokeWidth={2} />
                {/* Count */}
                <text
                  x={x} y={y}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={r > 16 ? 12 : 10} fontWeight="700" fill="white"
                >
                  {count}
                </text>
                {/* Label — show for Morocco view */}
                {view === "maroc" && (
                  <text
                    x={x} y={y + r + 9}
                    textAnchor="middle" dominantBaseline="hanging"
                    fontSize={9} fontWeight="600"
                    fill="#1e3a1e"
                    style={{ textShadow: "0 0 3px white" }}
                  >
                    {coords.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 rounded-xl bg-background/97 shadow-xl border px-3 py-2.5 text-xs pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 12, SVG_W - 180),
              top: tooltip.y - 10,
              minWidth: 160,
            }}
          >
            {(() => {
              const region = tooltip.partner.region;
              const rData = regionCounts[region];
              const statuses = rData?.partners.reduce<Record<string, number>>((acc, p) => {
                acc[p.partnership_status] = (acc[p.partnership_status] || 0) + 1;
                return acc;
              }, {}) ?? {};
              return (
                <>
                  <div className="font-semibold text-sm mb-1">{REGION_COORDS[region]?.label ?? region}</div>
                  <div className="text-muted-foreground mb-2 text-[10px]">{region}</div>
                  <div className="font-medium mb-1">{rData?.count ?? 0} partenaire(s)</div>
                  <div className="space-y-0.5">
                    {Object.entries(statuses).map(([s, n]) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                        <span>{s}: {n}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 rounded-xl bg-background/95 px-3 py-2.5 text-xs shadow border">
          <div className="font-semibold mb-1.5 text-foreground">Statut dominant</div>
          {Object.entries(STATUS_COLOR).map(([k, c]) => (
            <div key={k} className="flex items-center gap-2 mb-0.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
              <span className="text-muted-foreground">{k}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-1.5 text-muted-foreground">
            <span className="font-medium">Taille</span> = nb de partenaires
          </div>
        </div>

        {/* Morocco highlight badge */}
        {view === "maroc" && (
          <div className="absolute top-3 right-3 rounded-xl bg-emerald-600/90 text-white px-3 py-1.5 text-xs font-semibold shadow">
            🇲🇦 Carte du Maroc — {partners.filter(p =>
              Object.keys(REGION_COORDS).slice(0, 12).includes(p.region)
            ).length} partenaires
          </div>
        )}
      </div>
    </div>
  );
}