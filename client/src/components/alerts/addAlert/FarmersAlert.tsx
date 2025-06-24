import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPinIcon, ChevronDownIcon, EditIcon, XIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { format } from "date-fns";
import { useUserStore } from "@/components/stores/user";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

export default function FarmersAlerts() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileComplete, setProfileComplete] = useState(false);
  // Track which alert's map is open by ID
  const [openMapId, setOpenMapId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role !== "farmer") {
      navigate("/unauthorized");
      return;
    }

    // Check if profile is complete
    const hasLocation = !!user.location;
    const hasCropTypes = !!(user.subscribed_crops && user.subscribed_crops.length > 0);
    setProfileComplete(hasLocation && hasCropTypes);

    if (hasLocation && hasCropTypes) {
      fetchAlerts();
    }
  }, [user, navigate]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/alert/crop_alerts", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
         return 
        }
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const toggleMap = (alertId: number) => {
    setOpenMapId(openMapId === alertId ? null : alertId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "pest": return "bg-purple-100 text-purple-800";
      case "disease": return "bg-pink-100 text-pink-800";
      case "weather": return "bg-blue-100 text-blue-800";
      case "soil": return "bg-brown-100 text-brown-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return "N/A";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  if (user?.role !== "farmer") {
    return null;
  }

  if (!profileComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Alerts For Farmers</h1>
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profile Incomplete</AlertTitle>
            <AlertDescription>
              {!user.location && !user.subscribed_crops?.length ? (
                "You need to set your location and at least one crop type to see relevant alerts."
              ) : !user.location ? (
                "You need to set your location to see alerts near you."
              ) : (
                "You need to subscribe to at least one crop type to see relevant alerts."
              )}
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please complete your profile to see alerts relevant to your farm.
            </p>
            <Button asChild>
              <Link to="/profile/edit">
                <EditIcon className="h-4 w-4 mr-2" />
                Complete Your Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Alerts For Your Farm</h1>
        
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No alerts found for your location and crop types.</p>
            <p className="text-sm text-gray-400 mt-2">
              We'll notify you when new alerts matching your profile are published.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                Showing alerts within 10km of your location for:{" "}
                <span className="font-medium">
                  {user.subscribed_crops?.join(", ")}
                </span>
              </p>
            </div>

            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <p className="text-gray-600 mt-1">{alert.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                        {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {alert.crop_type.charAt(0).toUpperCase() + alert.crop_type.slice(1)}
                      </span>
                      {alert.distance && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {formatDistance(alert.distance)} away
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500">
                      <p>Published: {formatDate(alert.created_at)}</p>
                      <p>Expires: {formatDate(alert.expires_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => toggleMap(alert.id)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    {openMapId === alert.id ? "Hide location" : "View location"}
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${openMapId === alert.id ? "transform rotate-180" : ""}`} />
                  </button>
                  
                  {openMapId === alert.id && (
                    <div className="mt-2 h-64 rounded-md overflow-hidden border">
                      <MapContainer
                        center={[alert.location[1], alert.location[0]]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        key={`map-${alert.id}`} // Add key to force re-render
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {/* User's location marker */}
                        {/* <Marker 
                          position={[user.location.lng, user.location.lat]} 
                          icon={userIcon}
                        >
                          <Popup>Your Location</Popup>
                        </Marker> */}
                        {/* Alert location marker */}
                        <Marker position={[alert.location[1], alert.location[0]]}>
                          <Popup>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm">{alert.crop_type}</div>
                            {/* <div className="text-xs text-gray-500">
                              {formatDistance(alert.distance)} from you
                            </div> */}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}