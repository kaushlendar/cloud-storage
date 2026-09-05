package com.cloudstorage.cloud_storage_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudstorage.cloud_storage_backend.entity.File;
import com.cloudstorage.cloud_storage_backend.entity.Share;
import com.cloudstorage.cloud_storage_backend.entity.User;
import com.cloudstorage.cloud_storage_backend.repository.FileRepository;
import com.cloudstorage.cloud_storage_backend.repository.ShareRepository;
import com.cloudstorage.cloud_storage_backend.repository.UserRepository;

@RestController
@RequestMapping("/api/shares")
@CrossOrigin(origins = "*")
public class ShareController {

    private final ShareRepository shareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    public ShareController(
            ShareRepository shareRepository,
            FileRepository fileRepository,
            UserRepository userRepository) {

        this.shareRepository = shareRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    // =========================================
    // CREATE SHARE LINK
    // =========================================

    @PostMapping("/create/{fileId}/{userId}")
    public ResponseEntity<?> createShare(
            @PathVariable Long fileId,
            @PathVariable Long userId) {

        try {

            File file = fileRepository
                    .findById(fileId)
                    .orElse(null);

            if (file == null) {
                return ResponseEntity
                        .badRequest()
                        .body("File not found");
            }

            User user = userRepository
                    .findById(userId)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity
                        .badRequest()
                        .body("User not found");
            }

            // Check file ownership
            if (file.getUser() == null ||
                    !file.getUser().getId().equals(userId)) {

                return ResponseEntity
                        .status(403)
                        .body("You are not allowed to share this file");
            }

            // Generate unique share token
            String token = UUID.randomUUID().toString();

            Share share = new Share(
                    file,
                    user,
                    token
            );

            Share savedShare = shareRepository.save(share);

            // Hide password
            user.setPassword(null);

            return ResponseEntity.ok(savedShare);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Error creating share link: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================
    // GET ALL SHARES OF USER
    // =========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserShares(
            @PathVariable Long userId) {

        try {

            List<Share> shares =
                    shareRepository
                            .findByOwner_IdAndActiveTrue(userId);

            // Hide passwords
            shares.forEach(share -> {

                if (share.getOwner() != null) {
                    share.getOwner().setPassword(null);
                }

                if (share.getFile() != null &&
                        share.getFile().getUser() != null) {

                    share.getFile()
                            .getUser()
                            .setPassword(null);
                }
            });

            return ResponseEntity.ok(shares);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Error fetching shared files: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================
    // GET SHARE BY TOKEN
    // =========================================

    @GetMapping("/link/{token}")
    public ResponseEntity<?> getShareByToken(
            @PathVariable String token) {

        try {

            Share share = shareRepository
                    .findByShareTokenAndActiveTrue(token)
                    .orElse(null);

            if (share == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            // Hide owner password
            if (share.getOwner() != null) {
                share.getOwner().setPassword(null);
            }

            // Hide file owner password
            if (share.getFile() != null &&
                    share.getFile().getUser() != null) {

                share.getFile()
                        .getUser()
                        .setPassword(null);
            }

            return ResponseEntity.ok(share);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Error opening share link: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================
    // DOWNLOAD FILE USING SHARE TOKEN
    // =========================================

    @GetMapping("/download/{token}")
    public ResponseEntity<?> downloadSharedFile(
            @PathVariable String token) {

        try {

            Share share = shareRepository
                    .findByShareTokenAndActiveTrue(token)
                    .orElse(null);

            if (share == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            File file = share.getFile();

            if (file == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            Path path = Paths.get(file.getFilePath());

            if (!Files.exists(path)) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            Resource resource =
                    new UrlResource(path.toUri());

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
                            "Shared file download failed: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================
    // DISABLE SHARE LINK
    // =========================================

    @DeleteMapping("/{shareId}")
    public ResponseEntity<?> disableShare(
            @PathVariable Long shareId) {

        try {

            Share share = shareRepository
                    .findById(shareId)
                    .orElse(null);

            if (share == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            share.setActive(false);

            shareRepository.save(share);

            return ResponseEntity.ok(
                    "Share link disabled successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Error disabling share link: "
                                    + e.getMessage()
                    );
        }
    }
}