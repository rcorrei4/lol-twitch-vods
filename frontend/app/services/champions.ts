import { apiClient } from './api-client';

export type Champion = {
  name: string;
  imageUrl: string;
};

export async function getChampions(): Promise<Champion[]> {
  try {
    // Option 1: Fetch from backend
    const response = await apiClient.get<Champion[]>('/champions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch champions:', error);
    // Fallback: Return empty array or handle error
    throw error;
  }
}

// Alternative: Static champion list loader
export function getChampionsFromPublic(): Champion[] {
  // This would require a static JSON file or hardcoded list
  // For now, we'll rely on the API endpoint
  return [];
}
