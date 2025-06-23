// src/components/alerts/AddAlert/AlertMapPicker.tsx
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Removed unused import of SearchControl
import { useEffect, useState } from "react";
import { ChevronDownIcon, MapPinIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Moroccan cities data
const moroccanCities: { name: string; ar: string; coords: [number, number] }[] =
  [
    { name: "Rabat", ar: "الرباط", coords: [34.020882, -6.84165] },
    { name: "Casablanca", ar: "الدار البيضاء", coords: [33.57311, -7.589843] },
    { name: "Settat", ar: "سطات", coords: [33.00242, -7.619733] },
    { name: "Safi", ar: "آسفي", coords: [32.283333, -9.233333] },
    { name: "Marrakech", ar: "مراكش", coords: [31.629472, -7.981084] },
    { name: "Fes", ar: "فاس", coords: [34.033333, -5.0] },
    { name: "Tangier", ar: "طنجة", coords: [35.766667, -5.8] },
    { name: "Agadir", ar: "أكادير", coords: [30.416667, -9.6] },
    { name: "Oujda", ar: "وجدة", coords: [34.68, -1.91] },
    { name: "Tétouan", ar: "تطوان", coords: [35.57, -5.37] },
    { name: "Meknes", ar: "مكناس", coords: [33.893333, -5.55] },
    { name: "Kénitra", ar: "القنيطرة", coords: [34.26, -6.58] },
    { name: "El Jadida", ar: "الجديدة", coords: [33.25, -8.5] },
    { name: "Beni Mellal", ar: "بني ملال", coords: [32.33, -6.35] },
    { name: "Khouribga", ar: "خريبكة", coords: [32.9, -6.87] },
    { name: "Nador", ar: "الناظور", coords: [35.17, -2.93] },
  ];

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AlertMapPickerProps {
  location: { lat: number; lng: number } | null;
  setLocation: (location: { lat: number; lng: number } | null) => void;
}

function LocationMarker({
  location,
}: {
  location: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 12);
    }
  }, [location, map]);

  return location ? <Marker position={location} /> : null;
}

function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="absolute top-4 left-4 z-[1000] w-64 bg-white p-2 rounded-md shadow-md">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(searchQuery)}
        />
        <Button size="icon" onClick={() => onSearch(searchQuery)}>
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AlertMapPicker({ location, setLocation }: AlertMapPickerProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { name: string; ar: string; coords: [number, number] }[]
  >([]);

  const handleSearch = (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const results = moroccanCities.filter(
      (city) =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.ar.includes(query)
    );
    setSearchResults(results);
  };

  const handleCitySelect = (city: {
    name: string;
    ar: string;
    coords: [number, number];
  }) => {
    setLocation({ lat: city.coords[0], lng: city.coords[1] });
    setSearchResults([]);
  };

  return (
    <div className="space-y-2">
      <Label>Geolocation</Label>
      {!mapOpen ? (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="flex items-center gap-2 text-sm rounded-md px-3 py-2 w-full hover:bg-secondary-background/80 bg-secondary-background"
        >
          <MapPinIcon className="h-4 w-4 text-gray-500" />
          {location ? (
            <span>
              {moroccanCities.find(
                (c) =>
                  c.coords[0].toFixed(2) === location.lat.toFixed(2) &&
                  c.coords[1].toFixed(2) === location.lng.toFixed(2)
              )?.name ||
                `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </span>
          ) : (
            <span>Tag your current location</span>
          )}
          <ChevronDownIcon className="h-4 w-4 ml-auto text-gray-500" />
        </button>
      ) : (
        <div className="h-96 rounded-md overflow-hidden relative">
          <MapContainer
            center={[31.7917, -7.0926]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker location={location} />

            {/* Click handler */}
            <ClickHandler setLocation={setLocation} />
          </MapContainer>

          <SearchBar onSearch={handleSearch} />

          {searchResults.length > 0 && (
            <div className="absolute top-20 left-4 z-[1000] w-64 bg-white rounded-md shadow-md max-h-60 overflow-y-auto">
              {searchResults.map((city, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm text-gray-600">{city.ar}</div>
                </div>
              ))}
            </div>
          )}

          <div className="absolute bottom-4 right-4 z-[1000]">
            <Button
              onClick={() => setMapOpen(false)}
              className="bg-white text-gray-800 hover:bg-gray-100"
            >
              Confirm Location
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClickHandler({
  setLocation,
}: {
  setLocation: (loc: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });

  return null;
}
function useMapEvents({ click }: { click(e: any): void }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: any) => {
      click(e);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, click]);

  return null;
}
