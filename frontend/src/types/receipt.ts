export interface Receipt {
  id: number;
  title: string;
  amount: number;
  date: string;
  category?: string;
  imagePath: string;
  statusCode: string;
  createdDate: string;
}

export interface CreateReceiptRequest {
  title: string;
  amount: number;
  date: string;
  category?: string;
}

export interface UpdateReceiptRequest {
  id: number;
  title: string;
  amount: number;
  date: string;
  category?: string;
}
