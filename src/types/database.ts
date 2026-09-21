export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  position: number;
  size: number | null;
  created_at: string;
};

export type ProductSize = {
  id: string;
  product_id: string;
  size: number;
  quantity: number;
};

export type Product = {
  id: string;
  reference_code: string;
  category_id: string;
  color: string | null;
  description: string | null;
  price: number | null;
  cost_price: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithRelations = Product & {
  category: Category | null;
  product_images: ProductImage[];
  product_sizes: ProductSize[];
};

