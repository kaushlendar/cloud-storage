package com.cloudstorage.cloud_storage_backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Cloud Storage Backend is Running Successfully!";
    }
}