import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PastoralStore, Sermon, Series, Insight } from "./pastoral-store";

const mapSermon = (s: any): Sermon => ({
  id: s.id,
  title: s.title,
  series: s.series,
  verse: s.verse || "",
  date: s.date,
  status: s.status,
  color: s.color || "bg-amber-400",
  content: s.content || { intro: "", topics: ["", "", ""], conclusion: "" },
  user_id: s.user_id,
});

const mapSeries = (s: any): Series => ({
  id: s.id,
  title: s.title,
  description: s.description || "",
  total: s.total || 0,
  completed: s.completed || 0,
  color: s.color || "bg-blue-500",
  coverColor: s.cover_color || "from-blue-500/20 to-blue-500/5",
  startDate: s.start_date || "",
  user_id: s.user_id,
});

const mapInsight = (i: any): Insight => ({
  id: i.id,
  type: i.type,
  content: i.content,
  title: i.title,
  reference: i.reference,
  tags: i.tags || [],
  sermonId: i.sermon_id,
  user_id: i.user_id,
});

export function useSermons() {
  return useQuery({
    queryKey: ["pastoral", "sermons"],
    queryFn: async () => {
      try {
        const data = await api.get("/pastoral/sermons");
        const mapped = (Array.isArray(data) ? data : []).map(mapSermon);
        PastoralStore.saveSermons(mapped as any);
        return mapped as Sermon[];
      } catch {
        return PastoralStore.getSermons();
      }
    },
  });
}

export function useCreateSermon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/pastoral/sermons", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "sermons"] });
    },
  });
}

export function useUpdateSermon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/pastoral/sermons/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "sermons"] });
    },
  });
}

export function useDeleteSermon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/pastoral/sermons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "sermons"] });
    },
  });
}

export function useSeriesList() {
  return useQuery({
    queryKey: ["pastoral", "series"],
    queryFn: async () => {
      try {
        const data = await api.get("/pastoral/series");
        const mapped = (Array.isArray(data) ? data : []).map(mapSeries);
        PastoralStore.saveSeries(mapped as any);
        return mapped as Series[];
      } catch {
        return PastoralStore.getSeries();
      }
    },
  });
}

export function useCreateSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/pastoral/series", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "series"] });
    },
  });
}

export function useUpdateSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/pastoral/series/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "series"] });
    },
  });
}

export function useDeleteSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/pastoral/series/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "series"] });
    },
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["pastoral", "insights"],
    queryFn: async () => {
      try {
        const data = await api.get("/pastoral/insights");
        const mapped = (Array.isArray(data) ? data : []).map(mapInsight);
        PastoralStore.saveInsights(mapped as any);
        return mapped as Insight[];
      } catch {
        return PastoralStore.getInsights();
      }
    },
  });
}

export function useCreateInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/pastoral/insights", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "insights"] });
    },
  });
}

export function useUpdateInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/pastoral/insights/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "insights"] });
    },
  });
}

export function useDeleteInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/pastoral/insights/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pastoral", "insights"] });
    },
  });
}
