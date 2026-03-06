export interface JournalEntry {
  id: number;
  date: string;
  notes: string;
  statusCode: string;
  createdDate: string;
}

export interface CreateJournalRequest {
  date: string;
  notes: string;
}

export interface UpdateJournalRequest {
  id: number;
  date: string;
  notes: string;
}
