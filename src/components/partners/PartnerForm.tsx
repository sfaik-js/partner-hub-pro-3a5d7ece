import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnerSchema, type PartnerFormValues } from "@/lib/partner-schema";
import {
  PARTNER_TYPES, INTERVENTION_DOMAINS, GEOGRAPHIC_ZONES, PREFERRED_CHANNELS,
  PARTNERSHIP_STATUSES, STRATEGIC_LEVELS, COLLABORATION_TYPES,
  INTERACTION_TYPES, EXCHANGE_FREQUENCIES, FOLLOW_UP_STATUSES,
  IMPACT_SCORES, STRATEGIC_ALIGNMENTS, OPPORTUNITIES,
} from "@/lib/partner-constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Partner } from "@/hooks/use-partners";
import { Loader2 } from "lucide-react";

type Props = {
  defaultValues?: Partial<Partner>;
  onSubmit: (values: PartnerFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
};

const toForm = (p?: Partial<Partner>): PartnerFormValues => ({
  name: p?.name ?? "",
  partner_type: (p?.partner_type as PartnerFormValues["partner_type"]) ?? ("" as PartnerFormValues["partner_type"]),
  intervention_domain: p?.intervention_domain as PartnerFormValues["intervention_domain"],
  sub_sector: p?.sub_sector ?? "",
  geographic_zone: p?.geographic_zone as PartnerFormValues["geographic_zone"],
  region: p?.region ?? "",
  city: p?.city ?? "",
  country: p?.country ?? "",
  contact_name: p?.contact_name ?? "",
  contact_role: p?.contact_role ?? "",
  email: p?.email ?? "",
  phone: p?.phone ?? "",
  preferred_channel: p?.preferred_channel as PartnerFormValues["preferred_channel"],
  partnership_status: (p?.partnership_status as PartnerFormValues["partnership_status"]) ?? "Prospect",
  strategic_level: p?.strategic_level as PartnerFormValues["strategic_level"],
  collaboration_type: p?.collaboration_type as PartnerFormValues["collaboration_type"],
  partnership_duration: p?.partnership_duration ?? "",
  first_contact_date: p?.first_contact_date ?? "",
  partnership_start_date: p?.partnership_start_date ?? "",
  mou_signed: p?.mou_signed ?? false,
  involved_team: p?.involved_team ?? "",
  internal_manager: p?.internal_manager ?? "",
  last_interaction_date: p?.last_interaction_date ?? "",
  last_interaction_type: p?.last_interaction_type as PartnerFormValues["last_interaction_type"],
  exchange_frequency: p?.exchange_frequency as PartnerFormValues["exchange_frequency"],
  next_action: p?.next_action ?? "",
  next_action_deadline: p?.next_action_deadline ?? "",
  follow_up_status: p?.follow_up_status as PartnerFormValues["follow_up_status"],
  relational_score: p?.relational_score ?? undefined,
  impact_score: p?.impact_score as PartnerFormValues["impact_score"],
  strategic_alignment: p?.strategic_alignment as PartnerFormValues["strategic_alignment"],
  opportunities: p?.opportunities as PartnerFormValues["opportunities"],
  relational_risks: p?.relational_risks ?? "",
  comments: p?.comments ?? "",
  objectives_summary: p?.objectives_summary ?? "",
});

function SelectField({ control, name, label, options, placeholder }: {
  control: ReturnType<typeof useForm<PartnerFormValues>>["control"];
  name: keyof PartnerFormValues; label: string; options: readonly string[]; placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={(field.value as string) ?? ""}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder={placeholder ?? "Choisir..."} /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextField({ control, name, label, type = "text", placeholder }: {
  control: ReturnType<typeof useForm<PartnerFormValues>>["control"];
  name: keyof PartnerFormValues; label: string; type?: string; placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value === undefined || field.value === null ? "" : String(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function PartnerForm({ defaultValues, onSubmit, submitting, submitLabel = "Enregistrer" }: Props) {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: toForm(defaultValues),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="partnership">Partenariat</TabsTrigger>
            <TabsTrigger value="follow">Suivi</TabsTrigger>
            <TabsTrigger value="strategy">Stratégie</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="name" label="Nom du partenaire *" />
              <SelectField control={form.control} name="partner_type" label="Type *" options={PARTNER_TYPES} />
              <SelectField control={form.control} name="intervention_domain" label="Domaine d'intervention" options={INTERVENTION_DOMAINS} />
              <TextField control={form.control} name="sub_sector" label="Sous-secteur" />
              <SelectField control={form.control} name="geographic_zone" label="Zone géographique" options={GEOGRAPHIC_ZONES} />
              <TextField control={form.control} name="country" label="Pays" />
              <TextField control={form.control} name="region" label="Région / Province" />
              <TextField control={form.control} name="city" label="Ville / Commune" />
              <TextField control={form.control} name="contact_name" label="Contact principal" />
              <TextField control={form.control} name="contact_role" label="Fonction" />
              <TextField control={form.control} name="email" label="Email" type="email" />
              <TextField control={form.control} name="phone" label="Téléphone" />
              <SelectField control={form.control} name="preferred_channel" label="Canal préféré" options={PREFERRED_CHANNELS} />
            </div>
          </TabsContent>

          <TabsContent value="partnership" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField control={form.control} name="partnership_status" label="Statut du partenariat" options={PARTNERSHIP_STATUSES} />
              <SelectField control={form.control} name="strategic_level" label="Niveau stratégique" options={STRATEGIC_LEVELS} />
              <SelectField control={form.control} name="collaboration_type" label="Type de collaboration" options={COLLABORATION_TYPES} />
              <TextField control={form.control} name="partnership_duration" label="Durée" placeholder="ex: 12 mois" />
              <TextField control={form.control} name="first_contact_date" label="Date 1er contact" type="date" />
              <TextField control={form.control} name="partnership_start_date" label="Date début partenariat" type="date" />
              <TextField control={form.control} name="involved_team" label="Équipe impliquée" />
              <TextField control={form.control} name="internal_manager" label="Responsable interne" />
              <FormField
                control={form.control}
                name="mou_signed"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                    <div>
                      <FormLabel>Convention / MOU signé</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="follow" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="last_interaction_date" label="Dernière interaction" type="date" />
              <SelectField control={form.control} name="last_interaction_type" label="Type dernière interaction" options={INTERACTION_TYPES} />
              <SelectField control={form.control} name="exchange_frequency" label="Fréquence des échanges" options={EXCHANGE_FREQUENCIES} />
              <SelectField control={form.control} name="follow_up_status" label="Statut de suivi" options={FOLLOW_UP_STATUSES} />
              <TextField control={form.control} name="next_action" label="Prochaine action" />
              <TextField control={form.control} name="next_action_deadline" label="Échéance prochaine action" type="date" />
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="relational_score" label="Score relationnel (1-10)" type="number" />
              <SelectField control={form.control} name="impact_score" label="Score impact" options={IMPACT_SCORES} />
              <SelectField control={form.control} name="strategic_alignment" label="Alignement stratégique" options={STRATEGIC_ALIGNMENTS} />
              <SelectField control={form.control} name="opportunities" label="Opportunités" options={OPPORTUNITIES} />
            </div>
            <FormField control={form.control} name="relational_risks" render={({ field }) => (
              <FormItem><FormLabel>Risques relationnels</FormLabel>
                <FormControl><Textarea rows={2} {...field} value={field.value ?? ""} /></FormControl><FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="objectives_summary" render={({ field }) => (
              <FormItem><FormLabel>Résumé des objectifs</FormLabel>
                <FormControl><Textarea rows={3} {...field} value={field.value ?? ""} /></FormControl><FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="comments" render={({ field }) => (
              <FormItem><FormLabel>Commentaires</FormLabel>
                <FormControl><Textarea rows={3} {...field} value={field.value ?? ""} /></FormControl><FormMessage />
              </FormItem>
            )}/>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="submit" disabled={submitting} className="bg-gradient-primary hover:opacity-90 shadow-elegant">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}