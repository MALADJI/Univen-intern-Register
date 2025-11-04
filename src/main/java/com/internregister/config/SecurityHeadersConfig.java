package com.internregister.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;

/**
 * Security headers configuration
 * Adds security headers to all HTTP responses
 */
@Configuration
public class SecurityHeadersConfig {
    
    @Bean
    public OncePerRequestFilter securityHeadersFilter() {
        return new SecurityHeadersFilter();
    }
    
    private static class SecurityHeadersFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                      @NonNull HttpServletResponse response, 
                                      @NonNull FilterChain filterChain) 
                throws ServletException, IOException {
            
            // Create a wrapper to clean Authorization header
            HttpServletRequest wrappedRequest = new HeaderSanitizingRequestWrapper(request);
            
            // Prevent XSS attacks
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("X-Frame-Options", "DENY");
            response.setHeader("X-XSS-Protection", "1; mode=block");
            
            // Prevent clickjacking - Allow cross-origin for development
            // For production, consider: default-src 'self'; connect-src 'self' http://localhost:*
            response.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:*; connect-src 'self' http://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");
            
            // Prevent MIME type sniffing
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            
            // Referrer policy
            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Ensure CORS headers are not blocked
            String origin = request.getHeader("Origin");
            if (origin != null && (origin.startsWith("http://localhost:") || origin.startsWith("https://localhost:"))) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Credentials", "true");
            }
            
            filterChain.doFilter(wrappedRequest, response);
        }
    }
    
    /**
     * Request wrapper that sanitizes Authorization header by removing newlines and extra whitespace
     */
    private static class HeaderSanitizingRequestWrapper extends HttpServletRequestWrapper {
        public HeaderSanitizingRequestWrapper(HttpServletRequest request) {
            super(request);
        }
        
        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            if (value != null && "Authorization".equalsIgnoreCase(name)) {
                // Remove newlines, carriage returns, and trim whitespace
                value = value.replaceAll("[\\r\\n]", "").trim();
            }
            return value;
        }
        
        @Override
        public Enumeration<String> getHeaders(String name) {
            Enumeration<String> headers = super.getHeaders(name);
            if ("Authorization".equalsIgnoreCase(name)) {
                java.util.List<String> sanitized = Collections.list(headers);
                sanitized.replaceAll(h -> h.replaceAll("[\\r\\n]", "").trim());
                return Collections.enumeration(sanitized);
            }
            return headers;
        }
    }
}

