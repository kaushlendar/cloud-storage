package com.cloudstorage.cloud_storage_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "files")
public class File {

    // ==============================
    // PRIMARY KEY
    // ==============================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==============================
    // FILE DETAILS
    // ==============================

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private Long fileSize;

    private LocalDateTime uploadedAt;

    // Starred file
    private boolean starred = false;

    // Trash status
    private boolean trashed = false;

    // ==============================
    // USER RELATION
    // ==============================

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ==============================
    // FOLDER RELATION
    // ==============================

    @ManyToOne
    @JoinColumn(name = "folder_id")
    private Folder folder;

    // ==============================
    // DEFAULT CONSTRUCTOR
    // ==============================

    public File() {
    }

    // ==============================
    // PARAMETERIZED CONSTRUCTOR
    // ==============================

    public File(
            String fileName,
            String filePath,
            Long fileSize,
            LocalDateTime uploadedAt,
            User user,
            Folder folder) {

        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.user = user;
        this.folder = folder;
    }

    // ==============================
    // GET ID
    // ==============================

    public Long getId() {
        return id;
    }

    // ==============================
    // GET FILE NAME
    // ==============================

    public String getFileName() {
        return fileName;
    }

    // ==============================
    // SET FILE NAME
    // ==============================

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    // ==============================
    // GET FILE PATH
    // ==============================

    public String getFilePath() {
        return filePath;
    }

    // ==============================
    // SET FILE PATH
    // ==============================

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    // ==============================
    // GET FILE SIZE
    // ==============================

    public Long getFileSize() {
        return fileSize;
    }

    // ==============================
    // SET FILE SIZE
    // ==============================

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    // ==============================
    // GET UPLOADED AT
    // ==============================

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    // ==============================
    // SET UPLOADED AT
    // ==============================

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    // ==============================
    // GET USER
    // ==============================

    public User getUser() {
        return user;
    }

    // ==============================
    // SET USER
    // ==============================

    public void setUser(User user) {
        this.user = user;
    }

    // ==============================
    // STARRED
    // ==============================

    public boolean isStarred() {
        return starred;
    }

    public void setStarred(boolean starred) {
        this.starred = starred;
    }

    // ==============================
    // TRASHED
    // ==============================

    public boolean isTrashed() {
        return trashed;
    }

    public void setTrashed(boolean trashed) {
        this.trashed = trashed;
    }

    // ==============================
    // GET FOLDER
    // ==============================

    public Folder getFolder() {
        return folder;
    }

    // ==============================
    // SET FOLDER
    // ==============================

    public void setFolder(Folder folder) {
        this.folder = folder;
    }
}