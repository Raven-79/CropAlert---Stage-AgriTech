import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { AlertFormData } from './types';

interface AlertTextFieldsProps {
  formData: AlertFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function AlertTextFields({ formData, handleChange }: AlertTextFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Alert Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter a concise title"
          className="bg-secondary-background/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Alert Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the issue or observation in detail"
          rows={4}
          className="bg-secondary-background/20"
          required
        />
      </div>
    </>
  );
}