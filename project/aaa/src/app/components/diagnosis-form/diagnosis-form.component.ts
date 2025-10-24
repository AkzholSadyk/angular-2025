import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diagnosis-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './diagnosis-form.html',
  styleUrls: ['./diagnosis-form.css']
})
export class DiagnosisFormComponent {
  diagnosis = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.diagnosis.trim()) {
      this.router.navigate(['/medicines'], { queryParams: { diagnosis: this.diagnosis } });
    }
  }
}
