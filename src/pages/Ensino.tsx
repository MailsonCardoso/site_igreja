import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Plus, Loader2, Save, Eye, Pencil, Trash2, ClipboardCheck, GraduationCap, Calendar, UserPlus, X, Check } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export default function Ensino() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      teacher: "",
      total_classes: 12,
      start_date: "",
      end_date: "",
      schedule: "",
      location: "",
    }
  });

  const lessonForm = useForm({
    defaultValues: {
      lesson_number: 1,
      title: "",
      date: "",
      topic: "",
    }
  });

  const { reset, setValue, watch } = form;

  // Fetch Courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get("/courses"),
  });

  // Fetch Members
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: () => api.get("/members"),
  });

  // Fetch Lessons for selected course
  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", selectedCourse?.id],
    queryFn: () => api.get(`/courses/${selectedCourse?.id}/lessons`),
    enabled: !!selectedCourse?.id && isManageOpen,
  });

  // Create/Update Course Mutation
  const saveCourseMutation = useMutation({
    mutationFn: (data: any) => isEditMode && selectedCourse
      ? api.put(`/courses/${selectedCourse.id}`, data)
      : api.post("/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(isEditMode ? "Curso atualizado!" : "Curso criado!");
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCourse(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar curso");
    },
  });

  // Delete Course Mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Curso excluído!");
      setIsDeleteOpen(false);
      setSelectedCourse(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir curso");
    },
  });

  // Create Lesson Mutation
  const createLessonMutation = useMutation({
    mutationFn: (data: any) => api.post(`/courses/${selectedCourse.id}/lessons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedCourse?.id] });
      toast.success("Aula criada!");
      lessonForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar aula");
    },
  });

  // Enroll Student Mutation
  const enrollStudentMutation = useMutation({
    mutationFn: (memberId: number) => api.post(`/courses/${selectedCourse.id}/students`, {
      member_id: memberId,
      enrolled_at: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Aluno matriculado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao matricular aluno");
    },
  });

  // Remove Student Mutation
  const removeStudentMutation = useMutation({
    mutationFn: (memberId: number) => api.delete(`/courses/${selectedCourse.id}/students/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Aluno removido!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover aluno");
    },
  });

  // Toggle Lesson Completion
  const toggleLessonMutation = useMutation({
    mutationFn: (lesson: any) => api.put(`/courses/${selectedCourse.id}/lessons/${lesson.id}`, {
      is_completed: !lesson.is_completed,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", selectedCourse?.id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Status da aula atualizado!");
    },
  });

  const onSubmit = (data: any) => {
    saveCourseMutation.mutate(data);
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setIsEditMode(true);
    reset({
      name: course.name || "",
      description: course.description || "",
      teacher: course.teacher || "",
      total_classes: course.total_classes || 12,
      start_date: course.start_date ? course.start_date.split('T')[0] : "",
      end_date: course.end_date ? course.end_date.split('T')[0] : "",
      schedule: course.schedule || "",
      location: course.location || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (course: any) => {
    setSelectedCourse(course);
    setIsViewOpen(true);
  };

  const handleDelete = (course: any) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  const handleManage = (course: any) => {
    setSelectedCourse(course);
    setIsManageOpen(true);
  };

  const handleCreateLesson = (data: any) => {
    createLessonMutation.mutate(data);
  };

  const calculateProgress = (course: any) => {
    if (!course.total_classes || course.total_classes === 0) return 0;
    const completed = course.completed_classes || 0;
    return (completed / course.total_classes) * 100;
  };

  const enrolledStudentIds = selectedCourse?.students?.map((s: any) => s.id) || [];
  const availableMembers = members.filter((m: any) => !enrolledStudentIds.includes(m.id));

  return (
    <MainLayout title="Ensino" breadcrumbs={[{ label: "EBD / Cursos" }]}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground font-display">Gestão de Ensino</h2>
          <p className="text-muted-foreground">Gerencie cursos, aulas e frequência dos alunos</p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            reset();
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 h-11 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">Novo Curso</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex h-[450px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-primary/10 bg-primary/5 p-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Nenhum curso cadastrado</h3>
          <p className="mt-2 max-w-sm text-muted-foreground text-lg leading-relaxed">
            Organize o ensino da igreja criando cursos e gerenciando aulas. Comece agora!
          </p>
          <Button
            onClick={() => {
              setIsEditMode(false);
              reset();
              setIsDialogOpen(true);
            }}
            variant="outline"
            className="mt-8 border-primary text-primary hover:bg-primary hover:text-white rounded-xl h-12 px-8 font-semibold transition-all"
          >
            Cadastrar Primeiro Curso
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any, index: number) => {
            const progress = calculateProgress(course);
            const isCompleted = progress === 100;
            const studentCount = course.students?.length || 0;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group rounded-[2rem] bg-card p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-border/50 hover:border-primary/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:rotate-6">
                      <BookOpen className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {course.name}
                        </h3>
                        {isCompleted && (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs font-semibold">
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                        {course.description || "Sem descrição"}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{course.teacher || "Sem professor"}</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{studentCount} alunos</span>
                        </div>
                        {course.schedule && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{course.schedule}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 sm:min-w-64">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progresso</span>
                        <span className="text-sm font-semibold text-foreground">
                          {course.completed_classes || 0}/{course.total_classes || 0} aulas
                        </span>
                      </div>
                      <Progress value={progress} className="h-2.5" />
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(course)}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(course)}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(course)}
                        className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleManage(course)}
                        size="sm"
                        className="flex-1 gap-2 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Gerenciar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                {isEditMode ? <Pencil className="h-7 w-7 text-primary" /> : <BookOpen className="h-7 w-7 text-primary" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {isEditMode ? "Editar Curso" : "Novo Curso"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-xs">
                  Preencha os dados do curso de ensino da igreja.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5 bg-card">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Nome do Curso</Label>
                <Input
                  {...form.register("name", { required: true })}
                  placeholder="Ex: Curso de Batismo"
                  className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-semibold transition-all focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Descrição</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Breve descrição sobre o curso..."
                  className="rounded-xl border-secondary/30 bg-secondary/5 min-h-[80px] font-medium text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total de Aulas</Label>
                  <Input
                    type="number"
                    {...form.register("total_classes")}
                    placeholder="12"
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Data de Início</Label>
                  <Input
                    type="date"
                    {...form.register("start_date")}
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Data de Término</Label>
                  <Input
                    type="date"
                    {...form.register("end_date")}
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Horário</Label>
                  <Input
                    {...form.register("schedule")}
                    placeholder="Ex: Domingos 9h"
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Local</Label>
                  <Input
                    {...form.register("location")}
                    placeholder="Ex: Sala 1"
                    className="h-11 rounded-xl border-secondary/30 bg-secondary/5 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditMode(false);
                  setSelectedCourse(null);
                  reset();
                }}
                className="flex-1 h-11 rounded-xl font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saveCourseMutation.isPending}
                className="flex-1 h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20"
              >
                {saveCourseMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> {isEditMode ? "Atualizar" : "Criar Curso"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Excluir Curso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o curso <strong>{selectedCourse?.name}</strong>?
              Esta ação removerá todas as aulas e registros de frequência associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCourse && deleteCourseMutation.mutate(selectedCourse.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-semibold"
            >
              {deleteCourseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary/5 p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedCourse?.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-xs">
                  Visualize as informações completas do curso.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-card">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-2">Nome do Curso</span>
              <h2 className="text-2xl font-bold text-foreground">{selectedCourse?.name}</h2>
            </div>

            {selectedCourse?.description && (
              <div className="bg-secondary/5 p-5 rounded-2xl border border-secondary/10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Descrição</span>
                <p className="text-foreground font-medium leading-relaxed">{selectedCourse.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Professor</span>
                <p className="text-sm font-semibold text-foreground capitalize truncate">{selectedCourse?.teacher || "N/A"}</p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Total de Aulas</span>
                <p className="text-sm font-semibold text-foreground">{selectedCourse?.total_classes || 0}</p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Horário</span>
                <p className="text-sm font-semibold text-foreground">{selectedCourse?.schedule || "N/A"}</p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Local</span>
                <p className="text-sm font-semibold text-foreground truncate">{selectedCourse?.location || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => {
                  setIsViewOpen(false);
                  handleEdit(selectedCourse);
                }}
                className="flex-1 h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border-none"
              >
                <Pencil className="h-5 w-5 mr-2" /> Editar Curso
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsViewOpen(false)}
                className="flex-1 h-12 rounded-xl font-semibold border-secondary/50 text-muted-foreground hover:bg-secondary/5"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-[95vw] w-[95vw] h-[95vh] rounded-2xl p-0 overflow-hidden border-none shadow-2xl flex flex-col">
          <div className="bg-primary/5 p-6 border-b shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <ClipboardCheck className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Gerenciar: {selectedCourse?.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium text-xs">
                  Gerencie aulas, alunos e frequência do curso.
                </DialogDescription>
              </div>
            </div>
          </div>

          <Tabs defaultValue="aulas" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 shrink-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="aulas">📖 Aulas</TabsTrigger>
                <TabsTrigger value="alunos">👥 Alunos</TabsTrigger>
                <TabsTrigger value="relatorios">📊 Relatórios</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 h-full">
              {/* Aba Aulas */}
              <TabsContent value="aulas" className="p-6 space-y-6">
                <div className="bg-secondary/5 p-5 rounded-2xl border border-secondary/10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Nova Aula</h3>
                  <form onSubmit={lessonForm.handleSubmit(handleCreateLesson)} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Número</Label>
                        <Input
                          type="number"
                          {...lessonForm.register("lesson_number")}
                          placeholder="1"
                          className="h-10 rounded-xl border-secondary/30 bg-background font-semibold"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Título</Label>
                        <Input
                          {...lessonForm.register("title")}
                          placeholder="Ex: Introdução ao Batismo"
                          className="h-10 rounded-xl border-secondary/30 bg-background font-semibold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Data</Label>
                        <Input
                          type="date"
                          {...lessonForm.register("date")}
                          className="h-10 rounded-xl border-secondary/30 bg-background font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tópico</Label>
                        <Input
                          {...lessonForm.register("topic")}
                          placeholder="Assunto da aula"
                          className="h-10 rounded-xl border-secondary/30 bg-background font-semibold"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={createLessonMutation.isPending}
                      className="w-full h-10 rounded-xl font-semibold bg-primary hover:bg-primary/90"
                    >
                      {createLessonMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Adicionar Aula</>}
                    </Button>
                  </form>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Aulas Cadastradas</h3>
                  {lessons.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Nenhuma aula cadastrada ainda</p>
                    </div>
                  ) : (
                    lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all bg-card"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Checkbox
                            checked={lesson.is_completed}
                            onCheckedChange={() => toggleLessonMutation.mutate(lesson)}
                            className="h-5 w-5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary">Aula {lesson.lesson_number}</span>
                              {lesson.is_completed && (
                                <Badge className="bg-success/10 text-success border-success/20 text-[10px] h-5">
                                  <Check className="h-3 w-3 mr-1" /> Concluída
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-foreground">{lesson.title || `Aula ${lesson.lesson_number}`}</h4>
                            {lesson.topic && (
                              <p className="text-xs text-muted-foreground mt-1">{lesson.topic}</p>
                            )}
                          </div>
                          {lesson.date && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Data</p>
                              <p className="text-sm font-semibold text-foreground">
                                {new Date(lesson.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Aba Alunos */}
              <TabsContent value="alunos" className="p-6 space-y-6">
                <div className="bg-secondary/5 p-5 rounded-2xl border border-secondary/10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Matricular Aluno</h3>
                  {availableMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Todos os membros já estão matriculados neste curso
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {availableMembers.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/30 hover:border-primary/30 transition-all"
                        >
                          <span className="font-semibold text-foreground">{member.name}</span>
                          <Button
                            size="sm"
                            onClick={() => enrollStudentMutation.mutate(member.id)}
                            disabled={enrollStudentMutation.isPending}
                            className="h-8 rounded-lg font-semibold"
                          >
                            <UserPlus className="h-4 w-4 mr-1" /> Matricular
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    Alunos Matriculados ({selectedCourse?.students?.length || 0})
                  </h3>
                  {!selectedCourse?.students || selectedCourse.students.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Nenhum aluno matriculado</p>
                    </div>
                  ) : (
                    selectedCourse.students.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {student.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{student.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Matriculado em {student.pivot?.enrolled_at ? new Date(student.pivot.enrolled_at).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStudentMutation.mutate(student.id)}
                          disabled={removeStudentMutation.isPending}
                          className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Aba Relatórios */}
              <TabsContent value="relatorios" className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Total de Aulas</p>
                    <p className="text-3xl font-bold text-foreground">{selectedCourse?.total_classes || 0}</p>
                  </div>
                  <div className="bg-success/5 p-5 rounded-2xl border border-success/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Concluídas</p>
                    <p className="text-3xl font-bold text-success">{selectedCourse?.completed_classes || 0}</p>
                  </div>
                  <div className="bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Alunos</p>
                    <p className="text-3xl font-bold text-blue-600">{selectedCourse?.students?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Progresso do Curso</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-muted-foreground">Percentual Concluído</span>
                      <span className="text-lg font-bold text-primary">{selectedCourse ? Math.round(calculateProgress(selectedCourse)) : 0}%</span>
                    </div>
                    <Progress value={selectedCourse ? calculateProgress(selectedCourse) : 0} className="h-3" />
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <p className="font-medium">Relatórios detalhados de frequência em breve!</p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
