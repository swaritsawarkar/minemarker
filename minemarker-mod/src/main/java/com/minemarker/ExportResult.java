package com.minemarker;

import java.nio.file.Path;
import java.util.List;

public class ExportResult {
	private final Path sessionDirectory;
	private final List<Path> writtenFiles;

	public ExportResult(Path sessionDirectory, List<Path> writtenFiles) {
		this.sessionDirectory = sessionDirectory;
		this.writtenFiles = List.copyOf(writtenFiles);
	}

	public Path sessionDirectory() {
		return sessionDirectory;
	}

	public List<Path> writtenFiles() {
		return writtenFiles;
	}
}
