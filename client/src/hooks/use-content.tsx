import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainWithClasses, ClassWithLessons, LessonWithProgress, InsertMain, InsertClass, InsertLesson } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

export function useMains() {
  return useQuery<MainWithClasses[]>({
    queryKey: ["/api/mains"],
  });
}

export function useMain(id: string) {
  return useQuery<MainWithClasses>({
    queryKey: ["/api/mains", id],
    enabled: !!id,
  });
}

export function useClass(id: string) {
  const { user } = useAuth();
  return useQuery<ClassWithLessons>({
    queryKey: ["/api/classes", id],
    enabled: !!id,
  });
}

export function useLessons(classId: string) {
  const { user } = useAuth();
  return useQuery<LessonWithProgress[]>({
    queryKey: ["/api/classes", classId, "lessons"],
    queryFn: () => 
      fetch(`/api/classes/${classId}/lessons${user ? `?userId=${user.id}` : ''}`)
        .then(res => res.json()),
    enabled: !!classId,
  });
}

export function useLesson(id: string) {
  const { user } = useAuth();
  return useQuery<LessonWithProgress>({
    queryKey: ["/api/lessons", id],
    queryFn: () => 
      fetch(`/api/lessons/${id}${user ? `?userId=${user.id}` : ''}`)
        .then(res => res.json()),
    enabled: !!id,
  });
}

export function useSearchLessons(query: string) {
  const { user } = useAuth();
  return useQuery<LessonWithProgress[]>({
    queryKey: ["/api/search", query],
    queryFn: () => 
      fetch(`/api/search?q=${encodeURIComponent(query)}${user ? `&userId=${user.id}` : ''}`)
        .then(res => res.json()),
    enabled: !!query && query.length > 2,
  });
}

export function useUserBookmarks() {
  const { user } = useAuth();
  return useQuery<LessonWithProgress[]>({
    queryKey: ["/api/users", user?.id, "bookmarks"],
    enabled: !!user,
  });
}

export function useUserCompleted() {
  const { user } = useAuth();
  return useQuery<LessonWithProgress[]>({
    queryKey: ["/api/users", user?.id, "completed"],
    enabled: !!user,
  });
}

// Mutations
export function useCreateMain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertMain) => apiRequest("POST", "/api/mains", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useUpdateMain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertMain> }) => 
      apiRequest("PUT", `/api/mains/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useDeleteMain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/mains/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertClass) => apiRequest("POST", "/api/classes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertClass> }) => 
      apiRequest("PUT", `/api/classes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertLesson) => apiRequest("POST", "/api/lessons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertLesson> }) => 
      apiRequest("PUT", `/api/lessons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: { lessonId: string; completed?: boolean; bookmarked?: boolean; studyTime?: number; notes?: string }) => 
      apiRequest("POST", `/api/users/${user?.id}/progress`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}
