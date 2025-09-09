// client/src/pages/admin/Exams.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient"; // Import the new helper
import { insertExamSchema, insertQuestionSchema } from "@/lib/types";
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
import { BookOpen, Plus, Edit2, Trash2, Users, Clock, RefreshCw } from "lucide-react";
import { z } from "zod";

const examFormSchema = insertExamSchema.extend({
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    isActive: z.boolean().optional()
});

const questionFormSchema = insertQuestionSchema.extend({
  options: z.array(z.string()).min(2, "At least 2 options required"),
});

export default function AdminExams() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
    
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  // ✅ FIX: Corrected role check to use user.role_name
  useEffect(() => {
    if (!authLoading && (!user || user.role_name !== 'Admin')) {
      toast({
        title: "Unauthorized",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }
  }, [user, authLoading, toast]);

  // ✅ FIX: Use apiRequest for fetching exams
  const { data: exams = [], isLoading: examsLoading, refetch: refetchExams } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => await apiRequest('GET', '/api/exams'),
    enabled: !!user && user.role_name === 'Admin',
    retry: 1,
  });

  // ✅ FIX: Use apiRequest for fetching questions
  const { data: questions = [], isLoading: questionsLoading, refetch: refetchQuestions } = useQuery({
    queryKey: ['questions', selectedExam?.id],
    queryFn: async () => {
        if (!selectedExam?.id) return [];
        return await apiRequest('GET', `/api/exams/${selectedExam.id}/questions`);
    },
    enabled: !!selectedExam,
    retry: 1,
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

  // ✅ FIX: Use apiRequest for mutations
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
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create exam.",
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
      queryClient.invalidateQueries({ queryKey: ['questions', selectedExam.id] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
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
      queryClient.invalidateQueries({ queryKey: ['exams'] });
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

  const toggleExamStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await apiRequest('PUT', `/api/exams/${id}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Exam status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
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
    createExamMutation.mutate({ ...data, createdBy: user?.id || '' });
  };

  const onAddQuestion = (data: z.infer<typeof questionFormSchema>) => {
    addQuestionMutation.mutate(data);
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Are you sure you want to delete this exam? This will also delete all questions.')) {
      deleteExamMutation.mutate(id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || user.role_name !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-textSecondary">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-exams">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Exam Management</h1>
            <p className="text-textSecondary">Create and manage exams and questions</p>
          </div>

          <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-exam">
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
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
                          <Input placeholder="Mathematics Test" {...field} />
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
                            <Input placeholder="Mathematics" {...field} />
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
                            <Input placeholder="Primary 5" {...field} />
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
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateExamOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createExamMutation.isPending}
                    >
                      {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
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
            <TabsTrigger value="exams">All Exams</TabsTrigger>
            {selectedExam && (
              <TabsTrigger value="questions">
                Questions ({questions.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="exams">
            {examsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : exams.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-textSecondary mx-auto mb-4" />
                  <p className="text-textSecondary mb-4">No exams created yet</p>
                  <Button onClick={() => setIsCreateExamOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Exam
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {exams.map((exam: any) => (
                  <Card key={exam.id}>
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
                          >
                            Manage Questions
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                            disabled={deleteExamMutation.isPending}
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
                    <p className="text-textSecondary">Manage questions for this exam</p>
                  </div>
                  
                  <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Question</DialogTitle>
                      </DialogHeader>
                      
                      <Form {...questionForm}>
                        <form onSubmit={questionForm.handleSubmit(onAddQuestion)} className="space-y-6">
                          <FormField
                            control={questionForm.control}
                            name="questionText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input placeholder="What is 2 + 2?" {...field} />
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
                                      <SelectTrigger>
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
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={addQuestionMutation.isPending}
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
                      <Button onClick={() => setIsAddQuestionOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Question
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question: any, index: number) => (
                      <Card key={question.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-medium text-textPrimary">
                              {index + 1}. {question.questionText}
                            </h3>
                            <Badge variant="outline">{question.marks} marks</Badge>
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
