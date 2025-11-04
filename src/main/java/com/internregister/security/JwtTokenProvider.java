package com.internregister.security;

import com.internregister.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    // Use a fixed secret key for development (in production, use environment variable)
    // This ensures tokens remain valid across server restarts
    private static final String SECRET = "MySecretKeyForJWTTokenGeneration123456789012345678901234567890";
    private final Key secretKey = Keys.hmacShaKeyFor(SECRET.getBytes());
    private final long validityInMs = 86400000; // 1 day

    public String createToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getUsername());
        claims.put("role", user.getRole().name());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                System.out.println("✗ Token validation failed: Token is null or empty");
                return false;
            }
            
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token.trim())
                    .getBody();
            
            // Check if token is expired
            Date expiration = claims.getExpiration();
            if (expiration.before(new Date())) {
                System.out.println("✗ Token validation failed: Token expired on " + expiration);
                return false;
            }
            
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            System.out.println("✗ Token validation failed: Token expired - " + ex.getMessage());
            return false;
        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            System.out.println("✗ Token validation failed: Malformed token - " + ex.getMessage());
            return false;
        } catch (io.jsonwebtoken.UnsupportedJwtException ex) {
            System.out.println("✗ Token validation failed: Unsupported token - " + ex.getMessage());
            return false;
        } catch (io.jsonwebtoken.security.SignatureException ex) {
            System.out.println("✗ Token validation failed: Invalid signature - " + ex.getMessage());
            System.out.println("  This usually means the token was signed with a different secret key");
            return false;
        } catch (Exception ex) {
            System.out.println("✗ Token validation failed: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
            ex.printStackTrace();
            return false;
        }
    }

    public String getUsername(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token.trim())
                    .getBody()
                    .getSubject();
        } catch (Exception ex) {
            System.out.println("✗ Error getting username from token: " + ex.getMessage());
            throw new RuntimeException("Invalid token", ex);
        }
    }

    public String getRole(String token) {
        try {
            return (String) Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token.trim())
                    .getBody()
                    .get("role");
        } catch (Exception ex) {
            System.out.println("✗ Error getting role from token: " + ex.getMessage());
            throw new RuntimeException("Invalid token", ex);
        }
    }
}
