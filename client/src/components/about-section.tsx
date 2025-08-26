import { GraduationCap, Heart, Star } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-surface" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-textPrimary mb-4" data-testid="about-title">
            About Treasure-Home School
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="prose prose-lg text-textSecondary">
              <p className="text-lg leading-relaxed mb-6" data-testid="about-description-1">
                Treasure-Home School is located in Seriki Soyinka, Ifo, Ogun State. We are committed to 
                <strong className="text-primary"> Qualitative Education and Moral Excellence</strong>. 
              </p>
              <p className="text-lg leading-relaxed mb-6" data-testid="about-description-2">
                Even as a rural-based school, we stand out as the best in our community, raising 
                <strong className="text-secondary"> disciplined, morally upright, and academically sound students</strong>.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center" data-testid="feature-quality">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="text-white text-2xl" />
                </div>
                <h3 className="font-semibold text-textPrimary">Quality Education</h3>
              </div>
              <div className="text-center" data-testid="feature-moral">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white text-2xl" />
                </div>
                <h3 className="font-semibold text-textPrimary">Moral Excellence</h3>
              </div>
              <div className="text-center" data-testid="feature-leader">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-white text-2xl" />
                </div>
                <h3 className="font-semibold text-textPrimary">Community Leader</h3>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Students in classroom learning" 
              className="rounded-xl shadow-2xl w-full"
              data-testid="about-image"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-xl shadow-xl" data-testid="experience-badge">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm">Years of Excellence</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
