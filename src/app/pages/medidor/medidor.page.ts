import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-medidor',
  templateUrl: './medidor.page.html',
  styleUrls: ['./medidor.page.scss'],
  standalone: false
})
export class MedidorPage implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  logout() {
    this.authService.logout();
  }
}