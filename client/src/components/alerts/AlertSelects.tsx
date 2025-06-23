import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AlertFormData } from "./types";
import { cropTypes, regions, alertTypes } from "./types";

interface AlertSelectsProps {
  formData: AlertFormData;
  handleSelectChange: (name: keyof AlertFormData, value: string) => void;
}

export function AlertSelects({
  formData,
  handleSelectChange,
}: AlertSelectsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cropType">Crop Type</Label>
          <Select
            value={formData.cropType}
            onValueChange={(value) => handleSelectChange("cropType", value)}
          >
            <SelectTrigger className="bg-secondary-background/20">
              <SelectValue placeholder="Select crop type" />
            </SelectTrigger>
            <SelectContent>
              {cropTypes.map((crop) => (
                <SelectItem key={crop} value={crop}>
                  {crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select
            value={formData.region}
            onValueChange={(value) => handleSelectChange("region", value)}
          >
            <SelectTrigger className="bg-secondary-background/20">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Severity</Label>
          <Select
            value={formData.severity}
            onValueChange={(value) =>
              handleSelectChange("severity", value as "low" | "medium" | "high")
            }
          >
            <SelectTrigger className="bg-secondary-background/20">
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
          <Label>Alert Type</Label>
          <Select
            value={formData.alertType}
            onValueChange={(value) => handleSelectChange("alertType", value)}
          >
            <SelectTrigger className="bg-secondary-background/20">
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
      </div>
    </>
  );
}
