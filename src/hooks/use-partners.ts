import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MOCK_PARTNERS } from "@/data/partners";
import type { Partner } from "@/data/partners";
import type { PartnerFormValues } from "@/lib/partner-schema";

let mockDb: Partner[] = [...MOCK_PARTNERS];

export type { Partner };

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: async (): Promise<Partner[]> => {
      await new Promise((r) => setTimeout(r, 200));
      return [...mockDb].sort(
        (a, b) => b.id.localeCompare(a.id)
      );
    },
    staleTime: 0,
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: PartnerFormValues) => {
      await new Promise((r) => setTimeout(r, 150));
      const newId = `P-${String(mockDb.length + 1).padStart(3, "0")}`;
      const newPartner: Partner = {
        id: newId,
        name: values.name,
        partner_type: (values.partner_type as Partner["partner_type"]) ?? "Privé",
        partnership_status: (values.partnership_status as Partner["partnership_status"]) ?? "Prospect",
        follow_up_status: (values.follow_up_status as Partner["follow_up_status"]) ?? "Bon",
        region: (values.region as Partner["region"]) ?? "Rabat-Salé-Kénitra",
        city: values.city ?? "",
        lat: 34.02,
        lng: -6.84,
        relation_score: values.relational_score ?? 50,
        domain_scores: {
          strategique: 50,
          operationnel: 50,
          financier: 50,
          innovation: 50,
        },
      };
      mockDb = [newPartner, ...mockDb];
      return newPartner;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(`Partenaire ${data.id} créé`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PartnerFormValues }) => {
      await new Promise((r) => setTimeout(r, 150));
      mockDb = mockDb.map((p) =>
        p.id === id
          ? {
              ...p,
              name: values.name ?? p.name,
              partner_type: (values.partner_type as Partner["partner_type"]) ?? p.partner_type,
              partnership_status: (values.partnership_status as Partner["partnership_status"]) ?? p.partnership_status,
              follow_up_status: (values.follow_up_status as Partner["follow_up_status"]) ?? p.follow_up_status,
              region: (values.region as Partner["region"]) ?? p.region,
              city: values.city ?? p.city,
              relation_score: values.relational_score ?? p.relation_score,
            }
          : p
      );
      return mockDb.find((p) => p.id === id)!;
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
      await new Promise((r) => setTimeout(r, 150));
      mockDb = mockDb.filter((p) => p.id !== id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partenaire supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}