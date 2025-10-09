package com.tolkien.pets.service;

import com.tolkien.pets.model.User;

public interface RefreshTokenService {

    record CreatedToken(String cookieValue, long maxAgeSeconds) {}
    record RotationResult(String cookieValue, long maxAgeSeconds, User user) {}

    CreatedToken create(Long userId, int expirationDays);

    RotationResult rotate(String cookieValue);

    void revoke(String cookieValue);
}
