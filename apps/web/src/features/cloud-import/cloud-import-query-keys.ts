export const cloudImportQueryKeys = {
  localDraftsModal: () => ["cloud-import", "local-drafts", "modal"] as const,
  filePreviewSpreadsheet: (uri: string) =>
    ["cloud-import", "file-preview", "spreadsheet", uri] as const,
  filePreviewCsv: (uri: string) =>
    ["cloud-import", "file-preview", "csv", uri] as const,
  filePreviewTxt: (uri: string) =>
    ["cloud-import", "file-preview", "txt", uri] as const,
};
