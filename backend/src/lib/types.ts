export interface Product {
  id: string;
  name: string;
  link: string;
  imageUrl: string;
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  purchased: boolean;
}

export type SortOption = 'Priority' | 'Name' | 'None';
