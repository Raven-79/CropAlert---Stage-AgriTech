import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUserStore } from "../stores/user";

import { CropSelector } from "./CropSelector";
import { LocationSelector } from "./LocationSelector";
import { Alerts } from "./Alerts";

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

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        subscribed_crops: user.subscribed_crops || [],
        location: user.location?.coordinates
          ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] }
          : null,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const crops = checked
        ? [...prev.subscribed_crops, value]
        : prev.subscribed_crops.filter((c) => c !== value);
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
        ...(formData.location && { location: formData.location }),
      };

      const response = await fetch("/api/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg =
          data.errors &&
          Object.entries(data.errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join("\n");
        throw new Error(errMsg || data.error || "Update failed");
      }

      setSuccess("Profile updated successfully");
      await fetchProfile();
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Update Profile</h1>
          
        </div>

        <Alerts error={error} success={success} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required className="bg-secondary-background/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required className="bg-secondary-background/30"/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled className="bg-secondary-background/30"/>
          </div>

          {user?.role === "farmer" && (
            <CropSelector selected={formData.subscribed_crops} onChange={handleCropChange} />
          )}

          <LocationSelector
            open={mapOpen}
            toggleOpen={() => setMapOpen(!mapOpen)}
            position={formData.location}
            setPosition={(pos) => setFormData((prev) => ({ ...prev, location: pos }))}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
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
