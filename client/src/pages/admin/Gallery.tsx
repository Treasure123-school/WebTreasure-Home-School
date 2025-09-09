// client/src/pages/admin/Gallery.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Import the new helper
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Plus, Trash2, Upload, RefreshCw } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  uploaded_by: string;
}

export default function AdminGallery() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
    
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: ''
  });

  // Redirect if not authenticated or not admin
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
    }
  }, [user, authLoading, toast]);

  // ✅ FIX: Fetch gallery images from your backend API
  const { data: galleryImages = [], isLoading: galleryLoading, refetch } = useQuery<GalleryImage[]>({
    queryKey: ['gallery'],
    queryFn: async () => {
      return await apiRequest<GalleryImage[]>('GET', '/api/gallery');
    },
    enabled: !!user && user.role_name === 'Admin',
  });

  // ✅ FIX: Create gallery image mutation to use backend API
  const createMutation = useMutation({
    mutationFn: async (imageData: { image_url: string; caption: string }) => {
      // The `uploaded_by` field will be set on the backend based on the authenticated user.
      return await apiRequest('POST', '/api/gallery', imageData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image has been added to the gallery successfully.",
      });
      setFormData({ imageUrl: '', caption: '' });
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add image to gallery.",
        variant: "destructive",
      });
    },
  });

  // ✅ FIX: Delete gallery image mutation to use backend API
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/gallery/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image has been removed from the gallery.",
      });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please provide an image URL",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      image_url: formData.imageUrl,
      caption: formData.caption
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(id);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-gallery">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Gallery Management</h1>
            <p className="text-textSecondary">Manage school photos and images</p>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={galleryLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                  
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="gallery-form">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      required
                      data-testid="input-image-url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption (optional)</Label>
                    <Textarea
                      id="caption"
                      placeholder="Image description..."
                      value={formData.caption}
                      onChange={(e) => setFormData({...formData, caption: e.target.value})}
                      rows={3}
                      data-testid="input-caption"
                    />
                  </div>

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
                      <Upload className="h-4 w-4 mr-2" />
                      {createMutation.isPending ? 'Adding...' : 'Add Image'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group" data-testid={`image-${image.id}`}>
                <div className="relative">
                  <img 
                    src={image.image_url} 
                    alt={image.caption || 'Gallery image'} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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
                <CardContent className="p-4">
                  {image.caption && (
                    <p className="text-sm text-textSecondary line-clamp-2 mb-2" data-testid={`caption-${image.id}`}>
                      {image.caption}
                    </p>
                  )}
                  <p className="text-xs text-textSecondary">
                    Added {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
