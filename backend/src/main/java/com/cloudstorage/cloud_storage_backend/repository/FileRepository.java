package com.cloudstorage.cloud_storage_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cloudstorage.cloud_storage_backend.entity.File;

public interface FileRepository extends JpaRepository<File, Long> {

    // ==============================
    // Get all files of a user
    // ==============================

    List<File> findByUser_Id(Long userId);

    // ==============================
    // Get files inside a specific folder
    // ==============================

    List<File> findByFolder_Id(Long folderId);

    // ==============================
    // Get files of a user inside a specific folder
    // ==============================

    List<File> findByUser_IdAndFolder_Id(Long userId, Long folderId);

    // ==============================
    // Get starred files
    // ==============================

    List<File> findByUser_IdAndStarredTrue(Long userId);

    // ==============================
    // Get user's files ordered by latest
    // ==============================

    List<File> findByUser_IdOrderByUploadedAtDesc(Long userId);

    // ==============================
    // TRASH
    // ==============================

    // Get only files which are NOT in Trash
    List<File> findByUser_IdAndTrashedFalse(Long userId);

    // Get only files which ARE in Trash
    List<File> findByUser_IdAndTrashedTrue(Long userId);
}