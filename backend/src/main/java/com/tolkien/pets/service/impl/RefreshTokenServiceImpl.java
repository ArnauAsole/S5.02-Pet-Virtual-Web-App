package com.tolkien.pets.service.impl;

import com.tolkien.pets.model.RefreshToken;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.RefreshTokenRepo;
import com.tolkien.pets.service.RefreshTokenService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepo refreshTokenRepo;

    public RefreshTokenServiceImpl(RefreshTokenRepo refreshTokenRepo) {
        this.refreshTokenRepo = refreshTokenRepo;
    }

    @Override
    public RefreshToken createRefreshToken(User user) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(Instant.now().plusSeconds(7 * 24 * 60 * 60));
        return refreshTokenRepo.save(token);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepo.findByToken(token);
    }

    @Override
    public void deleteByUser(User user) {
        refreshTokenRepo.deleteByUser(user);
    }
}
