package com.tolkien.pets.service.impl;

import com.tolkien.pets.exception.InvalidRefreshTokenException;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.RefreshToken;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.RefreshTokenRepo;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.security.HashUtil;
import com.tolkien.pets.service.RefreshTokenService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepo repo;
    private final UserRepo userRepo;
    private final int defaultExpirationDays;
    private static final SecureRandom RNG = new SecureRandom();
    private static final Base64.Encoder B64URL = Base64.getUrlEncoder().withoutPadding();

    public RefreshTokenServiceImpl(RefreshTokenRepo repo,
                                   UserRepo userRepo,
                                   @Value("${auth.refresh.expiration-days:7}") int defaultExpirationDays) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.defaultExpirationDays = defaultExpirationDays;
    }

    private String randomSecret() {
        byte[] buf = new byte[32]; // 256-bit
        RNG.nextBytes(buf);
        return B64URL.encodeToString(buf);
    }

    private String buildCookieValue(String tokenId, String secret) {
        return tokenId + "." + secret;
    }

    private record Parsed(String tokenId, String secret) {}

    private Parsed parseCookieValue(String cookie) {
        if (cookie == null || !cookie.contains(".")) {
            throw new InvalidRefreshTokenException("Malformed refresh token");
        }
        String[] parts = cookie.split("\\.", 2);
        if (parts.length != 2) throw new InvalidRefreshTokenException("Malformed refresh token");
        return new Parsed(parts[0], parts[1]);
    }

    @Override
    @Transactional
    public CreatedToken create(Long userId, int expirationDays) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String tokenId = UUID.randomUUID().toString();
        String secret = randomSecret();
        String secretHash = HashUtil.sha256Hex(secret);

        RefreshToken rt = new RefreshToken();
        rt.setTokenId(tokenId);
        rt.setSecretHash(secretHash);
        rt.setUser(user);
        rt.setCreatedAt(Instant.now());
        rt.setExpiresAt(Instant.now().plus(expirationDays > 0 ? expirationDays : defaultExpirationDays, ChronoUnit.DAYS));
        rt.setRevoked(false);

        repo.save(rt);

        long maxAgeSeconds = ChronoUnit.SECONDS.between(Instant.now(), rt.getExpiresAt());
        return new CreatedToken(buildCookieValue(tokenId, secret), maxAgeSeconds);
    }

    @Override
    @Transactional
    public RotationResult rotate(String cookieValue) {
        Parsed parsed = parseCookieValue(cookieValue);
        RefreshToken current = repo.findByTokenId(parsed.tokenId())
                .orElseThrow(() -> new InvalidRefreshTokenException("Unknown refresh token"));

        if (current.isRevoked()) throw new InvalidRefreshTokenException("Refresh token revoked");
        if (Instant.now().isAfter(current.getExpiresAt())) throw new InvalidRefreshTokenException("Refresh token expired");

        String presentedHash = HashUtil.sha256Hex(parsed.secret());
        if (!presentedHash.equals(current.getSecretHash())) {
            throw new InvalidRefreshTokenException("Invalid refresh token secret");
        }

        // Revoke old
        current.setRevoked(true);
        repo.save(current);

        // Issue new
        CreatedToken created = create(current.getUser().getId(), 0);
        User user = current.getUser();
        return new RotationResult(created.cookieValue(), created.maxAgeSeconds(), user);
    }

    @Override
    @Transactional
    public void revoke(String cookieValue) {
        Parsed parsed = parseCookieValue(cookieValue);
        RefreshToken current = repo.findByTokenId(parsed.tokenId())
                .orElseThrow(() -> new InvalidRefreshTokenException("Unknown refresh token"));
        current.setRevoked(true);
        repo.save(current);
    }
}
