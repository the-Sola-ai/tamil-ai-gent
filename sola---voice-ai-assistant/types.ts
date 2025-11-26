export interface Salon {
  id: string;
  name: string;
  location: string;
  rating: number;
}

export enum AppState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  CALLING_SALON = 'CALLING_SALON',
  IN_CALL_WITH_RECEPTIONIST = 'IN_CALL_WITH_RECEPTIONIST'
}

export interface LogEntry {
  timestamp: Date;
  sender: 'user' | 'sola' | 'system';
  message: string;
}

// Tool Arguments
export interface SearchPlacesArgs {
  location: string;
}

export interface CallSalonArgs {
  salonName: string;
}