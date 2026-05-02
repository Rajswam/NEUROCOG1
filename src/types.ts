export interface CaseRecord {
  id: string;
  caseNumber: number;
  specialty: string;
  presentation: string;
  report: string | null;
  status: 'Pending' | 'Approved' | 'Archived' | 'Delegated';
  createdAt: Date;
}

export type CaseRecordDraft = Omit<CaseRecord, 'caseNumber'>;
