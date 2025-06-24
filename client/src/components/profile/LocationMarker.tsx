import { useEffect } from "react";
import { Marker, useMapEvents } from "react-leaflet";

type Props = {
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
};

export function LocationMarker({ position, setPosition }: Props) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 12);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
}
