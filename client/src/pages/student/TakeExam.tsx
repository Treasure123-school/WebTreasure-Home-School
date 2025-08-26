import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer } from "@/components/ui/timer";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Clock,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TakeExam() {
  const { examId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeUp, setTimeUp] = useState(false);

  // Redirect if not authenticated or not student
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
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

  const { data: exam, isLoading: examLoading, error: examError } = useQuery({
    queryKey: [`/api/exams/${examId}`],
    enabled: !!user && !!examId,
    retry: false,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/exams/${examId}/questions`],
    enabled: !!user && !!examId,
    retry: false,
  });

  // Check if student has already submitted this exam
  const { data: existingSubmission } = useQuery({
    queryKey: [`/api/submissions/${examId}/${user?.id}`],
    enabled: !!user && !!examId,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      await apiRequest('POST', '/api/submissions', submissionData);
    },
    onSuccess: () => {
      toast({
        title: "Exam Submitted",
        description: "Your exam has been submitted successfully!",
      });
      setLocation('/student');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Submission Failed",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!examId || !user?.id) return;

    const submissionData = {
      examId: examId,
      answers: answers,
    };

    submitMutation.mutate(submissionData);
  }, [examId, user?.id, answers, submitMutation]);

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    toast({
      title: "Time's Up!",
      description: "The exam time has ended. Submitting your answers automatically.",
      variant: "destructive",
    });
    setTimeout(() => {
      handleSubmit();
    }, 2000);
  }, [handleSubmit, toast]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Loading state
  if (isLoading || examLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error handling
  if (examError) {
    return (
      <Layout type="portal">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-textPrimary mb-4">Exam Not Found</h1>
          <p className="text-textSecondary mb-8">The exam you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => setLocation('/student')} data-testid="back-to-dashboard">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // Already submitted
  if (existingSubmission) {
    return (
      <Layout type="portal">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-textPrimary mb-4">Exam Already Submitted</h1>
          <p className="text-textSecondary mb-8">
            You have already completed this exam. Your score: {existingSubmission.score}/{existingSubmission.totalMarks} ({existingSubmission.percentage}%)
          </p>
          <Button onClick={() => setLocation('/student')} data-testid="back-to-dashboard">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // No questions available
  if (!exam || questions.length === 0) {
    return (
      <Layout type="portal">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-textSecondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-textPrimary mb-4">No Questions Available</h1>
          <p className="text-textSecondary mb-8">This exam doesn't have any questions yet.</p>
          <Button onClick={() => setLocation('/student')} data-testid="back-to-dashboard">
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-backgroundSurface" data-testid="take-exam">
      {/* Exam Header */}
      <div className="bg-primary text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div data-testid="exam-info">
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-blue-100">
                Question {currentQuestion + 1} of {questions.length} • {exam.subject}
              </p>
            </div>
            <div className="text-right" data-testid="exam-timer">
              <Timer
                initialMinutes={exam.duration}
                onTimeUp={handleTimeUp}
                className="text-white"
              />
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg" data-testid="question-card">
          <CardHeader className="bg-backgroundSurface">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Question {currentQuestion + 1}
              </CardTitle>
              <Badge variant="outline" data-testid="question-marks">
                {currentQuestionData.marks} {currentQuestionData.marks === 1 ? 'mark' : 'marks'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-textPrimary mb-6" data-testid="question-text">
                {currentQuestionData.questionText}
              </h2>
              
              {/* MCQ Options */}
              <div className="space-y-4" data-testid="question-options">
                {(currentQuestionData.options as string[]).map((option, index) => {
                  const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = answers[currentQuestionData.id] === optionKey;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestionData.id, optionKey)}
                      disabled={timeUp}
                      className={`w-full p-6 border-2 rounded-xl text-left transition-all duration-200 group ${
                        isSelected 
                          ? 'border-primary bg-blue-50 text-primary' 
                          : 'border-gray-300 hover:border-primary hover:bg-blue-50'
                      }`}
                      data-testid={`option-${optionKey.toLowerCase()}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-gray-400 group-hover:border-primary'
                          }`}>
                            {isSelected && (
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-lg font-medium">
                            {optionKey}) {option}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0 || timeUp}
                data-testid="button-previous"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-textSecondary" data-testid="answered-count">
                  {answeredQuestions} of {questions.length} answered
                </span>
                
                {currentQuestion < questions.length - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={timeUp}
                    data-testid="button-next"
                  >
                    Next Question
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="bg-accent hover:bg-orange-600"
                        disabled={timeUp || submitMutation.isPending}
                        data-testid="button-submit-exam"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Exam'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to submit your exam? You have answered {answeredQuestions} out of {questions.length} questions.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="cancel-submit">
                          Review More
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleSubmit}
                          disabled={submitMutation.isPending}
                          data-testid="confirm-submit"
                        >
                          {submitMutation.isPending ? 'Submitting...' : 'Submit Exam'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Up Overlay */}
      {timeUp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" data-testid="time-up-overlay">
          <Card className="max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-textPrimary mb-4">Time's Up!</h2>
              <p className="text-textSecondary mb-6">
                The exam time has ended. Your answers are being submitted automatically.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
