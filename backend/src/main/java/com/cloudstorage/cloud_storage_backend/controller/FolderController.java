package com.cloudstorage.cloud_storage_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudstorage.cloud_storage_backend.entity.Folder;
import com.cloudstorage.cloud_storage_backend.repository.FolderRepository;

@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "*")
public class FolderController {

    private final FolderRepository folderRepository;

    public FolderController(FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    // ==============================
    // CREATE FOLDER
    // ==============================

    @PostMapping("/create")
    public ResponseEntity<Folder> createFolder(
            @RequestBody Folder folder) {

        Folder savedFolder = folderRepository.save(folder);

        return ResponseEntity.ok(savedFolder);
    }

    // ==============================
    // GET USER FOLDERS
    // ==============================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Folder>> getFoldersByUser(
            @PathVariable Long userId) {

        List<Folder> folders =
                folderRepository.findByUserId(userId);

        return ResponseEntity.ok(folders);
    }

    // ==============================
    // GET FOLDER BY ID
    // ==============================

    @GetMapping("/{id}")
    public ResponseEntity<Folder> getFolderById(
            @PathVariable Long id) {

        return folderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==============================
    // DELETE FOLDER
    // ==============================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFolder(
            @PathVariable Long id) {

        if (!folderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        folderRepository.deleteById(id);

        return ResponseEntity.ok(
                "Folder deleted successfully"
        );
    }
}