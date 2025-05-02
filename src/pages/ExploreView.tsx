import { useState } from "react";
import { Compass, Award, BookOpen, MapPin } from "lucide-react";
import { mockVenues, mockVisits } from "../data/mockData";
import VenueCard from "../components/VenueCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ExploreView = () => {
  const [activeTab, setActiveTab] = useState<string>("featured");

  // Get top rated venues
  const topRatedVenues = [...mockVenues]
    .map(venue => {
      // Find all visits for this venue
      const venueVisits = mockVisits.filter(visit => visit.venueId === venue.id);
      
      // Calculate average rating
      const avgRating = venueVisits.length > 0
        ? venueVisits.reduce((sum, visit) => sum + visit.rating.overall, 0) / venueVisits.length
        : 0;
      
      // Add the latest visit and average rating to the venue
      return {
        ...venue,
        lastVisit: venueVisits[0],
        averageRating: avgRating
      };
    })
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  // Featured Australian food culture articles
  const featuredArticles = [
    {
      id: "1",
      title: "Sydney's Best Coffee Roasters",
      description: "Discover the artisanal coffee scene that's making Sydney a global coffee destination",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop",
      tag: "Coffee"
    },
    {
      id: "2",
      title: "Farm to Table in New South Wales",
      description: "Meet the local producers transforming Sydney's restaurant scene",
      image: "https://images.unsplash.com/photo-1595187139760-5cedf9d51617?q=80&w=2031&auto=format&fit=crop",
      tag: "Food"
    },
    {
      id: "3",
      title: "Ultimate Sydney Brunch Guide",
      description: "The best spots for a long Australian brunch with friends and family",
      image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=2070&auto=format&fit=crop",
      tag: "Brunch"
    }
  ];

  // Australian city suggestions
  const citySuggestions = [
    {
      name: "Sydney",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop",
      venues: 230
    },
    {
      name: "Melbourne",
      image: "https://images.unsplash.com/photo-1514395462725-fb4566210144?q=80&w=2071&auto=format&fit=crop",
      venues: 178
    },
    {
      name: "Brisbane",
      image: "https://images.unsplash.com/photo-1629428000853-e19b9441e9ef?q=80&w=2070&auto=format&fit=crop",
      venues: 156
    },
    {
      name: "Perth",
      image: "https://images.unsplash.com/photo-1567555499335-411ce0a0aa69?q=80&w=2070&auto=format&fit=crop",
      venues: 98
    },
    {
      name: "Adelaide",
      image: "https://images.unsplash.com/photo-1597331900568-76b04467bdcd?q=80&w=2070&auto=format&fit=crop",
      venues: 87
    },
    {
      name: "Hobart",
      image: "https://images.unsplash.com/photo-1617891770536-fe7769ed6748?q=80&w=2070&auto=format&fit=crop",
      venues: 45
    }
  ];

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Explore Australia</h1>

      {/* Tab navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {["featured", "top rated", "articles", "cities"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              activeTab === tab
                ? "bg-visitvibe-primary text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Featured section */}
      {activeTab === "featured" && (
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Top Rated Places</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("top rated")}
              >
                See all
              </Button>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                {topRatedVenues.map((venue) => (
                  <div key={venue.id} className="w-64">
                    <VenueCard
                      venue={venue}
                      lastVisit={venue.lastVisit}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Featured Articles</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("articles")}
              >
                See all
              </Button>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                {featuredArticles.map((article) => (
                  <Card key={article.id} className="w-72">
                    <div className="h-40 relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <span className="absolute top-2 right-2 bg-visitvibe-primary text-white px-2 py-1 rounded-full text-xs">
                        {article.tag}
                      </span>
                    </div>
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-base">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription>{article.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button size="sm" variant="outline" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Read More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Explore Cities</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("cities")}
              >
                See all
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {citySuggestions.map((city) => (
                <Card key={city.name} className="overflow-hidden">
                  <div className="h-28 relative">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <h3 className="text-white text-xl font-bold">{city.name}</h3>
                    </div>
                  </div>
                  <CardFooter className="p-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600">{city.venues} venues</span>
                    <Button size="sm" variant="ghost">
                      <MapPin className="h-4 w-4 mr-1" />
                      Explore
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Top rated section */}
      {activeTab === "top rated" && (
        <div>
          <div className="flex items-center mb-4">
            <Award className="text-visitvibe-primary mr-2" />
            <h2 className="text-xl font-bold">Top Rated Places</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRatedVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                lastVisit={venue.lastVisit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Articles section */}
      {activeTab === "articles" && (
        <div>
          <div className="flex items-center mb-4">
            <BookOpen className="text-visitvibe-primary mr-2" />
            <h2 className="text-xl font-bold">Featured Articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                <div className="h-48 relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 bg-visitvibe-primary text-white px-2 py-1 rounded-full text-xs">
                    {article.tag}
                  </span>
                </div>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{article.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button>Read Article</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cities section - Australia focused */}
      {activeTab === "cities" && (
        <div>
          <div className="flex items-center mb-4">
            <Compass className="text-visitvibe-primary mr-2" />
            <h2 className="text-xl font-bold">Explore Australian Cities</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {citySuggestions.map((city) => (
              <Card key={city.name} className="overflow-hidden">
                <div className="h-48 relative">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h3 className="text-white text-2xl font-bold">{city.name}</h3>
                  </div>
                </div>
                <CardFooter className="flex justify-between items-center">
                  <span>{city.venues} venues</span>
                  <Button>
                    <MapPin className="h-4 w-4 mr-2" />
                    Explore
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreView;
