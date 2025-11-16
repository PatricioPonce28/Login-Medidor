import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, sendPasswordResetEmail, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  currentUser: User | null = null;

  constructor() {
    // Observar cambios en la autenticación
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
    });
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Obtener el rol del usuario desde Firestore
      const userDoc = doc(this.firestore, `Usuarios/${user.uid}`);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const rol = userData['rol'];
        
        // Redirigir según el rol
        if (rol === 'Administrador') {
          this.router.navigate(['/admin']);
        } else if (rol === 'Medidor') {
          this.router.navigate(['/medidor']);
        } else {
          throw new Error('Rol no reconocido');
        }
        
        return { success: true, rol };
      } else {
        throw new Error('Usuario no encontrado en la base de datos');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/home']);
  }

  async getUserRole(): Promise<string | null> {
    if (!this.currentUser) return null;
    
    const userDoc = doc(this.firestore, `Usuarios/${this.currentUser.uid}`);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data()['rol'];
    }
    return null;
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Error al enviar email:', error);
      return { success: false, error: error.message };
    }
  }

    async registrarMedidor(email: string, password: string, displayName: string) {
    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Actualizar el displayName
      await updateProfile(user, {
        displayName: displayName
      });

      const userDoc = doc(this.firestore, `Usuarios/${user.uid}`);
      await setDoc(userDoc, {
        uid: user.uid,
        email: email,
        displayName: displayName,
        rol: 'Medidor',
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, uid: user.uid };
    } catch (error: any) {
      console.error('Error al registrar medidor:', error);
      return { success: false, error: error.message };
    }
  }

  
}