import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertAnnouncementSchema } from "@/lib/types";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Megaphone, Plus, Edit2, Trash2 } from "lucide-react";
import { z } from "zod";

const announcementFormSchema = insertAnnouncementSchema;

export default function AdminAnnouncements() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
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

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['/api/announcements'],
    enabled: !!user && user.role === 'admin',
    retry: false,
  });

  const form = useForm<z.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      body: '',
      audience: 'all',
      createdBy: user?.id || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof announcementFormSchema>) => {
      await apiRequest('POST', '/api/announcements', data);
    },
    onSuccess: () => {
      toast({
        title: "Announcement Created",
        description: "Your announcement has been created successfully.",
      });
      form.reset();
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create announcement.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<z.infer<typeof announcementFormSchema>> }) => {
      await apiRequest('PUT', `/api/announcements/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Announcement Updated",
        description: "Announcement has been updated successfully.",
      });
      form.reset();
      setEditingAnnouncement(null);
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update announcement.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/announcements/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Announcement Deleted",
        description: "Announcement has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete announcement.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof announcementFormSchema>) => {
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data });
    } else {
      createMutation.mutate({ ...data, createdBy: user?.id || '' });
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    form.reset({
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience,
      createdBy: announcement.createdBy,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'bg-primary text-white';
      case 'students':
        return 'bg-secondary text-white';
      case 'teachers':
        return 'bg-accent text-white';
      case 'parents':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout type="portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-announcements">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Announcements</h1>
            <p className="text-textSecondary">Manage school announcements and news</p>
          </div>

          <Dialog open={isCreateOpen || !!editingAnnouncement} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingAnnouncement(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="create-announcement">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="announcement-form">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Announcement title" {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-audience">
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="students">Students</SelectItem>
                            <SelectItem value="teachers">Teachers</SelectItem>
                            <SelectItem value="parents">Parents</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={6}
                            placeholder="Announcement content..." 
                            {...field} 
                            data-testid="input-body"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateOpen(false);
                        setEditingAnnouncement(null);
                        form.reset();
                      }}
                      data-testid="cancel-announcement"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="submit-announcement"
                    >
                      {createMutation.isPending || updateMutation.isPending 
                        ? 'Saving...' 
                        : editingAnnouncement ? 'Update' : 'Create'
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements List */}
        {announcementsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="h-12 w-12 text-textSecondary mx-auto mb-4" />
              <p className="text-textSecondary mb-4">No announcements created yet</p>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="create-first-announcement">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {announcements.map((announcement: any) => (
              <Card key={announcement.id} data-testid={`announcement-${announcement.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <Badge 
                        className={getAudienceBadgeColor(announcement.audience)}
                        data-testid={`audience-${announcement.id}`}
                      >
                        {announcement.audience}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                        data-testid={`edit-${announcement.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-${announcement.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-textSecondary mb-4" data-testid={`content-${announcement.id}`}>
                    {announcement.body}
                  </p>
                  <div className="text-xs text-textSecondary">
                    Created on {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
