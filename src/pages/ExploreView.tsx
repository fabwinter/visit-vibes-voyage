
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

  // Featured articles
  const featuredArticles = [
    {
      id: "1",
      title: "Best Coffee Spots in Town",
      description: "Discover the hidden gems for coffee lovers in your city",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      tag: "Coffee"
    },
    {
      id: "2",
      title: "Farm to Table Restaurants",
      description: "Experience the freshest ingredients at these local eateries",
      image: "https://images.unsplash.com/photo-1566740933430-9ebd9d31d010?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      tag: "Food"
    },
    {
      id: "3",
      title: "Hidden Brunch Spots",
      description: "Weekend brunch locations that locals love",
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      tag: "Brunch"
    }
  ];

  // City suggestions
  const citySuggestions = [
    {
      name: "New York",
      image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      venues: 230
    },
    {
      name: "San Francisco",
      image: "https://images.unsplash.com/photo-1534050359320-02900022671e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
      venues: 178
    },
    {
      name: "Chicago",
      image: "https://images.unsplash.com/photo-1494522358652-f30e61a60313?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      venues: 156
    }
  ];

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Explore</h1>

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

      {/* Cities section */}
      {activeTab === "cities" && (
        <div>
          <div className="flex items-center mb-4">
            <Compass className="text-visitvibe-primary mr-2" />
            <h2 className="text-xl font-bold">Explore Cities</h2>
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
