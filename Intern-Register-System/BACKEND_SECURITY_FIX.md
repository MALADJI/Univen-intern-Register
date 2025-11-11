# Backend Security Configuration Fix Guide

## Problem
The frontend is receiving **403 Forbidden** errors when trying to access API endpoints like:
- `/api/departments`
- `/api/interns`
- `/api/leave`
- `/api/attendance`
- `/api/supervisors`
- `/api/settings/profile`

## Root Cause
The backend security configuration is blocking requests even when a valid JWT token is provided. This is likely due to:
1. Role-based access control (RBAC) restrictions
2. Missing endpoint permissions in security configuration
3. Incorrect role mappings

## Solution

### 1. Update SecurityConfig.java

Make sure your `SecurityConfig.java` allows authenticated users to access these endpoints:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                
                // Admin endpoints
                .requestMatchers("/api/departments/**").hasAnyRole("ADMIN")
                .requestMatchers("/api/admins/**").hasAnyRole("ADMIN")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "SUPERVISOR")
                
                // Supervisor endpoints
                .requestMatchers("/api/supervisors/**").hasAnyRole("ADMIN", "SUPERVISOR")
                
                // Intern endpoints - allow INTERN, SUPERVISOR (to view their interns), and ADMIN
                .requestMatchers("/api/interns/**").hasAnyRole("ADMIN", "SUPERVISOR", "INTERN")
                
                // Leave endpoints - allow all authenticated users
                .requestMatchers("/api/leave/**").hasAnyRole("ADMIN", "SUPERVISOR", "INTERN")
                
                // Attendance endpoints - allow all authenticated users
                .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "SUPERVISOR", "INTERN")
                
                // Settings endpoints - allow all authenticated users
                .requestMatchers("/api/settings/**").hasAnyRole("ADMIN", "SUPERVISOR", "INTERN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    // CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Content-Disposition", "Content-Length"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Check JWT Token Claims

Ensure your JWT token includes the `ROLE_` prefix or matches your security configuration:

```java
// In JwtTokenProvider or similar
String role = user.getRole().name(); // e.g., "ADMIN", "SUPERVISOR", "INTERN"
Collection<SimpleGrantedAuthority> authorities = Collections.singletonList(
    new SimpleGrantedAuthority("ROLE_" + role)
);
```

### 3. Verify Role Names Match

Make sure the roles in your database match the roles in security configuration:
- `ADMIN` (not `Admin` or `admin`)
- `SUPERVISOR` (not `Supervisor` or `supervisor`)
- `INTERN` (not `Intern` or `intern`)

### 4. Test Token

You can test if the token is being sent correctly by checking the backend logs or using a tool like Postman:

1. Login and get the token
2. Make a request to `/api/interns` with header: `Authorization: Bearer <token>`
3. Check if the request is authorized

### 5. Reset Password Endpoint

If you're getting a 404 error on `/api/auth/reset-password`, make sure this endpoint exists in your `AuthController.java`:

```java
@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    // Verify code first
    if (!emailVerificationService.verifyCode(request.getEmail(), request.getCode(), "password-reset")) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Invalid or expired verification code"));
    }
    
    // Reset password
    userService.resetPassword(request.getEmail(), request.getNewPassword());
    
    return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
}
```

## Testing

After making these changes:

1. **Restart the backend server**
2. **Clear browser localStorage** (remove old tokens)
3. **Login again** with valid credentials
4. **Check browser console** - 403 errors should be gone
5. **Verify data loads** in dashboards

## Additional Notes

- If 403 errors persist, check backend logs for specific authorization failures
- Verify that the user's role in the database matches the role in the JWT token
- Ensure CORS is properly configured to allow requests from `http://localhost:4200`

