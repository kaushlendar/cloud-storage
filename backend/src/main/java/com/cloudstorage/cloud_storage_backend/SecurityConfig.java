package com.cloudstorage.cloud_storage_backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // ==========================================
    // PASSWORD ENCODER
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==========================================
    // SECURITY CONFIGURATION
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Disable CSRF for API testing
            .csrf(csrf -> csrf.disable())

            // API authorization
            .authorizeHttpRequests(auth -> auth

                // Authentication APIs
                .requestMatchers("/api/auth/**").permitAll()

                // File APIs - testing ke liye
                .requestMatchers("/api/files/**").permitAll()

                // Other requests
                .anyRequest().permitAll()
            )

            // Disable default HTML login page
            .formLogin(form -> form.disable());

        return http.build();
    }
}