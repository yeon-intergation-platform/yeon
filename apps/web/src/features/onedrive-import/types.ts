export interface OneDriveFile {
  id: string;
  name: string;
  size: number;
  lastModifiedAt: string;
  mimeType?: string;
}

export interface ImportStudent {
  name: string;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
}

export interface ImportCohort {
  name: string;
  students: ImportStudent[];
}

export interface ImportPreview {
  cohorts: ImportCohort[];
}

export interface ImportResult {
  spaces: number;
  members: number;
}
