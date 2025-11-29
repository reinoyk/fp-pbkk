export interface Novel {
  id: number;
  title: string;
  author: string;
  rating: number;
  language: string;
  year_published: number;
}

export interface Review {
  id: number;
  userId: number;
  novelId: number;
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}