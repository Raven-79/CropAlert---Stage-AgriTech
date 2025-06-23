import { useState } from "react";
import { AlertForm } from "./AlertForm";
import type { AlertFormData } from "./types";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function AddAlert() {
  const [formData, setFormData] = useState<AlertFormData>({
    title: "",
    description: "",
    cropType: "",
    region: "",
    severity: "medium",
    alertType: "disease",
    location: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof AlertFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location) {
      toast.warning("Please select a location on the map.");
      return;
    }
   toast.success("Alert published successfully!");
    navigate("/");
  };

  return (
    <div className=".bg-secondary-background/10 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Publish New Alert</h2>
      </div>

      <AlertForm
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        setLocation={(location) =>
          setFormData((prev) => ({ ...prev, location }))
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
