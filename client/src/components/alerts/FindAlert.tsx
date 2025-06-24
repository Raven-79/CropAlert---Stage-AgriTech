import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronDownIcon, MapPinIcon, FilterIcon, XIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const cropTypes = ["wheat", "corn", "rice", "soybean", "barley", "cotton", "potatoes"];

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  alert_type: string;
  crop_type: string;
  created_at: string;
  expires_at: string;
  location: [number, number]; // [lng, lat]
  distance?: number; // in meters
}

interface SearchFilters {
  location: [number, number] | null;
  crop_type: string;
  radius: number;
}

export default function FindAlert() {
  const [filters, setFilters] = useState<SearchFilters>({
    location: null,
    crop_type: "wheat",
    radius: 10000, // meters (10km)
  });
  const [results, setResults] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  const handleSearch = async () => {
    if (!filters.location) {
      setError("Please select a location");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/alert/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          location: filters.location,
          crop_type: filters.crop_type,
          radius: filters.radius
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        throw new Error("Failed to search alerts");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      location: null,
      crop_type: "wheat",
      radius: 10000,
    });
    setResults([]);
    setError("");
  };

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setFilters(prev => ({
          ...prev,
          location: [e.latlng.lng, e.latlng.lat]
        }));
        setMapOpen(false);
      },
    });

    return filters.location ? (
      <Marker position={[filters.location[1], filters.location[0]]} />
    ) : null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Search Alerts</h1>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Crop Type Filter */}
          <div className="space-y-2">
            <Label>Crop Type</Label>
            <Select
              value={filters.crop_type}
              onValueChange={(value) => setFilters({ ...filters, crop_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent>
                {cropTypes.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Radius Filter */}
          <div className="space-y-2">
            <Label htmlFor="radius">Search Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              min="1"
              max="100"
              value={filters.radius / 1000}
              onChange={(e) => setFilters({
                ...filters,
                radius: Math.max(1000, Math.min(100000, Number(e.target.value) * 1000))
              })}
            />
          </div>

          {/* Location Filter */}
        </div>
          <div className="space-y-2">
            <Label>Location</Label>
            {!mapOpen ? (
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 w-full ${
                  filters.location 
                    ? "bg-green-50 text-green-800" 
                    : "bg-secondary-background hover:bg-secondary-background/80"
                }`}
              >
                <MapPinIcon className="h-4 w-4" />
                {filters.location ? (
                  <span>
                    Lat: {filters.location[1].toFixed(4)}, Lng: {filters.location[0].toFixed(4)}
                  </span>
                ) : (
                  <span>Click to select location</span>
                )}
                <ChevronDownIcon className="h-4 w-4 ml-auto" />
              </button>
            ) : (
              <div className="h-64 rounded-md overflow-hidden relative">
                <MapContainer
                  center={filters.location ? [filters.location[1], filters.location[0]] : [31.7917, -7.0926]}
                  zoom={filters.location ? 12 : 6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker />
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

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSearch}
            disabled={loading || !filters.location}
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search Alerts"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">
              Found {results.length} alert{results.length !== 1 ? "s" : ""}
            </h2>
            
            <div className="space-y-4">
              {results.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <p className="text-gray-600 mt-1">{alert.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === "low" ? "bg-green-100 text-green-800" :
                      alert.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {alert.crop_type.charAt(0).toUpperCase() + alert.crop_type.slice(1)}
                    </span>
                    {alert.distance && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {Math.round(alert.distance / 1000)} km away
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}