export interface InputCreateSchema {
  itemName: string;
  itemDescription?: string;
  price: string;
  stock: string;
  isAvailable: boolean;
}

export interface InputUpdateSchema extends InputCreateSchema {
  id: string;
}

export interface HeaderResponse {
  code: string;
  status: boolean;
  message: string;
}
