import { Button } from "@/components/ui/button";
import { UserPlus, Phone } from "lucide-react";

export default function HeroSection() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative" data-testid="hero-section">
      <div 
        className="relative h-[600px] bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`
        }}
        data-testid="hero-background"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
              Excellence in <span className="text-accent">Education</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto" data-testid="hero-subtitle">
              Nurturing disciplined, morally upright, and academically sound students in the heart of Ogun State
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-accent hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={scrollToContact}
                data-testid="button-enroll"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Enroll Your Child Now
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-textPrimary px-8 py-4 text-lg font-semibold transition-all duration-200"
                onClick={scrollToContact}
                data-testid="button-contact"
              >
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
