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
@Table(name = "shares")
public class Share {

    // ==============================
    // PRIMARY KEY
    // ==============================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==============================
    // FILE
    // ==============================

    @ManyToOne
    @JoinColumn(name = "file_id", nullable = false)
    private File file;


    // ==============================
    // OWNER USER
    // ==============================

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;


    // ==============================
    // SHARE TOKEN
    // ==============================

    @Column(nullable = false, unique = true)
    private String shareToken;


    // ==============================
    // CREATED AT
    // ==============================

    @Column(nullable = false)
    private LocalDateTime createdAt;


    // ==============================
    // ACTIVE
    // ==============================

    @Column(nullable = false)
    private boolean active = true;


    // ==============================
    // DEFAULT CONSTRUCTOR
    // ==============================

    public Share() {
    }


    // ==============================
    // CONSTRUCTOR
    // ==============================

    public Share(File file, User owner, String shareToken) {
        this.file = file;
        this.owner = owner;
        this.shareToken = shareToken;
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }


    // ==============================
    // GETTERS & SETTERS
    // ==============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public File getFile() {
        return file;
    }

    public void setFile(File file) {
        this.file = file;
    }


    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }


    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}