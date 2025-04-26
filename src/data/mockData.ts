
import { Venue, Visit, VisitRating, DishRating } from "../types";

export const mockVenues: Venue[] = [
  {
    id: "v1",
    name: "Café Delicious",
    address: "123 Main St, Downtown",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
    ],
    website: "https://cafe-delicious.example.com",
    hours: "Mon-Fri: 7am-7pm, Sat-Sun: 8am-5pm",
    phoneNumber: "(555) 123-4567",
    priceLevel: 2,
    category: ["Café", "Breakfast", "Lunch"],
  },
  {
    id: "v2",
    name: "Sushi Paradise",
    address: "456 Ocean Ave, Seafront",
    coordinates: { lat: 37.7839, lng: -122.4089 },
    photos: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=2025&auto=format&fit=crop",
    ],
    website: "https://sushi-paradise.example.com",
    hours: "Daily: 11am-10pm",
    phoneNumber: "(555) 234-5678",
    priceLevel: 3,
    category: ["Japanese", "Sushi", "Dinner"],
  },
  {
    id: "v3",
    name: "Pizza Corner",
    address: "789 Market St, Cityville",
    coordinates: { lat: 37.7899, lng: -122.4014 },
    photos: [
      "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=2127&auto=format&fit=crop",
    ],
    website: "https://pizza-corner.example.com",
    hours: "Daily: 11am-11pm",
    phoneNumber: "(555) 345-6789",
    priceLevel: 1,
    category: ["Italian", "Pizza", "Casual"],
  },
  {
    id: "v4",
    name: "Fine Dining Experience",
    address: "101 Luxury Blvd, Uptown",
    coordinates: { lat: 37.7929, lng: -122.4094 },
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    ],
    website: "https://fine-dining.example.com",
    hours: "Tue-Sun: 5pm-11pm, Closed Mondays",
    phoneNumber: "(555) 456-7890",
    priceLevel: 4,
    category: ["Fine Dining", "French", "Wine Bar"],
  },
];

export const mockDishRatings: Record<string, DishRating[]> = {
  v1: [
    {
      id: "d1",
      name: "Avocado Toast",
      photo: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?q=80&w=2127&auto=format&fit=crop",
      price: 12.99,
      rating: 4.5,
      tags: ["Crunchy", "Fresh", "Filling"],
    },
    {
      id: "d2",
      name: "Latte",
      photo: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=2037&auto=format&fit=crop",
      price: 4.50,
      rating: 5,
      tags: ["Perfect", "Creamy", "Strong"],
    },
  ],
  v2: [
    {
      id: "d3",
      name: "Salmon Nigiri",
      photo: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
      price: 8.99,
      rating: 4,
      tags: ["Fresh", "Melt-in-mouth"],
    },
    {
      id: "d4",
      name: "Dragon Roll",
      photo: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=2070&auto=format&fit=crop",
      price: 16.99,
      rating: 5,
      tags: ["Spicy", "Crunchy", "Worth it"],
    },
  ],
};

export const mockVisitRatings: Record<string, VisitRating> = {
  v1: {
    food: 4.5,
    ambiance: 4,
    service: 4,
    value: 3.5,
    overall: 4.1,
  },
  v2: {
    food: 5,
    ambiance: 4.5,
    service: 3.5,
    value: 3,
    overall: 4.2,
  },
  v3: {
    food: 3.5,
    ambiance: 3,
    service: 4,
    value: 4.5,
    overall: 3.7,
  },
  v4: {
    food: 5,
    ambiance: 5,
    service: 5,
    value: 2.5,
    overall: 4.5,
  },
};

export const mockVisits: Visit[] = [
  {
    id: "visit1",
    venueId: "v1",
    timestamp: new Date(2023, 3, 15, 9, 30).toISOString(),
    dishes: mockDishRatings.v1,
    rating: mockVisitRatings.v1,
    tags: ["Breakfast", "Solo Work"],
    notes: "Great spot for morning work sessions. WiFi was reliable.",
    photos: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
    ],
  },
  {
    id: "visit2",
    venueId: "v2",
    timestamp: new Date(2023, 3, 20, 19, 0).toISOString(),
    dishes: mockDishRatings.v2,
    rating: mockVisitRatings.v2,
    tags: ["Date Night", "Dinner"],
    notes: "Amazing sushi, a bit pricey but worth it for special occasions.",
    photos: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=2025&auto=format&fit=crop",
    ],
  },
  {
    id: "visit3",
    venueId: "v3",
    timestamp: new Date(2023, 3, 25, 12, 30).toISOString(),
    dishes: [],
    rating: mockVisitRatings.v3,
    tags: ["Lunch", "Family-Friendly"],
    notes: "Quick and easy lunch option. Kids loved it!",
    photos: [
      "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=2127&auto=format&fit=crop",
    ],
  },
  {
    id: "visit4",
    venueId: "v4",
    timestamp: new Date(2023, 4, 5, 20, 0).toISOString(),
    dishes: [],
    rating: mockVisitRatings.v4,
    tags: ["Anniversary", "Splurge"],
    notes: "Impeccable service and food. Quite expensive but perfect for our anniversary.",
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    ],
  },
];

export const predefinedTags = [
  "Date Night",
  "Family-Friendly",
  "Solo Work",
  "Outdoor Seating",
  "Pet-Friendly",
  "Late-Night",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Quick Bite",
  "Worth the Wait",
  "Hidden Gem",
  "Special Occasion",
  "Budget-Friendly",
  "Vegetarian-Friendly",
];

export const mockUserProfile = {
  id: "user1",
  name: "Alex Johnson",
  email: "alex@example.com",
  photo: "https://i.pravatar.cc/150?img=12",
  visits: mockVisits,
  savedVenues: [mockVenues[0], mockVenues[2]],
  tags: predefinedTags,
};
