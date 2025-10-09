package com.tolkien.pets.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;
import java.util.Optional;

@Component
public class CookieUtil {

    private final String name;
    private final String path;
    private final boolean secure;
    private final String sameSite;

    public CookieUtil(
            @Value("${auth.refresh.cookie.name:refresh_token}") String name,
            @Value("${auth.refresh.cookie.path:/api/auth}") String path,
            @Value("${auth.refresh.cookie.secure:false}") boolean secure,
            @Value("${auth.refresh.cookie.same-site:None}") String sameSite
    ) {
        this.name = name;
        this.path = path;
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void setRefreshCookie(HttpServletResponse res, String value, long maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path(path)
                .maxAge(maxAgeSeconds)
                .sameSite(sameSite)
                .build();
        res.addHeader("Set-Cookie", cookie.toString());
    }

    public void clearRefreshCookie(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .path(path)
                .maxAge(0)
                .sameSite(sameSite)
                .build();
        res.addHeader("Set-Cookie", cookie.toString());
    }

    public Optional<String> readRefreshCookie(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}
