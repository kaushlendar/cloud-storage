package com.cloudstorage.cloud_storage_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "folders")
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String folderName;

    @Column(nullable = false)
    private Long userId;

    private LocalDateTime createdAt;

    // ==============================
    // DEFAULT CONSTRUCTOR
    // ==============================

    public Folder() {
    }

    // ==============================
    // PARAMETERIZED CONSTRUCTOR
    // ==============================

    public Folder(String folderName, Long userId) {
        this.folderName = folderName;
        this.userId = userId;
    }

    // ==============================
    // AUTO CREATE DATE
    // ==============================

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ==============================
    // GETTERS AND SETTERS
    // ==============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFolderName() {
        return folderName;
    }

    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}