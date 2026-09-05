package com.cloudstorage.cloud_storage_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cloudstorage.cloud_storage_backend.entity.File;
import com.cloudstorage.cloud_storage_backend.entity.Folder;
import com.cloudstorage.cloud_storage_backend.entity.User;
import com.cloudstorage.cloud_storage_backend.repository.FileRepository;
import com.cloudstorage.cloud_storage_backend.repository.FolderRepository;
import com.cloudstorage.cloud_storage_backend.repository.UserRepository;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;

    private final String uploadDir = "uploads/";

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public FileController(
            FileRepository fileRepository,
            UserRepository userRepository,
            FolderRepository folderRepository) {

        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.folderRepository = folderRepository;
    }

    // ==========================================
    // UPLOAD FILE
    // ==========================================

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile multipartFile,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "folderId", required = false) Long folderId) {

        try {

            if (multipartFile.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("File is empty");
            }

            // ==========================================
            // FIND USER
            // ==========================================

            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity
                        .badRequest()
                        .body("User not found");
            }

            // ==========================================
            // FIND FOLDER
            // ==========================================

            Folder folder = null;

            if (folderId != null) {

                folder = folderRepository
                        .findById(folderId)
                        .orElse(null);

                if (folder == null) {
                    return ResponseEntity
                            .badRequest()
                            .body("Folder not found");
                }

                if (!folder.getUserId().equals(userId)) {
                    return ResponseEntity
                            .badRequest()
                            .body("Folder does not belong to this user");
                }
            }

            // ==========================================
            // CREATE UPLOAD DIRECTORY
            // ==========================================

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // ==========================================
            // GET ORIGINAL FILE NAME
            // ==========================================

            String fileName =
                    multipartFile.getOriginalFilename();

            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body("Invalid file name");
            }

            // Prevent unsafe path
            fileName = Paths
                    .get(fileName)
                    .getFileName()
                    .toString();

            // ==========================================
            // CREATE UNIQUE FILE NAME
            // ==========================================

            String uniqueFileName =
                    System.currentTimeMillis()
                    + "_"
                    + fileName;

            // ==========================================
            // CREATE PHYSICAL FILE PATH
            // ==========================================

            Path filePath =
                    uploadPath.resolve(uniqueFileName);

            // ==========================================
            // SAVE FILE TO SERVER
            // ==========================================

            Files.write(
                    filePath,
                    multipartFile.getBytes()
            );

            // ==========================================
            // CREATE DATABASE FILE OBJECT
            // ==========================================

            File file = new File();

            file.setFileName(fileName);

            file.setFilePath(
                    filePath.toString()
            );

            file.setFileSize(
                    multipartFile.getSize()
            );

            file.setUploadedAt(
                    LocalDateTime.now()
            );

            file.setUser(user);

            file.setFolder(folder);

            // Starred default false
            file.setStarred(false);

            // Trash default false
            file.setTrashed(false);

            // ==========================================
            // SAVE FILE RECORD
            // ==========================================

            File savedFile =
                    fileRepository.save(file);

            // Don't expose password
            user.setPassword(null);

            return ResponseEntity.ok(savedFile);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "File upload failed: "
                            + e.getMessage()
                    );
        }
    }

    // ==========================================
    // GET ALL FILES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<File>> getAllFiles() {

        List<File> files =
                fileRepository.findAll();

        files.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(files);
    }

    // ==========================================
    // GET USER FILES
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserFiles(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }

        List<File> files =
                fileRepository.findByUser_Id(userId);

        files.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(files);
    }

    // ==========================================
    // GET FOLDER FILES
    // ==========================================

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<?> getFolderFiles(
            @PathVariable Long folderId) {

        if (!folderRepository.existsById(folderId)) {

            return ResponseEntity
                    .badRequest()
                    .body("Folder not found");
        }

        List<File> files =
                fileRepository.findByFolder_Id(folderId);

        files.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(files);
    }

    // ==========================================
    // GET USER + FOLDER FILES
    // ==========================================

    @GetMapping("/user/{userId}/folder/{folderId}")
    public ResponseEntity<?> getUserFolderFiles(
            @PathVariable Long userId,
            @PathVariable Long folderId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }

        if (!folderRepository.existsById(folderId)) {

            return ResponseEntity
                    .badRequest()
                    .body("Folder not found");
        }

        List<File> files =
                fileRepository.findByUser_IdAndFolder_Id(
                        userId,
                        folderId
                );

        files.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(files);
    }

    // ==========================================
    // GET STARRED FILES
    // ==========================================

    @GetMapping("/user/{userId}/starred")
    public ResponseEntity<?> getStarredFiles(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }

        List<File> starredFiles =
                fileRepository.findByUser_IdAndStarredTrue(userId);

        starredFiles.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(starredFiles);
    }

    // ==========================================
    // GET RECENT FILES
    // ==========================================

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<?> getRecentFiles(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }

        List<File> files =
                fileRepository.findByUser_Id(userId);

        // Latest uploaded files first
        files.sort((a, b) ->
                b.getUploadedAt().compareTo(a.getUploadedAt())
        );

        files.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(files);
    }

    // ==========================================
    // GET TRASH FILES
    // ==========================================

    @GetMapping("/user/{userId}/trash")
    public ResponseEntity<?> getTrashFiles(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }

        List<File> trashFiles =
                fileRepository.findByUser_IdAndTrashedTrue(userId);

        trashFiles.forEach(file -> {

            if (file.getUser() != null) {
                file.getUser().setPassword(null);
            }

        });

        return ResponseEntity.ok(trashFiles);
    }

    // ==========================================
    // GET FILE BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getFileById(
            @PathVariable Long id) {

        return fileRepository
                .findById(id)
                .map(file -> {

                    if (file.getUser() != null) {
                        file.getUser().setPassword(null);
                    }

                    return ResponseEntity.ok(file);
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // ==========================================
    // DOWNLOAD FILE
    // ==========================================

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadFile(
            @PathVariable Long id) {

        try {

            File file = fileRepository
                    .findById(id)
                    .orElse(null);

            if (file == null) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            Path path =
                    Paths.get(file.getFilePath());

            if (!Files.exists(path)) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (!resource.exists()
                    || !resource.isReadable()) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            String contentType =
                    Files.probeContentType(path);

            if (contentType == null) {
                contentType =
                        "application/octet-stream";
            }

            return ResponseEntity
                    .ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\""
                                    + file.getFileName()
                                    + "\""
                    )
                    .header(
                            HttpHeaders.CONTENT_TYPE,
                            contentType
                    )
                    .body(resource);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "File download failed: "
                                    + e.getMessage()
                    );
        }
    }

    // ==========================================
    // STAR / UNSTAR FILE
    // ==========================================

    @PutMapping("/star/{id}")
    public ResponseEntity<?> toggleStar(
            @PathVariable Long id) {

        return fileRepository
                .findById(id)
                .map(file -> {

                    file.setStarred(
                            !file.isStarred()
                    );

                    File updatedFile =
                            fileRepository.save(file);

                    if (updatedFile.getUser() != null) {
                        updatedFile
                                .getUser()
                                .setPassword(null);
                    }

                    return ResponseEntity.ok(updatedFile);
                })
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // ==========================================
    // MOVE FILE TO TRASH
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(
            @PathVariable Long id) {

        File file = fileRepository
                .findById(id)
                .orElse(null);

        if (file == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        // Move to Trash
        file.setTrashed(true);

        fileRepository.save(file);

        return ResponseEntity.ok(
                "File moved to Trash successfully"
        );
    }

    // ==========================================
    // RESTORE FILE FROM TRASH
    // ==========================================

    @PutMapping("/restore/{id}")
    public ResponseEntity<?> restoreFile(
            @PathVariable Long id) {

        File file = fileRepository
                .findById(id)
                .orElse(null);

        if (file == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        // Restore file
        file.setTrashed(false);

        File restoredFile =
                fileRepository.save(file);

        if (restoredFile.getUser() != null) {
            restoredFile
                    .getUser()
                    .setPassword(null);
        }

        return ResponseEntity.ok(restoredFile);
    }

    // ==========================================
    // PERMANENT DELETE FILE
    // ==========================================

    @DeleteMapping("/permanent/{id}")
    public ResponseEntity<?> permanentlyDeleteFile(
            @PathVariable Long id) {

        File file = fileRepository
                .findById(id)
                .orElse(null);

        if (file == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        try {

            // Get physical file path
            Path path =
                    Paths.get(file.getFilePath());

            // Delete physical file
            Files.deleteIfExists(path);

            // Delete database record
            fileRepository.delete(file);

            return ResponseEntity.ok(
                    "File permanently deleted successfully"
            );

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Permanent deletion failed: "
                                    + e.getMessage()
                    );
        }
    }
}