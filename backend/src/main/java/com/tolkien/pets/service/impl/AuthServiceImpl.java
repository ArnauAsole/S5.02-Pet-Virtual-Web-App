package com.tolkien.pets.service.impl;

import com.tolkien.pets.dto.auth.LoginDto;
import com.tolkien.pets.dto.auth.RegisterDto;
import com.tolkien.pets.dto.auth.TokenDto;
import com.tolkien.pets.exception.EmailAlreadyUsedException;
import com.tolkien.pets.exception.ForbiddenOperationException;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.security.JwtUtil;
import com.tolkien.pets.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public TokenDto register(RegisterDto dto) {
        if (userRepo.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyUsedException("Email already in use");
        }
        User u = new User();
        u.setEmail(dto.getEmail());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setRoles(Set.of(Role.ROLE_USER));
        u.setProfileImage(dto.getProfileImage());
        u = userRepo.save(u);

        String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRoles());
        return new TokenDto(token, u.getId(), u.getEmail(), u.getRoles(), u.getProfileImage());
    }

    @Override
    public TokenDto login(LoginDto dto) {
        User u = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ForbiddenOperationException("Invalid credentials"));
        if (!passwordEncoder.matches(dto.getPassword(), u.getPassword())) {
            throw new ForbiddenOperationException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRoles());
        return new TokenDto(token, u.getId(), u.getEmail(), u.getRoles(), u.getProfileImage());
    }

    @Override
    public TokenDto refresh(Long userId) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRoles());
        return new TokenDto(token, u.getId(), u.getEmail(), u.getRoles(), u.getProfileImage());
    }
}
