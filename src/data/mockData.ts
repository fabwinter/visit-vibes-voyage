import { Venue, Visit, VisitRating, DishRating } from "../types";

export const mockVenues: Venue[] = [
  {
    id: "v1",
    name: "The Grounds of Alexandria",
    address: "7A, 2 Huntley St, Alexandria NSW 2015",
    coordinates: { lat: -33.9102, lng: 151.1939 },
    photos: [
      "https://images.unsplash.com/photo-1533300272856-b660687a7b84?q=80&w=2070&auto=format&fit=crop",
    ],
    website: "https://thegrounds.com.au",
    hours: "Mon-Fri: 7am-3pm, Sat-Sun: 7:30am-4pm",
    phoneNumber: "(02) 9699 2225",
    priceLevel: 2,
    category: ["Café", "Breakfast", "Brunch"],
  },
  {
    id: "v2",
    name: "Quay Restaurant",
    address: "Upper Level, Overseas Passenger Terminal, The Rocks NSW 2000",
    coordinates: { lat: -33.8568, lng: 151.2089 },
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074&auto=format&fit=crop",
    ],
    website: "https://www.quay.com.au",
    hours: "Wed-Sun: 6pm-10pm",
    phoneNumber: "(02) 9251 5600",
    priceLevel: 4,
    category: ["Fine Dining", "Australian", "Seafood"],
  },
  {
    id: "v3",
    name: "Bourke Street Bakery",
    address: "633 Bourke St, Surry Hills NSW 2010",
    coordinates: { lat: -33.8865, lng: 151.2119 },
    photos: [
      "https://images.unsplash.com/photo-1579697096985-41fe1430e5df?q=80&w=2070&auto=format&fit=crop",
    ],
    website: "https://bourkestreetbakery.com.au",
    hours: "Daily: 7am-4pm",
    phoneNumber: "(02) 9699 1011",
    priceLevel: 1,
    category: ["Bakery", "Café", "Breakfast"],
  },
  {
    id: "v4",
    name: "Tetsuya's",
    address: "529 Kent St, Sydney NSW 2000",
    coordinates: { lat: -33.8753, lng: 151.2044 },
    photos: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
    ],
    website: "https://tetsuyas.com",
    hours: "Tue-Sat: 6pm-10pm",
    phoneNumber: "(02) 9267 2900",
    priceLevel: 4,
    category: ["Japanese", "Fine Dining", "Degustation"],
  },
];

export const mockDishRatings: Record<string, DishRating[]> = {
  v1: [
    {
      id: "d1",
      name: "Avocado Toast with Vegemite",
      photos: ["https://images.unsplash.com/photo-1603046891744-1f76eb10aec3?q=80&w=2087&auto=format&fit=crop"],
      price: 16.99,
      rating: 4.5,
      tags: ["Crunchy", "Fresh", "Filling"],
      type: "dish"
    },
    {
      id: "d2",
      name: "Flat White",
      photos: ["https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=1974&auto=format&fit=crop"],
      price: 5.50,
      rating: 5,
      tags: ["Perfect", "Creamy", "Strong"],
      type: "drink"
    },
  ],
  v2: [
    {
      id: "d3",
      name: "Tasmanian Ocean Trout",
      photos: ["https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop"],
      price: 45.99,
      rating: 4,
      tags: ["Fresh", "Melt-in-mouth", "Beautiful presentation"],
      type: "dish"
    },
    {
      id: "d4",
      name: "Mud Crab Congee",
      photos: ["https://images.unsplash.com/photo-1626545212217-d169043d4bf1?q=80&w=2071&auto=format&fit=crop"],
      price: 52.99,
      rating: 5,
      tags: ["Delicate", "Creamy", "Worth it"],
      type: "dish"
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
      "https://images.unsplash.com/photo-1533300272856-b660687a7b84?q=80&w=2070&auto=format&fit=crop",
    ],
  },
  {
    id: "visit2",
    venueId: "v2",
    timestamp: new Date(2023, 3, 20, 19, 0).toISOString(),
    dishes: mockDishRatings.v2,
    rating: mockVisitRatings.v2,
    tags: ["Date Night", "Dinner"],
    notes: "Amazing views of Sydney Harbour. Service was impeccable.",
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074&auto=format&fit=crop",
    ],
  },
  {
    id: "visit3",
    venueId: "v3",
    timestamp: new Date(2023, 3, 25, 12, 30).toISOString(),
    dishes: [],
    rating: mockVisitRatings.v3,
    tags: ["Lunch", "Family-Friendly"],
    notes: "Best sourdough in Sydney! The sausage rolls are a must-try.",
    photos: [
      "https://images.unsplash.com/photo-1579697096985-41fe1430e5df?q=80&w=2070&auto=format&fit=crop",
    ],
  },
  {
    id: "visit4",
    venueId: "v4",
    timestamp: new Date(2023, 4, 5, 20, 0).toISOString(),
    dishes: [],
    rating: mockVisitRatings.v4,
    tags: ["Anniversary", "Splurge"],
    notes: "The degustation menu was a culinary journey. Worth every dollar for a special occasion.",
    photos: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
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
  wishlistCategories: [] // Add this missing property
};
