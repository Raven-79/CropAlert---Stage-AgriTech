import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, MapPinIcon, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUserStore } from "../stores/user";
import { format } from "date-fns";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
}

export default function MyAlerts() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (user?.role !== "agronomist") {
      navigate("/unauthorized");
    } else {
      fetchMyAlerts();
    }
  }, [user, navigate]);

  const fetchMyAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/alert/my_alerts", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
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

  const handleDelete = async (alertId: number) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/alert/${alertId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }

      setSuccess("Alert deleted successfully");
      fetchMyAlerts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete alert");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Alerts</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/add-alert")}>
              Create New Alert
            </Button>
            
          </div>
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

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't created any alerts yet.</p>
            <Button 
              onClick={() => navigate("/add-alert")}
              className="mt-4"
            >
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
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
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500">
                      <p>Created: {formatDate(alert.created_at)}</p>
                      <p>Expires: {formatDate(alert.expires_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                   
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(alert.id)}
                      disabled={loading}
                    >
                      <Trash2Icon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    {selectedAlert?.id === alert.id ? "Hide location" : "View location"}
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${selectedAlert?.id === alert.id ? "transform rotate-180" : ""}`} />
                  </button>
                  
                  {selectedAlert?.id === alert.id && (
                    <div className="mt-2 h-64 rounded-md overflow-hidden border">
                      <MapContainer
                        center={[alert.location[1], alert.location[0]]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[alert.location[1], alert.location[0]]}>
                          <Popup>{alert.title}</Popup>
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