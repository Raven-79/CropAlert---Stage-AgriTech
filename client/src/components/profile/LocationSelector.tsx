import { MapContainer, TileLayer } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, MapPinIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LocationMarker } from "./LocationMarker";

type Props = {
  open: boolean;
  toggleOpen: () => void;
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
};

export function LocationSelector({ open, toggleOpen, position, setPosition }: Props) {
  return (
    <div className="space-y-2">
      <Label>Location</Label>
      {!open ? (
        <button
          type="button"
          onClick={toggleOpen}
          className="flex items-center gap-2 text-sm rounded-md px-3 py-2 w-full hover:bg-secondary-background/80 bg-secondary-background/30"
        >
          <MapPinIcon className="h-4 w-4 text-gray-500" />
          {position ? (
            <span>
              Lat: {position.lat?.toFixed(4) || "N/A"}, Lng: {position.lng?.toFixed(4) || "N/A"}
            </span>
          ) : (
            <span>Select your location</span>
          )}
          <ChevronDownIcon className="h-4 w-4 ml-auto text-gray-500" />
        </button>
      ) : (
        <div className="h-64 rounded-md overflow-hidden relative">
          <MapContainer
            center={position || [31.7917, -7.0926]}
            zoom={position ? 12 : 6}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
          <div className="absolute bottom-4 right-4 z-[1000]">
            <Button type="button" onClick={toggleOpen} className="bg-white text-gray-800 hover:bg-gray-100">
              Confirm Location
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
