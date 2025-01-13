import { Component, inject, signal, computed } from '@angular/core';
import { DynamoDBService } from './dynamoDB.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Data {
  id: string;
  name: string;
  price: string;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  title = 'Product Manager';
  data = signal<Data[]>([]);
  createProductForm!: FormGroup;
  
  constructor( 
    private dbService: DynamoDBService,
    private fb: FormBuilder ) { }
    

  ngOnInit() {
    this.initForm();
   }

   initForm() {
    this.createProductForm = this.fb.group({
      name: [''],
      id: [''],
      price: ['']
    });
   }

  saveNewItem() {
    this.dbService.saveData(
      this.createProductForm.get('id')?.value,
      this.createProductForm.get('price')?.value,
      this.createProductForm.get('name')?.value
    );
  }

  getData() {
    this.dbService.getData()
    .subscribe(data => { 
      console.info(data);
      data = this.data.set(data);
    });
  }

}
