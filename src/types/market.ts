export interface HotspotData {
  area: string;
  score: number;
  factors: string[];
  predictedGrowth: number;
  investmentType: 'Residential' | 'Commercial' | 'Mixed';
} 