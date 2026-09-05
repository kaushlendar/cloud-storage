package com.cloudstorage.cloud_storage_backend.service;

import org.springframework.stereotype.Service;

import com.cloudstorage.cloud_storage_backend.entity.User;
import com.cloudstorage.cloud_storage_backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        return userRepository.save(user);
    }
}