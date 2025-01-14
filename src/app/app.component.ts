import { Component, inject, signal, computed } from '@angular/core';
import { DynamoDBService } from './dynamoDB.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {MatCardModule} from '@angular/material/card';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';

export interface Data {
  id: string;
  name: string;
  price: string;
};

@Component({
  selector: 'app-root',
  imports: [MatDividerModule,MatMenuModule,MatGridListModule, MatToolbarModule, MatButtonModule,MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, ReactiveFormsModule, MatCardModule, MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  title = 'AWS, Lambda, Api Gateway, DynamoDB, Angular';
  data = signal<Data[]>([]);
  createProductForm!: FormGroup;
  deleteProductForm!: FormGroup;
  
  constructor( 
    private dbService: DynamoDBService,
    private fb: FormBuilder ) { }
    

  ngOnInit() {
    this.initForm();
    this.initDeleteForm();
    this.getData();
   }

   initForm() {
    this.createProductForm = this.fb.group({
      name: [''],
      id: [''],
      price: ['']
    });
   }

  saveItem() {
    this.dbService.saveData(
      this.createProductForm.get('id')?.value,
      this.createProductForm.get('price')?.value,
      this.createProductForm.get('name')?.value
    );
  }

  initDeleteForm() {
    this.deleteProductForm = this.fb.group({
      id: ['']
    });
   }

   deleteItem() {
    this.dbService.deleteData(
      this.deleteProductForm.get('id')?.value
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
