import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AnnouncementsSection() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['/api/announcements'],
  });

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'general':
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <section id="announcements" className="py-20 bg-backgroundSurface" data-testid="announcements-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-textPrimary mb-4" data-testid="announcements-title">
            Recent Announcements
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Stay updated with the latest news and information</p>
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse" data-testid={`announcement-skeleton-${i}`}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12" data-testid="no-announcements">
            <p className="text-textSecondary text-lg">No announcements available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.slice(0, 6).map((announcement: any) => (
              <Card 
                key={announcement.id} 
                className="bg-surface rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
                data-testid={`announcement-card-${announcement.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getAudienceBadgeColor(announcement.audience)}`}
                      data-testid={`badge-${announcement.audience}`}
                    >
                      {announcement.audience}
                    </Badge>
                    <span className="text-textSecondary text-sm" data-testid={`date-${announcement.id}`}>
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-textPrimary mb-3" data-testid={`title-${announcement.id}`}>
                    {announcement.title}
                  </h3>
                  <p className="text-textSecondary mb-4 line-clamp-3" data-testid={`body-${announcement.id}`}>
                    {announcement.body}
                  </p>
                  <button className="text-primary font-medium hover:underline" data-testid={`read-more-${announcement.id}`}>
                    Read more
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button 
            className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            data-testid="view-all-announcements"
          >
            View All Announcements
          </Button>
        </div>
      </div>
    </section>
  );
}
