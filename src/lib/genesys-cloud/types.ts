export interface GenesysContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  logout: () => void;
}

export interface CallEvent {
  id: string;
  participants: {
    id: string;
    name?: string;
    address?: string;
    purpose: string;
    state: string;
    direction: 'inbound' | 'outbound';
  }[];
  state: string;
}
