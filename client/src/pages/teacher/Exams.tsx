import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertExamSchema, insertQuestionSchema } from "@shared/schema";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BookOpen, Plus, Edit2, Trash2, Users, Clock, Eye } from "lucide-react";
import { z } from "zod";

const examFormSchema = insertExamSchema;
const questionFormSchema = insertQuestionSchema.extend({
  options: z.array(z.string()).min(2, "At least 2 options required"),
});

export default function TeacherExams() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  // Redirect if not authenticated or not teacher
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'teacher')) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['/api/exams'],
    enabled: !!user && user.role === 'teacher',
    retry: false,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/exams/${selectedExam?.id}/questions`],
    enabled: !!selectedExam,
    retry: false,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: [`/api/submissions/exam/${selectedExam?.id}`],
    enabled: !!selectedExam,
    retry: false,
  });

  const examForm = useForm<z.infer<typeof examFormSchema>>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      subject: '',
      className: '',
      duration: 30,
      isActive: true,
      createdBy: user?.id || '',
    },
  });

  const questionForm = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      examId: selectedExam?.id || '',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    },
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: z.infer<typeof examFormSchema>) => {
      await apiRequest('POST', '/api/exams', data);
    },
    onSuccess: () => {
      toast({
        title: "Exam Created",
        description: "Exam has been created successfully.",
      });
      examForm.reset();
      setIsCreateExamOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create exam.",
        variant: "destructive",
      });
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<z.infer<typeof examFormSchema>> }) => {
      await apiRequest('PUT', `/api/exams/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Exam Updated",
        description: "Exam has been updated successfully.",
      });
      examForm.reset();
      setEditingExam(null);
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update exam.",
        variant: "destructive",
      });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', `/api/exams/${selectedExam.id}/questions`, {
        questionText: data.questionText,
        options: data.options.filter((opt: string) => opt.trim() !== ''),
        correctAnswer: data.correctAnswer,
        marks: data.marks,
      });
    },
    onSuccess: () => {
      toast({
        title: "Question Added",
        description: "Question has been added to the exam.",
      });
      questionForm.reset();
      setIsAddQuestionOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/exams/${selectedExam.id}/questions`] });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add question.",
        variant: "destructive",
      });
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/exams/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Exam Deleted",
        description: "Exam has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      if (selectedExam) setSelectedExam(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete exam.",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/questions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Question Deleted",
        description: "Question has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/exams/${selectedExam.id}/questions`] });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      });
    },
  });

  const toggleExamStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await apiRequest('PUT', `/api/exams/${id}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Exam status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update exam status.",
        variant: "destructive",
      });
    },
  });

  const onCreateExam = (data: z.infer<typeof examFormSchema>) => {
    if (editingExam) {
      updateExamMutation.mutate({ id: editingExam.id, data });
    } else {
      createExamMutation.mutate({ ...data, createdBy: user?.id || '' });
    }
  };

  const onAddQuestion = (data: z.infer<typeof questionFormSchema>) => {
    addQuestionMutation.mutate(data);
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Are you sure you want to delete this exam? This will also delete all questions.')) {
      deleteExamMutation.mutate(id);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const handleEditExam = (exam: any) => {
    setEditingExam(exam);
    examForm.reset({
      title: exam.title,
      subject: exam.subject,
      className: exam.className,
      duration: exam.duration,
      isActive: exam.isActive,
      createdBy: exam.createdBy,
    });
    setIsCreateExamOpen(true);
  };

  // Filter exams created by this teacher
  const myExams = exams.filter((exam: any) => exam.createdBy === user?.id);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="teacher-exams">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">My Exams</h1>
            <p className="text-textSecondary">Create and manage your exams and questions</p>
          </div>

          <Dialog open={isCreateExamOpen || !!editingExam} onOpenChange={(open) => {
            setIsCreateExamOpen(open);
            if (!open) {
              setEditingExam(null);
              examForm.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateExamOpen(true)} data-testid="create-exam">
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExam ? 'Edit Exam' : 'Create New Exam'}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...examForm}>
                <form onSubmit={examForm.handleSubmit(onCreateExam)} className="space-y-6" data-testid="exam-form">
                  <FormField
                    control={examForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Mathematics Test" {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={examForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Mathematics" {...field} data-testid="input-subject" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={examForm.control}
                      name="className"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <FormControl>
                            <Input placeholder="Primary 5" {...field} data-testid="input-class" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={examForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={examForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-textSecondary">
                            Students can take this exam when active
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateExamOpen(false);
                        setEditingExam(null);
                        examForm.reset();
                      }}
                      data-testid="cancel-exam"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createExamMutation.isPending || updateExamMutation.isPending}
                      data-testid="submit-exam"
                    >
                      {createExamMutation.isPending || updateExamMutation.isPending 
                        ? 'Saving...' 
                        : editingExam ? 'Update Exam' : 'Create Exam'
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedExam ? "questions" : "exams"} onValueChange={(value) => {
          if (value === "exams") setSelectedExam(null);
        }}>
          <TabsList>
            <TabsTrigger value="exams" data-testid="tab-exams">My Exams ({myExams.length})</TabsTrigger>
            {selectedExam && (
              <TabsTrigger value="questions" data-testid="tab-questions">
                Questions ({questions.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="exams">
            {examsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : myExams.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                  <p className="text-textSecondary mb-4">No exams created yet</p>
                  <Button onClick={() => setIsCreateExamOpen(true)} data-testid="create-first-exam">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Exam
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myExams.map((exam: any) => (
                  <Card key={exam.id} data-testid={`exam-${exam.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{exam.title}</CardTitle>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-textSecondary">{exam.subject}</span>
                            <span className="text-sm text-textSecondary">{exam.className}</span>
                            <div className="flex items-center text-sm text-textSecondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {exam.duration} mins
                            </div>
                            <span className="text-sm text-textSecondary">{exam.totalMarks || 0} marks</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={exam.isActive ? 'default' : 'secondary'}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Switch
                            checked={exam.isActive}
                            onCheckedChange={(checked) => 
                              toggleExamStatus.mutate({ id: exam.id, isActive: checked })
                            }
                            disabled={toggleExamStatus.isPending}
                            data-testid={`toggle-${exam.id}`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-textSecondary">
                          Created on {new Date(exam.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedExam(exam)}
                            data-testid={`manage-questions-${exam.id}`}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Questions
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExam(exam)}
                            data-testid={`edit-exam-${exam.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                            disabled={deleteExamMutation.isPending}
                            data-testid={`delete-exam-${exam.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions">
            {selectedExam && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-textPrimary">{selectedExam.title}</h2>
                    <p className="text-textSecondary">
                      {selectedExam.subject} • {selectedExam.className} • {submissions.length} submissions
                    </p>
                  </div>
                  
                  <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="add-question">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Question</DialogTitle>
                      </DialogHeader>
                      
                      <Form {...questionForm}>
                        <form onSubmit={questionForm.handleSubmit(onAddQuestion)} className="space-y-6" data-testid="question-form">
                          <FormField
                            control={questionForm.control}
                            name="questionText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input placeholder="What is 2 + 2?" {...field} data-testid="input-question" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-3">
                            <FormLabel>Options</FormLabel>
                            {[0, 1, 2, 3].map((index) => (
                              <FormField
                                key={index}
                                control={questionForm.control}
                                name={`options.${index}` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        placeholder={`Option ${String.fromCharCode(65 + index)}`} 
                                        {...field} 
                                        data-testid={`input-option-${index}`}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={questionForm.control}
                              name="correctAnswer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correct Answer</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-correct">
                                        <SelectValue placeholder="Select correct answer" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="A">Option A</SelectItem>
                                      <SelectItem value="B">Option B</SelectItem>
                                      <SelectItem value="C">Option C</SelectItem>
                                      <SelectItem value="D">Option D</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={questionForm.control}
                              name="marks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Marks</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="1" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      data-testid="input-marks"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsAddQuestionOpen(false)}
                              data-testid="cancel-question"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={addQuestionMutation.isPending}
                              data-testid="submit-question"
                            >
                              {addQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {questionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : questions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                      <p className="text-textSecondary mb-4">No questions added yet</p>
                      <Button onClick={() => setIsAddQuestionOpen(true)} data-testid="add-first-question">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Question
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question: any, index: number) => (
                      <Card key={question.id} data-testid={`question-${question.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-medium text-textPrimary">
                              {index + 1}. {question.questionText}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{question.marks} marks</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteQuestion(question.id)}
                                disabled={deleteQuestionMutation.isPending}
                                data-testid={`delete-question-${question.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {question.options.map((option: string, optIndex: number) => (
                              <div 
                                key={optIndex} 
                                className={`p-2 rounded text-sm ${
                                  String.fromCharCode(65 + optIndex) === question.correctAnswer
                                    ? 'bg-green-100 text-green-800 font-medium'
                                    : 'bg-backgroundSurface text-textSecondary'
                                }`}
                                data-testid={`option-${question.id}-${optIndex}`}
                              >
                                {String.fromCharCode(65 + optIndex)}) {option}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-textSecondary">
                            Correct Answer: {question.correctAnswer}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
