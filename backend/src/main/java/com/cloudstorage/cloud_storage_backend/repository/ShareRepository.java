package com.cloudstorage.cloud_storage_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cloudstorage.cloud_storage_backend.entity.Share;

public interface ShareRepository extends JpaRepository<Share, Long> {

    // Find all shares created by a particular user
    List<Share> findByOwner_Id(Long ownerId);

    // Find active shares created by a user
    List<Share> findByOwner_IdAndActiveTrue(Long ownerId);

    // Find share using token
    Optional<Share> findByShareToken(String shareToken);

    // Find active share using token
    Optional<Share> findByShareTokenAndActiveTrue(String shareToken);

    // Find shares of a particular file
    List<Share> findByFile_Id(Long fileId);
}