import { Button } from '@/components/ui/button';
import { AlertTextFields } from './AlertTextFields';
import { AlertSelects } from './AlertSelects';
import { AlertMapPicker } from './AlertMapPicker';
import type { AlertFormData } from './types';

interface AlertFormProps {
  formData: AlertFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: keyof AlertFormData, value: string) => void;
  setLocation: (location: { lat: number; lng: number } | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AlertForm({
  formData,
  handleChange,
  handleSelectChange,
  setLocation,
  onSubmit,
}: AlertFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AlertTextFields formData={formData} handleChange={handleChange} />
      <AlertSelects formData={formData} handleSelectChange={handleSelectChange} />
      <AlertMapPicker location={formData.location} setLocation={setLocation} />

      <div className="flex justify-end gap-3 pt-4">
        
        <Button type="submit">Publish Alert</Button>
      </div>
    </form>
  );
}