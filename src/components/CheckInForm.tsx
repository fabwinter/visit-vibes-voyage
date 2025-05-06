
import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { predefinedTags } from "@/data/mockData";
import { Venue, Visit, VisitRating, DishRating } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (visit: Visit) => void;
  existingVisit?: Visit;
}

const CheckInForm = ({
  venue,
  isOpen,
  onClose,
  onCheckIn,
  existingVisit,
}: CheckInFormProps) => {
  const [rating, setRating] = useState<VisitRating>({
    food: 0,
    ambiance: 0,
    service: 0,
    value: 0,
    overall: 0,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [dishItems, setDishItems] = useState<DishRating[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemRating, setNewItemRating] = useState(0);
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemType, setNewItemType] = useState<"dish" | "drink">("dish");
  const [newItemTags, setNewItemTags] = useState<string[]>([]);

  // Calculate overall rating based on sub-ratings
  useEffect(() => {
    if (rating.food || rating.ambiance || rating.service || rating.value) {
      // Count non-zero ratings
      let count = 0;
      let sum = 0;

      if (rating.food > 0) {
        sum += rating.food;
        count++;
      }
      if (rating.ambiance > 0) {
        sum += rating.ambiance;
        count++;
      }
      if (rating.service > 0) {
        sum += rating.service;
        count++;
      }
      if (rating.value > 0) {
        sum += rating.value;
        count++;
      }

      const overall = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
      setRating((prev) => ({ ...prev, overall }));
    }
  }, [rating.food, rating.ambiance, rating.service, rating.value]);

  // Initialize form with existing visit data if available
  useEffect(() => {
    if (existingVisit) {
      setRating(existingVisit.rating || {
        food: 0,
        ambiance: 0,
        service: 0,
        value: 0,
        overall: 0,
      });
      setSelectedTags(existingVisit.tags || []);
      setNotes(existingVisit.notes || "");
      setDishItems(existingVisit.dishes || []);
    } else {
      // Reset form for new visit
      setRating({
        food: 0,
        ambiance: 0,
        service: 0,
        value: 0,
        overall: 0,
      });
      setSelectedTags([]);
      setNotes("");
      setDishItems([]);
    }
  }, [existingVisit, isOpen]);

  const handleRatingChange = (type: keyof VisitRating, value: number) => {
    setRating((prev) => ({ ...prev, [type]: value }));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleItemTag = (tag: string) => {
    if (newItemTags.includes(tag)) {
      setNewItemTags(newItemTags.filter((t) => t !== tag));
    } else {
      setNewItemTags([...newItemTags, tag]);
    }
  };

  const addDishItem = () => {
    if (newItemName.trim()) {
      const newItem: DishRating = {
        id: uuidv4(),
        name: newItemName,
        rating: newItemRating,
        price: newItemPrice ? parseFloat(newItemPrice) : undefined,
        tags: newItemTags,
        type: newItemType,
        photos: [],
      };
      setDishItems([...dishItems, newItem]);
      setNewItemName("");
      setNewItemRating(0);
      setNewItemPrice("");
      setNewItemTags([]);
    }
  };

  const removeDishItem = (id: string) => {
    setDishItems(dishItems.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    // Create a visit object
    const visit: Visit = {
      id: existingVisit ? existingVisit.id : uuidv4(),
      venueId: venue.id,
      timestamp: existingVisit ? existingVisit.timestamp : new Date().toISOString(),
      rating,
      tags: selectedTags,
      notes,
      dishes: dishItems,
      photos: venue.photos || [],
    };
    onCheckIn(visit);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {existingVisit ? "Edit Visit" : "Check-in to"} {venue.name}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Rate your experience</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Food</label>
                        <StarRating
                          value={rating.food}
                          onChange={(value) => handleRatingChange("food", value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Ambiance</label>
                        <StarRating
                          value={rating.ambiance}
                          onChange={(value) => handleRatingChange("ambiance", value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Service</label>
                        <StarRating
                          value={rating.service}
                          onChange={(value) => handleRatingChange("service", value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Value</label>
                        <StarRating
                          value={rating.value}
                          onChange={(value) => handleRatingChange("value", value)}
                        />
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-50 p-2 rounded-md">
                      <label className="text-xs text-gray-500">Overall Rating</label>
                      <div className="flex items-center">
                        <StarRating
                          value={rating.overall}
                          onChange={(value) => handleRatingChange("overall", value)}
                        />
                        <span className="ml-2 text-lg font-semibold text-gray-700">
                          {rating.overall.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">What did you have?</h4>
                    <div className="space-y-3">
                      {dishItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 p-2 rounded flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.price && (
                              <span className="text-sm ml-2 text-gray-500">
                                ${item.price.toFixed(2)}
                              </span>
                            )}
                            <div className="flex mt-1">
                              <StarRating value={item.rating} readOnly size="sm" />
                              <span className="ml-1 text-xs">
                                {item.type === "drink" ? "🥤" : "🍽️"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeDishItem(item.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <div className="space-y-2 border border-gray-200 rounded-md p-2">
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder="Item name"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="w-full text-sm"
                            />
                          </div>
                          <div className="w-20">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={newItemPrice}
                              onChange={(e) => setNewItemPrice(e.target.value)}
                              className="w-full text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs rounded ${
                                newItemType === "dish"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                              onClick={() => setNewItemType("dish")}
                            >
                              🍽️ Dish
                            </button>
                            <button
                              type="button"
                              className={`px-2 py-1 text-xs rounded ${
                                newItemType === "drink"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                              onClick={() => setNewItemType("drink")}
                            >
                              🥤 Drink
                            </button>
                          </div>
                          <StarRating
                            value={newItemRating}
                            onChange={setNewItemRating}
                            size="sm"
                          />
                        </div>

                        <div className="flex">
                          <Button size="sm" onClick={addDishItem} className="w-full text-xs">
                            Add Item
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {predefinedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedTags.includes(tag)
                              ? "bg-purple-100 text-purple-700 border border-purple-300"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any thoughts about your visit?"
                      className="w-full h-20"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {existingVisit ? "Update Visit" : "Check In"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CheckInForm;
