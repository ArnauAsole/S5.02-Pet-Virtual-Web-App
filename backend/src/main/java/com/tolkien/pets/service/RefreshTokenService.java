package com.tolkien.pets.service;

import com.tolkien.pets.model.RefreshToken;
import com.tolkien.pets.model.User;
import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
}
