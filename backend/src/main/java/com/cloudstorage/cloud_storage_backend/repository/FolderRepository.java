package com.cloudstorage.cloud_storage_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cloudstorage.cloud_storage_backend.entity.Folder;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByUserId(Long userId);

}