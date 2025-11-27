import { Injectable } from '@angular/core';
import { Medicine } from '../models/medicine.model';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private medicines: Medicine[] = [
    { id: 1, name: 'Paracetamol', description: 'Pain relief, fever reducer', dosage: '500mg twice a day' },
    { id: 2, name: 'Ibuprofen', description: 'Anti-inflammatory, reduces pain', dosage: '200mg three times a day' },
    { id: 3, name: 'Amoxicillin', description: 'Antibiotic for infections', dosage: '250mg three times a day' },
  ];

  getMedicinesByDiagnosis(diagnosis: string): Medicine[] {
    const query = diagnosis.toLowerCase().trim();

    
    if (!query) return this.medicines;

    
    return this.medicines.filter(med => 
      med.description
        .toLowerCase()
        .split(/[\s,]+/) 
        .some(word => query.includes(word) || word.includes(query)) 
    );
  }
}
