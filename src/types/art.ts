export interface ArtItem {
  id: string;
  title: string;
  artist: string;
  price: number;
  createdAt: string; // ISO date string
  imageKey: string; // R2 storage key
}
