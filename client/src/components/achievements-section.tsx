import { Card, CardContent } from "@/components/ui/card";
import { Building, Medal, Trophy } from "lucide-react";

export default function AchievementsSection() {
  const achievements = [
    {
      id: 1,
      title: "Excursion to Lagos Museum",
      description: "Educational trip expanding our students' cultural knowledge and historical awareness.",
      icon: Building,
      color: "bg-secondary"
    },
    {
      id: 2,
      title: "Cowbell Competition 2025",
      description: "Proud participation in the prestigious Cowbell Mathematics Competition.",
      icon: Medal,
      color: "bg-accent"
    },
    {
      id: 3,
      title: "Nigerian Army Competition",
      description: "3rd Place achievement in the Nigerian Army Educational Competition 2025.",
      icon: Trophy,
      color: "bg-primary"
    }
  ];

  return (
    <section className="py-20 bg-backgroundSurface" data-testid="achievements-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-textPrimary mb-4" data-testid="achievements-title">
            Our Achievements
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Celebrating our students' excellence and school's milestones</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className="bg-surface rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-200"
              data-testid={`achievement-card-${achievement.id}`}
            >
              <CardContent className="p-0">
                <div className={`w-16 h-16 ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <achievement.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary mb-4" data-testid={`achievement-title-${achievement.id}`}>
                  {achievement.title}
                </h3>
                <p className="text-textSecondary" data-testid={`achievement-description-${achievement.id}`}>
                  {achievement.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
