import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertGallerySchema } from "@shared/schema";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Plus, Trash2, Search } from "lucide-react";
import { z } from "zod";

const galleryFormSchema = insertGallerySchema;

export default function AdminGallery() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const { data: galleryImages = [], isLoading: galleryLoading } = useQuery({
    queryKey: ['/api/gallery'],
    enabled: !!user && user.role === 'admin',
    retry: false,
  });

  const form = useForm<z.infer<typeof galleryFormSchema>>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      imageUrl: '',
      caption: '',
      uploadedBy: user?.id || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof galleryFormSchema>) => {
      await apiRequest('POST', '/api/gallery', data);
    },
    onSuccess: () => {
      toast({
        title: "Image Added",
        description: "Image has been added to the gallery successfully.",
      });
      form.reset();
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add image to gallery.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/gallery/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Image Deleted",
        description: "Image has been removed from the gallery.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof galleryFormSchema>) => {
    createMutation.mutate({ ...data, uploadedBy: user?.id || '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(id);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-gallery">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Gallery Management</h1>
            <p className="text-textSecondary">Manage school photos and images</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-image">
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Image</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="gallery-form">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                            data-testid="input-image-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Image description..." 
                            {...field} 
                            data-testid="input-caption"
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
                      onClick={() => setIsCreateOpen(false)}
                      data-testid="cancel-gallery"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="submit-gallery"
                    >
                      {createMutation.isPending ? 'Adding...' : 'Add Image'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Gallery Grid */}
        {galleryLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : galleryImages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="h-12 w-12 text-textSecondary mx-auto mb-4" />
              <p className="text-textSecondary mb-4">No images in the gallery yet</p>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="add-first-image">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryImages.map((image: any) => (
              <Card key={image.id} className="overflow-hidden group" data-testid={`image-${image.id}`}>
                <div className="relative">
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption || 'Gallery image'} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-image-${image.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {image.caption && (
                  <CardContent className="p-3">
                    <p className="text-sm text-textSecondary line-clamp-2" data-testid={`caption-${image.id}`}>
                      {image.caption}
                    </p>
                    <p className="text-xs text-textSecondary mt-1">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
