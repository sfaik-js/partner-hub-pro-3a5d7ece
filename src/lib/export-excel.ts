import * as XLSX from "xlsx";
import type { Partner } from "@/hooks/use-partners";

const COLUMN_LABELS: Record<string, string> = {
  partner_code: "Code", name: "Nom", partner_type: "Type",
  intervention_domain: "Domaine", sub_sector: "Sous-secteur",
  geographic_zone: "Zone géo.", region: "Région", city: "Ville", country: "Pays",
  province: "Province",
  contact_name: "Contact", contact_role: "Fonction", email: "Email", phone: "Téléphone",
  preferred_channel: "Canal préféré",
  partnership_status: "Statut", strategic_level: "Niveau stratégique",
  collaboration_type: "Type collaboration", partnership_duration: "Durée",
  first_contact_date: "1er contact", partnership_start_date: "Début partenariat",
  mou_signed: "MOU signé", involved_team: "Équipe", internal_manager: "Responsable",
  last_interaction_date: "Dernière interaction", last_interaction_type: "Type interaction",
  exchange_frequency: "Fréquence", next_action: "Prochaine action",
  next_action_deadline: "Échéance", follow_up_status: "Statut suivi",
  relational_score: "Score relationnel", impact_score: "Impact",
  strategic_alignment: "Alignement", opportunities: "Opportunités",
  relational_risks: "Risques", comments: "Commentaires", objectives_summary: "Objectifs",
  created_at: "Créé le",
};

export function exportPartnersToExcel(partners: Partner[]) {
  const rows = partners.map((p) => {
    const row: Record<string, unknown> = {};
    for (const [key, label] of Object.entries(COLUMN_LABELS)) {
      const v = (p as unknown as Record<string, unknown>)[key];
      row[label] = v === null || v === undefined ? "" : v;
    }
    return row;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Partenaires");
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `partenaires-${date}.xlsx`);
}