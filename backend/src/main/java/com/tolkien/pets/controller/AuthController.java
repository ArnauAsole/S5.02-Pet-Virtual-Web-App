package com.tolkien.pets.controller;

import com.tolkien.pets.dto.auth.LoginDto;
import com.tolkien.pets.dto.auth.RegisterDto;
import com.tolkien.pets.dto.auth.TokenDto;
import com.tolkien.pets.exception.InvalidRefreshTokenException;
import com.tolkien.pets.security.CookieUtil;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.AuthService;
import com.tolkien.pets.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshService;
    private final CookieUtil cookieUtil;
    private final int refreshExpirationDays;

    public AuthController(AuthService authService,
                          RefreshTokenService refreshService,
                          CookieUtil cookieUtil,
                          @Value("${auth.refresh.expiration-days:7}") int refreshExpirationDays) {
        this.authService = authService;
        this.refreshService = refreshService;
        this.cookieUtil = cookieUtil;
        this.refreshExpirationDays = refreshExpirationDays;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenDto> register(@Valid @RequestBody RegisterDto registerDto,
                                             HttpServletResponse res) {
        TokenDto token = authService.register(registerDto);
        var rt = refreshService.create(token.id(), refreshExpirationDays);
        cookieUtil.setRefreshCookie(res, rt.cookieValue(), rt.maxAgeSeconds());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@Valid @RequestBody LoginDto loginDto,
                                          HttpServletResponse res) {
        TokenDto token = authService.login(loginDto);
        var rt = refreshService.create(token.id(), refreshExpirationDays);
        cookieUtil.setRefreshCookie(res, rt.cookieValue(), rt.maxAgeSeconds());
        return ResponseEntity.ok(token);
    }

    // No requiere Authorization. Usa la cookie HTTPOnly.
    @PostMapping("/refresh")
    public ResponseEntity<TokenDto> refresh(HttpServletRequest req, HttpServletResponse res) {
        String cookie = cookieUtil.readRefreshCookie(req)
                .orElseThrow(() -> new InvalidRefreshTokenException("Missing refresh token"));
        var rotated = refreshService.rotate(cookie);
        cookieUtil.setRefreshCookie(res, rotated.cookieValue(), rotated.maxAgeSeconds());
        return ResponseEntity.ok(authService.refresh(rotated.user().getId()));
    }


    // Limpia cookie y revoca el refresh token actual
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest req, HttpServletResponse res) {
        cookieUtil.readRefreshCookie(req).ifPresent(refreshService::revoke);
        cookieUtil.clearRefreshCookie(res);
        return ResponseEntity.noContent().build();
    }

    // Requiere Authorization (access token)
    @GetMapping("/me")
    public ResponseEntity<TokenDto> me(Authentication authentication) {
        CustomPrincipal p = (CustomPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(authService.refresh(p.id()));
    }
}
