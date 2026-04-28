export const PARTNER_TYPES = ["Public", "ONG", "Entreprise", "Fondation", "Université", "Bailleur", "Expert", "Formateur"] as const;
export const INTERVENTION_DOMAINS = ["Éducation", "Santé", "Innovation sociale", "Insertion", "Environnement", "Culture", "Économie", "Autre"] as const;
export const GEOGRAPHIC_ZONES = ["National", "Régional", "Ville"] as const;
export const PREFERRED_CHANNELS = ["Email", "Téléphone", "WhatsApp", "Présentiel"] as const;
export const PARTNERSHIP_STATUSES = ["Prospect", "Actif", "Dormant", "Clôturé"] as const;
export const STRATEGIC_LEVELS = ["Partenaire", "Prestataire", "Bénéficiaire", "Collaborateur", "Bénévole"] as const;
export const COLLABORATION_TYPES = ["Financement", "Technique", "Co-création", "Mise en œuvre"] as const;
export const INTERACTION_TYPES = ["Réunion", "Appel", "Email", "Événement"] as const;
export const EXCHANGE_FREQUENCIES = ["Faible", "Moyenne", "Élevée"] as const;
export const FOLLOW_UP_STATUSES = ["À jour", "À relancer", "Critique"] as const;
export const IMPACT_SCORES = ["Faible", "Moyen", "Fort"] as const;
export const STRATEGIC_ALIGNMENTS = ["Faible", "Moyen", "Fort"] as const;
export const OPPORTUNITIES = ["Scaling", "Nouveau projet", "Financement", "Aucune"] as const;

export const STATUS_COLORS: Record<string, string> = {
  Prospect: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Actif: "bg-success/10 text-success border-success/20",
  Dormant: "bg-warning/10 text-warning border-warning/20",
  Clôturé: "bg-muted text-muted-foreground border-border",
};

export const FOLLOW_UP_COLORS: Record<string, string> = {
  "À jour": "bg-success/10 text-success border-success/20",
  "À relancer": "bg-warning/10 text-warning border-warning/20",
  Critique: "bg-destructive/10 text-destructive border-destructive/20",
};