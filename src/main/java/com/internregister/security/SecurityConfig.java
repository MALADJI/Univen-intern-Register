package com.internregister.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;
import com.internregister.entity.User;
import com.internregister.service.UserService;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.internregister.config.SecurityHeadersConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    
    @Autowired(required = false)
    private SecurityHeadersConfig securityHeadersConfig;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow preflight requests
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // TEMPORARY: Allow testing without authentication - ALL endpoints
                .requestMatchers("/api/**").permitAll()
                .anyRequest().permitAll() // Allow all requests for testing
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    System.err.println("✗ Authentication entry point triggered: " + authException.getMessage());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    System.err.println("✗ Access denied: " + accessDeniedException.getMessage());
                    System.err.println("  Request URI: " + request.getRequestURI());
                    System.err.println("  User: " + (request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "null"));
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access denied: " + accessDeniedException.getMessage() + "\"}");
                })
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userService), BasicAuthenticationFilter.class);
        
        // Add security headers filter if available
        if (securityHeadersConfig != null) {
            http.addFilterAfter(securityHeadersConfig.securityHeadersFilter(), BasicAuthenticationFilter.class);
        }
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins for development
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, java.io.IOException {
        // Skip JWT validation for OPTIONS (preflight) requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String header = request.getHeader("Authorization");
        System.out.println("=== JWT Filter Debug ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization header present: " + (header != null));
        if (header != null) {
            System.out.println("Header length: " + header.length());
            System.out.println("Header starts with Bearer: " + header.startsWith("Bearer "));
            System.out.println("Header preview: " + (header.length() > 50 ? header.substring(0, 50) + "..." : header));
        }
        
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            try {
                // Trim whitespace and newlines from header
                header = header.trim();
                String token = header.substring(7).trim();
                
                System.out.println("Token extracted, length: " + token.length());
                System.out.println("Validating token...");
                
                boolean isValid = jwtTokenProvider.validateToken(token);
                System.out.println("Token validation result: " + isValid);
                
                if (isValid) {
                    String username = jwtTokenProvider.getUsername(token);
                    String role = jwtTokenProvider.getRole(token);
                    
                    // Try to find user by username first
                    User user = userService.findByUsername(username).orElse(null);
                    
                    // If not found by username, try by email
                    if (user == null) {
                        user = userService.findByEmail(username).orElse(null);
                    }
                    
                    if (user != null) {
                        // Set user role as authority (with and without ROLE_ prefix for compatibility)
                        java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                        authorities.add(new SimpleGrantedAuthority(role));
                        
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user.getUsername(), 
                            user.getPassword(), // Set credentials (can be null for stateless)
                            authorities
                        );
                        auth.setDetails(user);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        
                        // Verify authentication is set
                        if (SecurityContextHolder.getContext().getAuthentication() == null) {
                            System.err.println("✗ WARNING: Authentication not set in SecurityContext!");
                        } else {
                            System.out.println("  Authentication set in SecurityContext: " + SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
                        }
                        
                        System.out.println("✓ JWT Authentication successful:");
                        System.out.println("  Username: " + user.getUsername());
                        System.out.println("  Role: " + role);
                        System.out.println("  Endpoint: " + request.getRequestURI());
                    } else {
                        System.out.println("✗ JWT Token valid but user not found: " + username);
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\":\"User not found\"}");
                        return;
                    }
                } else {
                    System.out.println("✗ JWT Token validation failed");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                    return;
                }
            } catch (Exception e) {
                System.err.println("✗ JWT Authentication error: " + e.getMessage());
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Authentication failed: " + e.getMessage() + "\"}");
                return;
            }
        } else {
            // No Authorization header - check if it's a public endpoint
            String path = request.getRequestURI();
            if (!path.startsWith("/api/auth/") && !path.startsWith("/swagger-ui/") && !path.startsWith("/v3/api-docs/")) {
                System.out.println("✗ No Authorization header for protected endpoint: " + path);
                // Don't block here - let Spring Security handle it with proper error
                // This allows the access denied handler to provide better error messages
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
