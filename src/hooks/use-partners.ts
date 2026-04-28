import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PartnerFormValues } from "@/lib/partner-schema";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Partner = Tables<"partners">;

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as Partner[];
    },
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: PartnerFormValues) => {
      const payload = { ...values, partner_code: "" } as unknown as TablesInsert<"partners">;
      const { data, error } = await supabase.from("partners").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(`Partenaire ${data.partner_code} créé`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PartnerFormValues }) => {
      const { data, error } = await supabase.from("partners").update(values as TablesUpdate<"partners">).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partenaire mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partenaire supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}