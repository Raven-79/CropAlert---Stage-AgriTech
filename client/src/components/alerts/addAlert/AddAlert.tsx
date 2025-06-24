import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  MapPinIcon,
  ChevronDownIcon,
} from "lucide-react";
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
import { useUserStore } from "../../stores/user";

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

interface AlertFormData {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  alert_type: string;
  crop_type: string;
  expires_at: string;
  location: { lat: number; lng: number } | null;
}

const alertTypes = ["pest", "disease", "weather", "soil", "other"];
const cropTypes = [
  "wheat",
  "corn",
  "rice",
  "soybean",
  "barley",
  "cotton",
  "potatoes",
];

export default function CreateAlert() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [formData, setFormData] = useState<AlertFormData>({
    title: "",
    description: "",
    severity: "medium",
    alert_type: "disease",
    crop_type: "wheat",
    expires_at: "",
    location: null,
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "agronomist") {
      navigate("/unauthorized");
    } else if (!user.is_approved) {
      setError(
        "Your account needs admin approval before you can create alerts"
      );
    }
  }, [user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof AlertFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateTimeForBackend = (datetimeString: string) => {
    // Convert to format: YYYY-MM-DDTHH:MM:SS
    const date = new Date(datetimeString);
    const pad = (num: number) => num.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?.is_approved) {
      setError(
        "Your account needs admin approval before you can create alerts"
      );
      return;
    }

    if (!formData.title.trim()) {
      setError("Alert title is required");
      return;
    }

    if (!formData.expires_at) {
      setError("Expiration date is required");
      return;
    }

    if (!formData.location) {
      setError("Please select a location on the map");
      return;
    }

    setIsLoading(true);

    try {
      // Format the data exactly as expected by your backend
      const requestBody = {
        title: formData.title,
        description: formData.description || null,
        severity: formData.severity,
        alert_type: formData.alert_type,
        crop_type: formData.crop_type,
        expires_at: formatDateTimeForBackend(formData.expires_at),
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng,
        },
      };

      console.log("Request Body:", requestBody);
      const response = await fetch("/api/alert/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${(messages as string[]).join(", ")}`
            )
            .join("\n");
          throw new Error(errorMessages);
        }
        throw new Error(data.error || "Failed to create alert");
      }

      setSuccess("Alert created successfully");
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        alert_type: "disease",
        crop_type: "wheat",
        expires_at: "",
        location: null,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setFormData((prev) => ({
          ...prev,
          location: { lat: e.latlng.lat, lng: e.latlng.lng },
        }));
      },
    });

    useEffect(() => {
      if (formData.location) {
        map.flyTo([formData.location.lat, formData.location.lng], 12);
      }
    }, [formData.location, map]);

    return formData.location ? (
      <Marker position={[formData.location.lat, formData.location.lng]} />
    ) : null;
  };

  if (user?.role !== "agronomist") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Alert</h1>
        </div>

        {!user.is_approved && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Approval Required</AlertTitle>
            <AlertDescription>
              Your account needs admin approval before you can create alerts
            </AlertDescription>
          </Alert>
        )}

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
          <div className="space-y-2">
            <Label htmlFor="title">Alert Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a concise title"
              required
              disabled={!user.is_approved}
              className="bg-secondary-background/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Alert Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail"
              rows={4}
              disabled={!user.is_approved}
              className="bg-secondary-background/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  handleSelectChange(
                    "severity",
                    value as "low" | "medium" | "high"
                  )
                }
                disabled={!user.is_approved}
              >
                <SelectTrigger className="bg-secondary-background/30">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Type *</Label>
              <Select
                value={formData.alert_type}
                onValueChange={(value) =>
                  handleSelectChange("alert_type", value)
                }
                disabled={!user.is_approved}
              >
                <SelectTrigger className="bg-secondary-background/30">
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Crop Type *</Label>
              <Select
                value={formData.crop_type}
                onValueChange={(value) =>
                  handleSelectChange("crop_type", value)
                }
                disabled={!user.is_approved}
              >
                <SelectTrigger className="bg-secondary-background/30">
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
            <div className="space-y-2 ">
              <Label htmlFor="expires_at">Expiration Date *</Label>
              <Input
                id="expires_at"
                name="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={handleChange}
                required
                disabled={!user.is_approved}
                className="bg-secondary-background/30"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              {!mapOpen ? (
                <button
                  type="button"
                  onClick={() => user.is_approved && setMapOpen(true)}
                  disabled={!user.is_approved}
                  className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 w-full ${
                    user.is_approved
                      ? "hover:bg-secondary-background/80 bg-secondary-background/30"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                >
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  {formData.location ? (
                    <span>
                      Lat: {formData.location.lat?.toFixed(4)}, Lng:{" "}
                      {formData.location.lng?.toFixed(4)}
                    </span>
                  ) : (
                    <span>Select alert location</span>
                  )}
                  <ChevronDownIcon className="h-4 w-4 ml-auto text-gray-500" />
                </button>
              ) : (
                <div className="h-64 rounded-md overflow-hidden relative">
                  <MapContainer
                    center={
                      formData.location
                        ? [formData.location.lat, formData.location.lng]
                        : [31.7917, -7.0926]
                    }
                    zoom={formData.location ? 12 : 6}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker />
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
            <Button type="submit" disabled={isLoading || !user.is_approved}>
              {isLoading ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
