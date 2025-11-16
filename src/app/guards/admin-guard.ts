import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const AdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser;
  
  if (!user) {
    router.navigate(['/home']);
    return false;
  }

  const rol = await authService.getUserRole();
  
  if (rol === 'Administrador') {
    return true;
  } else {
    router.navigate(['/home']);
    return false;
  }
};