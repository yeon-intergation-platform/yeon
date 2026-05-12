package world.yeon.backend.local_import_analysis.service;

import java.util.Locale;

public enum FileKind {
	SPREADSHEET("spreadsheet"), CSV("csv"), TXT("txt"), PDF("pdf"), IMAGE("image"), UNSUPPORTED("unsupported");

	private final String wireValue;
	FileKind(String wireValue) { this.wireValue = wireValue; }
	public String wireValue() { return wireValue; }

	public static FileKind detect(String name, String mimeType) {
		String lowerName = name == null ? "" : name.toLowerCase(Locale.ROOT);
		String mime = mimeType == null ? "" : mimeType.toLowerCase(Locale.ROOT);
		if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls") || mime.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || mime.equals("application/vnd.ms-excel")) return SPREADSHEET;
		if (lowerName.endsWith(".csv") || mime.equals("text/csv") || mime.equals("application/csv")) return CSV;
		if (lowerName.endsWith(".txt") || lowerName.endsWith(".tsv") || lowerName.endsWith(".md") || mime.startsWith("text/plain") || mime.startsWith("text/tab-separated-values") || mime.startsWith("text/markdown")) return TXT;
		if (lowerName.endsWith(".pdf") || mime.equals("application/pdf")) return PDF;
		if (lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".heic") || lowerName.endsWith(".heif") || lowerName.endsWith(".webp") || lowerName.endsWith(".gif") || mime.startsWith("image/")) return IMAGE;
		return UNSUPPORTED;
	}
}
