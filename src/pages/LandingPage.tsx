
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, Tag, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-slate-100 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Track Your Favorite Food Spots
              </h1>
              <p className="text-lg text-gray-600">
                VisitVibe helps you remember and rate every food experience. 
                Never forget that amazing spot you discovered last summer.
              </p>
              <div className="flex gap-4">
                <Link to="/map">
                  <Button className="bg-visitvibe-primary hover:bg-visitvibe-primary/90 text-white">
                    Explore Map
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/app-preview.jpg" 
                alt="VisitVibe App Demo" 
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback if image not found
                  e.currentTarget.src = "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=2000&auto=format&fit=crop";
                }}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How VisitVibe Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<MapPin />}
              title="Discover & Check-In"
              description="Find food venues on the map and check in with a single tap"
            />
            <FeatureCard 
              icon={<Star />}
              title="Rate & Review"
              description="Score your experience across food, service and value"
            />
            <FeatureCard 
              icon={<Calendar />}
              title="Track History"
              description="See a timeline of all your food adventures"
            />
            <FeatureCard 
              icon={<Tag />}
              title="Smart Tags"
              description="Filter venues by categories that matter to you"
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-slate-50 mt-auto">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Your Food Journey Today</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Join VisitVibe and never forget a great meal again. Keep track of all your favorite spots in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth?action=signup">
              <Button className="bg-visitvibe-primary hover:bg-visitvibe-primary/90 text-white">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/map">
              <Button variant="outline">
                Browse the Map
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-slate-50 rounded-full w-fit mb-4 text-visitvibe-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;
