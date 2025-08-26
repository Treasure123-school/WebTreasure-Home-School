import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function GallerySection() {
  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ['/api/gallery'],
  });

  // Fallback images for when no gallery images are available
  const fallbackImages = [
    {
      id: 'fallback-1',
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Science Laboratory'
    },
    {
      id: 'fallback-2',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Library Reading'
    },
    {
      id: 'fallback-3',
      imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Achievement Awards'
    },
    {
      id: 'fallback-4',
      imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'School Building'
    },
    {
      id: 'fallback-5',
      imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Classroom Learning'
    },
    {
      id: 'fallback-6',
      imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Achievement Trophy'
    },
    {
      id: 'fallback-7',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Library Study'
    },
    {
      id: 'fallback-8',
      imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
      caption: 'Students Learning'
    }
  ];

  const imagesToDisplay = galleryImages.length > 0 ? galleryImages : fallbackImages;

  return (
    <section id="gallery" className="py-20 bg-surface" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-textPrimary mb-4" data-testid="gallery-title">
            School Gallery
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Glimpses of life at Treasure-Home School</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className="relative group overflow-hidden rounded-lg animate-pulse bg-gray-200 h-48"
                data-testid={`gallery-skeleton-${i}`}
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagesToDisplay.slice(0, 8).map((image: any) => (
              <div 
                key={image.id} 
                className="relative group overflow-hidden rounded-lg cursor-pointer"
                data-testid={`gallery-image-${image.id}`}
              >
                <img 
                  src={image.imageUrl} 
                  alt={image.caption || 'Gallery image'} 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <Search className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button 
            className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            data-testid="view-full-gallery"
          >
            View Full Gallery
          </Button>
        </div>
      </div>
    </section>
  );
}
