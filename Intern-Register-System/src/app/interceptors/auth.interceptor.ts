import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Skip interceptor for auth endpoints (login, register, etc.)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register') || 
      req.url.includes('/auth/forgot-password') || req.url.includes('/auth/reset-password') ||
      req.url.includes('/auth/send-verification-code') || req.url.includes('/auth/verify-code') ||
      req.url.includes('/auth/check-email')) {
    return next(req);
  }
  
  // Get token and trim any whitespace
  const rawToken = localStorage.getItem('token');
  const token = rawToken ? rawToken.trim() : null;
  
  // Clone request and add Authorization header if token exists
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Debug logging (remove in production)
    console.log('🔐 Sending request with token:', {
      url: req.url,
      hasToken: !!token,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });
  } else {
    console.warn('⚠️ No token found for request:', req.url);
  }
  
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401) {
        const errorMessage = error.error?.error || error.error?.message || JSON.stringify(error.error) || '';
        
        console.error('❌ 401 Unauthorized error:', {
          url: req.url,
          hasToken: !!token,
          tokenLength: token?.length,
          errorMessage: errorMessage,
          fullError: error.error
        });
        
        // Don't clear token on auth endpoints
        if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register') &&
            !req.url.includes('/auth/forgot-password') && !req.url.includes('/auth/reset-password') &&
            !req.url.includes('/auth/send-verification-code') && !req.url.includes('/auth/verify-code')) {
          
          // Check if this is a token-related error or just a general 401
          // Only clear token if error explicitly mentions token issues
          const isTokenError = errorMessage.toLowerCase().includes('token') || 
                              errorMessage.toLowerCase().includes('expired') || 
                              errorMessage.toLowerCase().includes('invalid') ||
                              errorMessage.toLowerCase().includes('jwt') ||
                              errorMessage.toLowerCase().includes('authentication');
          
          // Don't clear token immediately - might be backend configuration issue
          // Only clear if we get multiple 401s or explicit token error
          if (isTokenError && errorMessage.toLowerCase().includes('token')) {
            console.warn('⚠️ Token error detected, but keeping token for now - check backend logs');
            // Don't clear token - let user try again
            // Only clear if user explicitly gets logged out
          } else {
            console.warn('⚠️ 401 error - likely backend authentication issue, keeping token');
            // Don't clear token - might be backend configuration problem
          }
        }
      }
      // Re-throw error to be handled by components
      return throwError(() => error);
    })
  );
};

