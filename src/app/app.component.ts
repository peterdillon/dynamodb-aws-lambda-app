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
import { Router } from '@angular/router';

import { Hub } from '@aws-amplify/core';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Amplify } from "aws-amplify";
import outputs from '../../amplify_outputs.json';
Amplify.configure(outputs);

export interface Data {
  id: string;
  name: string;
  price: string;
};

@Component({
  selector: 'app-root',
  imports: [AmplifyAuthenticatorModule, MatDividerModule,MatMenuModule,MatGridListModule, MatToolbarModule, MatButtonModule,MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, ReactiveFormsModule, MatCardModule, MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  title = 'Amplify, Lambda, Api Gateway, DynamoDB, Angular';
  data = signal<Data[]>([]);
  createProductForm!: FormGroup;
  deleteProductForm!: FormGroup;
  authenticated : boolean = false;
  
  constructor( 
    private dbService: DynamoDBService,
    private fb: FormBuilder,
    private router: Router ) {

      Hub.listen('auth', (data) => {
        switch (data.payload.event) {
          case 'signedIn':
          data.payload.event === "signedIn"
            ?  this.authenticated = true
            : this.authenticated = false;
            break;
        }});
     }

    

  ngOnInit() {
    this.initEditForm();
    this.initDeleteForm();
    this.getData();
   }

   signOut() {
    console.log(this.authenticated);
    this.authenticated = false;
   }

   initEditForm() {
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
