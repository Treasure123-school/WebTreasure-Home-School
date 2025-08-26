import { GraduationCap, Phone, MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div data-testid="footer-school-info">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Treasure-Home School</h3>
              </div>
            </div>
            <p className="text-gray-400 mb-6">Quality Education & Moral Excellence</p>
            <p className="text-gray-400 text-sm">Seriki Soyinka, Ifo, Ogun State, Nigeria</p>
          </div>
          
          {/* Contact Info */}
          <div data-testid="footer-contact-info">
            <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="text-primary w-5" />
                <span className="text-gray-400">08037906249 / 08107921359</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="text-primary w-5" />
                <span className="text-gray-400">08107921359</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-primary w-5" />
                <span className="text-gray-400">treasurehomeschool@gmail.com</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div data-testid="footer-quick-links">
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <div className="space-y-3">
              <a 
                href="/api/login" 
                className="block text-gray-400 hover:text-white transition-colors"
                data-testid="footer-link-portal"
              >
                Portal Access
              </a>
              <button 
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-gray-400 hover:text-white transition-colors text-left"
                data-testid="footer-link-enroll"
              >
                Enroll Now
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('gallery');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-gray-400 hover:text-white transition-colors text-left"
                data-testid="footer-link-gallery"
              >
                Gallery
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('announcements');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-gray-400 hover:text-white transition-colors text-left"
                data-testid="footer-link-announcements"
              >
                Announcements
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-gray-400 hover:text-white transition-colors text-left"
                data-testid="footer-link-contact"
              >
                Contact Us
              </button>
            </div>
          </div>
          
          {/* Coming Soon */}
          <div data-testid="footer-coming-soon">
            <h3 className="text-lg font-semibold mb-6">Coming Soon</h3>
            <div className="space-y-3">
              <div className="text-gray-500 cursor-not-allowed">
                Academics Portal
              </div>
              <div className="text-gray-500 cursor-not-allowed">
                E-Library
              </div>
              <div className="text-gray-500 cursor-not-allowed">
                Events Calendar
              </div>
              <div className="text-gray-500 cursor-not-allowed">
                Student Attendance
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400" data-testid="footer-copyright">
            &copy; 2025 Treasure-Home School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
