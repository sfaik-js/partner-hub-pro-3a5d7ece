export const MOROCCO_REGIONS = [
    "Tanger-Tétouan-Al Hoceïma",
    "L'Oriental",
    "Fès-Meknès",
    "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra",
    "Casablanca-Settat",
    "Marrakech-Safi",
    "Drâa-Tafilalet",
    "Souss-Massa",
    "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra",
    "Dakhla-Oued Ed-Dahab",
  ] as const;
  
  export type Region = (typeof MOROCCO_REGIONS)[number];
  export type PartnerType = "Institutionnel" | "Académique" | "ONG" | "Privé" | "International";
  export type PartnershipStatus = "Actif" | "Prospect" | "En négociation" | "Suspendu" | "Archivé";
  export type FollowUpStatus = "Excellent" | "Bon" | "À surveiller" | "Critique";
  
  export interface Partner {
    id: string;
    name: string;
    partner_type: PartnerType;
    partnership_status: PartnershipStatus;
    follow_up_status: FollowUpStatus;
    region: Region;
    city: string;
    lat: number;
    lng: number;
    relation_score: number; // 0-100
    domain_scores: { strategique: number; operationnel: number; financier: number; innovation: number };
  }
  
  const REGION_COORDS: Record<Region, { lat: number; lng: number }> = {
    "Tanger-Tétouan-Al Hoceïma": { lat: 35.7595, lng: -5.834 },
    "L'Oriental": { lat: 34.6814, lng: -1.9086 },
    "Fès-Meknès": { lat: 34.0181, lng: -5.0078 },
    "Rabat-Salé-Kénitra": { lat: 34.0209, lng: -6.8416 },
    "Béni Mellal-Khénifra": { lat: 32.3373, lng: -6.3498 },
    "Casablanca-Settat": { lat: 33.5731, lng: -7.5898 },
    "Marrakech-Safi": { lat: 31.6295, lng: -7.9811 },
    "Drâa-Tafilalet": { lat: 31.9314, lng: -4.4239 },
    "Souss-Massa": { lat: 30.4278, lng: -9.5981 },
    "Guelmim-Oued Noun": { lat: 28.9870, lng: -10.0574 },
    "Laâyoune-Sakia El Hamra": { lat: 27.1536, lng: -13.2033 },
    "Dakhla-Oued Ed-Dahab": { lat: 23.6848, lng: -15.9579 },
  };
  
  const TYPES: PartnerType[] = ["Institutionnel", "Académique", "ONG", "Privé", "International"];
  const STATUSES: PartnershipStatus[] = ["Actif", "Prospect", "En négociation", "Suspendu", "Archivé"];
  const FOLLOW: FollowUpStatus[] = ["Excellent", "Bon", "À surveiller", "Critique"];
  
  function seeded(i: number) { return ((i * 9301 + 49297) % 233280) / 233280; }
  
  export const MOCK_PARTNERS: Partner[] = Array.from({ length: 48 }).map((_, i) => {
    const region = MOROCCO_REGIONS[i % MOROCCO_REGIONS.length];
    const base = REGION_COORDS[region];
    const type = TYPES[Math.floor(seeded(i + 1) * TYPES.length)];
    const status = STATUSES[Math.floor(seeded(i + 7) * STATUSES.length)];
    const follow = FOLLOW[Math.floor(seeded(i + 13) * FOLLOW.length)];
    const score = Math.round(40 + seeded(i + 21) * 60);
    return {
      id: `P-${String(i + 1).padStart(3, "0")}`,
      name: `${type} ${region.split("-")[0]} ${i + 1}`,
      partner_type: type,
      partnership_status: status,
      follow_up_status: follow,
      region,
      city: region.split("-")[0],
      lat: base.lat + (seeded(i + 31) - 0.5) * 0.6,
      lng: base.lng + (seeded(i + 41) - 0.5) * 0.6,
      relation_score: score,
      domain_scores: {
        strategique: Math.round(40 + seeded(i + 51) * 60),
        operationnel: Math.round(40 + seeded(i + 61) * 60),
        financier: Math.round(40 + seeded(i + 71) * 60),
        innovation: Math.round(40 + seeded(i + 81) * 60),
      },
    };
  });