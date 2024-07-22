export interface GetAllData {
  header: {
    code: string;
    status: string;
    message: string;
  };
  data: any[];
}

export interface GetData {
  header: {
    code: string;
    status: string;
    message: string;
  };
  data: any;
}

export interface HeaderResponse {
  code: string;
  status: boolean;
  message: string;
}

//schema
export interface InputCreateSchema {
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  pic?: string | null;
  isActive: boolean;
}

export interface InputUpdateSchema extends InputCreateSchema {
  id: string;
}
