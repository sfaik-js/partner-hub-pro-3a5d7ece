import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnerSchema, type PartnerFormValues } from "@/lib/partner-schema";
import {
  PARTNER_TYPES, INTERVENTION_DOMAINS, GEOGRAPHIC_ZONES, PREFERRED_CHANNELS,
  PARTNERSHIP_STATUSES, STRATEGIC_LEVELS, COLLABORATION_TYPES,
  INTERACTION_TYPES, EXCHANGE_FREQUENCIES, FOLLOW_UP_STATUSES,
  IMPACT_SCORES, STRATEGIC_ALIGNMENTS, OPPORTUNITIES,
} from "@/lib/partner-constants";
import { getRegionals, getPays, getRegions, getProvinces, getVilles } from "@/lib/location-data";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Partner } from "@/hooks/use-partners";
import { Loader2, Building2, Briefcase, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

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
  province: p?.province ?? "",
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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-sm font-semibold text-foreground/80">{label}</FormLabel>
          <Select onValueChange={field.onChange} value={(field.value as string) ?? ""}>
            <FormControl>
              <SelectTrigger className="bg-background shadow-sm border-muted-foreground/20 focus:ring-primary/50 transition-all rounded-lg h-11">
                <SelectValue placeholder={placeholder ?? "Choisir..."} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
              {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

function TextField({ control, name, label, type = "text", placeholder, className }: {
  control: ReturnType<typeof useForm<PartnerFormValues>>["control"];
  name: keyof PartnerFormValues; label: string; type?: string; placeholder?: string; className?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5", className)}>
          <FormLabel className="text-sm font-semibold text-foreground/80">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value === undefined || field.value === null ? "" : String(field.value)}
              className="bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/50 transition-all rounded-lg h-11 px-4"
            />
          </FormControl>
          <FormMessage className="text-xs" />
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

  const watchedZone = form.watch("geographic_zone");
  const watchedPays = form.watch("country");
  const watchedRegion = form.watch("region");
  const watchedProvince = form.watch("province");

  const regionals = getRegionals();
  const paysList = getPays(watchedZone);
  const regionsList = getRegions(watchedZone, watchedPays);
  const provincesList = getProvinces(watchedZone, watchedPays, watchedRegion);
  const villesList = getVilles(watchedZone, watchedPays, watchedRegion, watchedProvince);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-1">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 flex-wrap gap-1">
              <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 flex-1 sm:flex-none">
                <Building2 className="w-4 h-4 mr-2 text-primary" /> Général
              </TabsTrigger>
              <TabsTrigger value="partnership" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 flex-1 sm:flex-none">
                <Briefcase className="w-4 h-4 mr-2 text-primary" /> Partenariat
              </TabsTrigger>
              <TabsTrigger value="follow" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 flex-1 sm:flex-none">
                <Activity className="w-4 h-4 mr-2 text-primary" /> Suivi
              </TabsTrigger>
              <TabsTrigger value="strategy" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5 px-4 flex-1 sm:flex-none">
                <Target className="w-4 h-4 mr-2 text-primary" /> Stratégie
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-1 pb-4">
            <TabsContent value="general" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center text-foreground"><Building2 className="w-5 h-5 mr-2 text-primary" /> Informations sur l'entreprise</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextField control={form.control} name="name" label="Nom du partenaire *" />
                    <SelectField control={form.control} name="partner_type" label="Type *" options={PARTNER_TYPES} />
                    <SelectField control={form.control} name="intervention_domain" label="Domaine d'intervention" options={INTERVENTION_DOMAINS} />
                    <TextField control={form.control} name="sub_sector" label="Sous-secteur" />
                  </div>
                </div>

                <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center text-foreground"><Target className="w-5 h-5 mr-2 text-primary" /> Localisation</h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    <FormField
                      control={form.control}
                      name="geographic_zone"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground/80">Régional</FormLabel>
                          <Select 
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue("country", "");
                              form.setValue("region", "");
                              form.setValue("province", "");
                              form.setValue("city", "");
                            }} 
                            value={(field.value as string) ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background shadow-sm border-muted-foreground/20 focus:ring-primary/50 transition-all rounded-lg h-11">
                                <SelectValue placeholder="Choisir régional..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                              {regionals.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground/80">Pays</FormLabel>
                          <Select 
                            disabled={!watchedZone || paysList.length === 0}
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue("region", "");
                              form.setValue("province", "");
                              form.setValue("city", "");
                            }} 
                            value={(field.value as string) ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background shadow-sm border-muted-foreground/20 focus:ring-primary/50 transition-all rounded-lg h-11 disabled:opacity-50">
                                <SelectValue placeholder={!watchedZone ? "Sélectionnez régional..." : "Choisir pays..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                              {paysList.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground/80">Région</FormLabel>
                          <Select 
                            disabled={!watchedPays || regionsList.length === 0}
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue("province", "");
                              form.setValue("city", "");
                            }} 
                            value={(field.value as string) ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background shadow-sm border-muted-foreground/20 focus:ring-primary/50 transition-all rounded-lg h-11 disabled:opacity-50">
                                <SelectValue placeholder={!watchedPays ? "Sélectionnez pays..." : "Choisir région..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                              {regionsList.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground/80">Province</FormLabel>
                          <Select 
                            disabled={!watchedRegion || provincesList.length === 0}
                            onValueChange={(val) => {
                              field.onChange(val);
                              form.setValue("city", "");
                            }} 
                            value={(field.value as string) ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background shadow-sm border-muted-foreground/20 focus:ring-primary/50 transition-all rounded-lg h-11 disabled:opacity-50">
                                <SelectValue placeholder={!watchedRegion ? "Sélectionnez région..." : "Choisir province..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                              {provincesList.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground/80">Ville</FormLabel>
                          <Select 
                            disabled={!watchedProvince || villesList.length === 0}
                            onValueChange={field.onChange} 
                            value={(field.value as string) ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background shadow-sm border-muted-foreground/20 focus:ring-primary/50 transition-all rounded-lg h-11 disabled:opacity-50">
                                <SelectValue placeholder={!watchedProvince ? "Sélectionnez province..." : "Choisir ville..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-lg border-muted-foreground/20">
                              {villesList.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center text-foreground"><Building2 className="w-5 h-5 mr-2 text-primary" /> Contact Principal</h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <TextField control={form.control} name="contact_name" label="Nom du contact" />
                    <TextField control={form.control} name="contact_role" label="Fonction" />
                    <TextField control={form.control} name="email" label="Email" type="email" />
                    <TextField control={form.control} name="phone" label="Téléphone" />
                    <SelectField control={form.control} name="preferred_channel" label="Canal préféré" options={PREFERRED_CHANNELS} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="partnership" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                <div className="grid gap-6 sm:grid-cols-2">
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
                      <FormItem className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 sm:col-span-2 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold">Convention / MOU signé</FormLabel>
                          <div className="text-sm text-muted-foreground">Indique si un accord formel a été signé avec ce partenaire.</div>
                        </div>
                        <FormControl>
                          <Switch checked={!!field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="follow" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-muted/20 p-6 rounded-2xl border border-border/50">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField control={form.control} name="last_interaction_date" label="Dernière interaction" type="date" />
                  <SelectField control={form.control} name="last_interaction_type" label="Type dernière interaction" options={INTERACTION_TYPES} />
                  <SelectField control={form.control} name="exchange_frequency" label="Fréquence des échanges" options={EXCHANGE_FREQUENCIES} />
                  <SelectField control={form.control} name="follow_up_status" label="Statut de suivi" options={FOLLOW_UP_STATUSES} />
                  <TextField control={form.control} name="next_action" label="Prochaine action" />
                  <TextField control={form.control} name="next_action_deadline" label="Échéance prochaine action" type="date" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-muted/20 p-6 rounded-2xl border border-border/50 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField control={form.control} name="relational_score" label="Score relationnel (1-10)" type="number" />
                  <SelectField control={form.control} name="impact_score" label="Score impact" options={IMPACT_SCORES} />
                  <SelectField control={form.control} name="strategic_alignment" label="Alignement stratégique" options={STRATEGIC_ALIGNMENTS} />
                  <SelectField control={form.control} name="opportunities" label="Opportunités" options={OPPORTUNITIES} />
                </div>
                <div className="space-y-6">
                  <FormField control={form.control} name="relational_risks" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-foreground/80">Risques relationnels</FormLabel>
                      <FormControl><Textarea rows={2} {...field} value={field.value ?? ""} className="bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/50 rounded-lg resize-none" /></FormControl><FormMessage className="text-xs" />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="objectives_summary" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-foreground/80">Résumé des objectifs</FormLabel>
                      <FormControl><Textarea rows={3} {...field} value={field.value ?? ""} className="bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/50 rounded-lg resize-none" /></FormControl><FormMessage className="text-xs" />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="comments" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-sm font-semibold text-foreground/80">Commentaires</FormLabel>
                      <FormControl><Textarea rows={3} {...field} value={field.value ?? ""} className="bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/50 rounded-lg resize-none" /></FormControl><FormMessage className="text-xs" />
                    </FormItem>
                  )}/>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50 sticky bottom-0 bg-background/95 backdrop-blur z-10 py-4 px-2">
          <Button type="button" variant="outline" onClick={() => form.reset()} className="rounded-lg shadow-sm font-medium">
            Réinitialiser
          </Button>
          <Button type="submit" disabled={submitting} className="bg-gradient-primary hover:opacity-90 shadow-elegant rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}