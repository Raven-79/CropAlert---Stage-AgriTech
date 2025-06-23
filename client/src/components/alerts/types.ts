export interface AlertFormData {
    title: string;
    description: string;
    cropType: string;
    region: string;
    severity: 'low' | 'medium' | 'high';
    alertType: string;
    location: {
      lat: number;
      lng: number;
    } | null;
  }
  
  export interface AddAlertProps {
    onSubmit: (data: AlertFormData) => void;
    
  }
  
  export const cropTypes = [
    "Wheat",
    "Corn",
    "Rice",
    "Soybean",
    "Barley",
    "Cotton",
    "Potatoes"
  ] as const;
  
  export const regions = [
    "North",
    "South",
    "East",
    "West",
    "Central"
  ] as const;
  
  export const alertTypes = [
    "pest",
    "disease",
    "weather",
    "soil",
    "other"
  ] as const;