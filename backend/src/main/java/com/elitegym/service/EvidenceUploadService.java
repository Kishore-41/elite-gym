package com.elitegym.service;

import com.elitegym.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Slf4j
@Service
public class EvidenceUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "pdf", "mp4", "mov", "mp3", "m4a"
    );

    private final Path uploadDir = Paths.get("uploads", "evidence").toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
            log.info("Initialized evidence upload directory: {}", uploadDir);
        } catch (IOException e) {
            log.error("Failed to create evidence upload directory: {}", uploadDir, e);
        }
    }

    public List<String> storeEvidenceFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }

        List<String> fileUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            if (file.getSize() > MAX_FILE_SIZE_BYTES) {
                throw new BadRequestException("File " + file.getOriginalFilename() + " exceeds the 25MB limit.");
            }

            String originalFilename = Optional.ofNullable(file.getOriginalFilename()).orElse("evidence");
            String extension = getFileExtension(originalFilename).toLowerCase();

            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new BadRequestException("Unsupported file format: ." + extension + 
                        ". Supported formats: .jpg, .png, .pdf, .mp4, .mov, .mp3, .m4a");
            }

            String uniqueFilename = UUID.randomUUID().toString() + "_" + sanitizeFilename(originalFilename);
            Path targetPath = uploadDir.resolve(uniqueFilename);

            try {
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                String relativeUrl = "/uploads/evidence/" + uniqueFilename;
                fileUrls.add(relativeUrl);
                log.info("Stored evidence file: {} -> {}", originalFilename, relativeUrl);
            } catch (IOException e) {
                log.error("Failed to store evidence file: {}", originalFilename, e);
                throw new BadRequestException("Could not store evidence file: " + originalFilename);
            }
        }

        return fileUrls;
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex + 1);
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
    }
}
