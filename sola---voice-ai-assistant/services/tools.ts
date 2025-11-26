import { FunctionDeclaration, Type } from '@google/genai';
import { Salon } from '../types';

export const MOCK_SALONS: Salon[] = [
  { id: '1', name: 'Tony & Guy', location: 'Adyar', rating: 4.5 },
  { id: '2', name: 'Green Trends', location: 'Adyar', rating: 4.2 },
  { id: '3', name: 'Naturals', location: 'Velachery', rating: 4.0 },
  { id: '4', name: 'Vurve Signature', location: 'Nungambakkam', rating: 4.8 },
];

export const searchPlacesDeclaration: FunctionDeclaration = {
  name: 'search_places',
  description: 'Search for hair salons in a specific area.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The location or neighborhood to search in (e.g., Adyar, T. Nagar).',
      },
    },
    required: ['location'],
  },
};

export const callSalonDeclaration: FunctionDeclaration = {
  name: 'call_salon',
  description: 'Initiate a phone call to a specific salon to book an appointment.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      salonName: {
        type: Type.STRING,
        description: 'The name of the salon to call.',
      },
    },
    required: ['salonName'],
  },
};

export const tools = [
  { functionDeclarations: [searchPlacesDeclaration, callSalonDeclaration] }
];