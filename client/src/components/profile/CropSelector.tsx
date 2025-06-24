import { Label } from "@/components/ui/label";

type Props = {
  selected: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const cropOptions = ["wheat", "corn", "rice", "soybean", "barley", "cotton", "potatoes"];

export function CropSelector({ selected, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label>Subscribed Crops</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {cropOptions.map((crop) => (
          <div key={crop} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`crop-${crop}`}
              value={crop}
              checked={selected.includes(crop)}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor={`crop-${crop}`} className="text-sm font-medium">
              {crop.charAt(0).toUpperCase() + crop.slice(1)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
