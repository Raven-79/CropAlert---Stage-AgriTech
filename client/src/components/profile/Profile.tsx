import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, MapPinIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUserStore } from "../stores/user";


// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  subscribed_crops: string[];
  location: { lat: number; lng: number } | null;
}

export default function UpdateProfile() {
  const navigate = useNavigate();
  const { user, fetchProfile } = useUserStore();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    subscribed_crops: [],
    location: null,
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        subscribed_crops: user.subscribed_crops || [],
        location: user.location?.coordinates 
          ? { 
              lat: user.location.coordinates[1] || 0, 
              lng: user.location.coordinates[0] || 0 
            }
          : null,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const crops = [...prev.subscribed_crops];
      if (checked) {
        crops.push(value);
      } else {
        const index = crops.indexOf(value);
        if (index > -1) {
          crops.splice(index, 1);
        }
      }
      return { ...prev, subscribed_crops: crops };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const requestBody = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        ...(user?.role === "farmer" && { subscribed_crops: formData.subscribed_crops }),
        ...(formData.location && { 
          location: {
            lat: formData.location.lat,
            lng: formData.location.lng
          }
        }),
      };

      const response = await fetch("/api/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
            .join("\n");
          throw new Error(errorMessages);
        }
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      await fetchProfile(); // Refresh user data
      
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const LocationMarker = ({ position }: { position: { lat: number; lng: number } | null }) => {
    const map = useMapEvents({
      click(e) {
        setFormData(prev => ({ ...prev, location: e.latlng }));
      },
    });

    useEffect(() => {
      if (position) {
        map.flyTo(position, 12);
      }
    }, [position, map]);

    return position ? <Marker position={position} /> : null;
  };

  const cropOptions = ["wheat", "corn", "rice", "soybean", "barley", "cotton", "potatoes"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Update Profile</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="bg-secondary-background/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="bg-secondary-background/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled // Email shouldn't be editable in basic profile update
              className="bg-secondary-background/30"
            />
          </div>

          {user?.role === "farmer" && (
            <div className="space-y-2">
              <Label>Subscribed Crops</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {cropOptions.map((crop) => (
                  <div key={crop} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`crop-${crop}`}
                      value={crop}
                      checked={formData.subscribed_crops.includes(crop)}
                      onChange={handleCropChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`crop-${crop}`} className="text-sm font-medium">
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Location</Label>
            {!mapOpen ? (
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="flex items-center gap-2 text-sm rounded-md px-3 py-2 w-full hover:bg-secondary-background/80 bg-secondary-background/30"
              >
                <MapPinIcon className="h-4 w-4 text-gray-500" />
                {formData.location ? (
                  <span>
                    Lat: {formData.location.lat?.toFixed(4) || "N/A"}, Lng: {formData.location.lng?.toFixed(4) || "N/A"}
                  </span>
                ) : (
                  <span>Select your location</span>
                )}
                <ChevronDownIcon className="h-4 w-4 ml-auto text-gray-500" />
              </button>
            ) : (
              <div className="h-64 rounded-md overflow-hidden relative">
                <MapContainer
                  center={formData.location || [31.7917, -7.0926]} // Default to Morocco
                  zoom={formData.location ? 12 : 6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker position={formData.location} />
                </MapContainer>
                <div className="absolute bottom-4 right-4 z-[1000]">
                  <Button 
                    type="button"
                    onClick={() => setMapOpen(false)}
                    className="bg-white text-gray-800 hover:bg-gray-100"
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}