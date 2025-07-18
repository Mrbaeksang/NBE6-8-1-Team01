package com.back.teamcoffee.global.security;

import com.back.teamcoffee.domain.user.dto.AuthTokensDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;

public class
CookieUtil {
    private static final String ACCESS = "AccessToken";
    private static final String REFRESH = "RefreshToken";
    private static Cookie buildCookie(String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setMaxAge(maxAge);
        return cookie;
    }


    public static void addTokenCookies(AuthTokensDto token, HttpServletResponse res) {
        res.addCookie(buildCookie(ACCESS, token.accessToken(), 60 * 60 * 24 * 7)); // 7 days
        res.addCookie(buildCookie(REFRESH, token.refreshToken(), 60 * 60 * 24 * 30)); // 30 days
    }

    public static String resolveToken(HttpServletRequest req,String name) {
        if(req.getCookies() == null) {
            return null;
        }
        return Arrays.stream(req.getCookies())
                .filter(c -> name.equals((c.getName())))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    public static void deleteTokenCookies(HttpServletResponse response) {
        Cookie accessCookie = buildCookie(ACCESS, "", 0);
        Cookie refreshCookie = buildCookie(REFRESH, "", 0);
        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }
}
