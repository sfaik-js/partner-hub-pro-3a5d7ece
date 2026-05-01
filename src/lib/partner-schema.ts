import { z } from "zod";
import {
  PARTNER_TYPES, INTERVENTION_DOMAINS, GEOGRAPHIC_ZONES, PREFERRED_CHANNELS,
  PARTNERSHIP_STATUSES, STRATEGIC_LEVELS, COLLABORATION_TYPES,
  INTERACTION_TYPES, EXCHANGE_FREQUENCIES, FOLLOW_UP_STATUSES,
  IMPACT_SCORES, STRATEGIC_ALIGNMENTS, OPPORTUNITIES,
} from "./partner-constants";

const optStr = z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined));
const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().or(z.literal("")).transform((v) => (v ? v : undefined));
const optDate = z.string().optional().or(z.literal("")).transform((v) => (v ? v : undefined));

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(200),
  partner_type: z.enum(PARTNER_TYPES, { errorMap: () => ({ message: "Type obligatoire" }) }),
  intervention_domain: optEnum(INTERVENTION_DOMAINS),
  sub_sector: optStr,
  geographic_zone: optStr,
  region: optStr,
  province: optStr,
  city: optStr,
  country: optStr,
  contact_name: optStr,
  contact_role: optStr,
  email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  phone: z.string().trim().regex(/^[+\d\s().-]{6,20}$/, "Téléphone invalide").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  preferred_channel: optEnum(PREFERRED_CHANNELS),

  partnership_status: z.enum(PARTNERSHIP_STATUSES).default("Prospect"),
  strategic_level: optEnum(STRATEGIC_LEVELS),
  collaboration_type: optEnum(COLLABORATION_TYPES),
  partnership_duration: optStr,
  first_contact_date: optDate,
  partnership_start_date: optDate,
  mou_signed: z.boolean().default(false),
  involved_team: optStr,
  internal_manager: optStr,

  last_interaction_date: optDate,
  last_interaction_type: optEnum(INTERACTION_TYPES),
  exchange_frequency: optEnum(EXCHANGE_FREQUENCIES),
  next_action: optStr,
  next_action_deadline: optDate,
  follow_up_status: optEnum(FOLLOW_UP_STATUSES),

  relational_score: z.coerce.number().int().min(1).max(10).optional().or(z.nan()).transform((v) => (Number.isFinite(v) ? v : undefined)),
  impact_score: optEnum(IMPACT_SCORES),
  strategic_alignment: optEnum(STRATEGIC_ALIGNMENTS),
  opportunities: optEnum(OPPORTUNITIES),
  relational_risks: optStr,
  comments: optStr,
  objectives_summary: optStr,
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;