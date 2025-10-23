package com.tolkien.pets.service;

import com.tolkien.pets.dto.auth.LoginDto;
import com.tolkien.pets.dto.auth.RegisterDto;
import com.tolkien.pets.dto.auth.TokenDto;

public interface AuthService {
    TokenDto register(RegisterDto registerDto);

    TokenDto login(LoginDto loginDto);

    TokenDto refresh(Long userId);
}
