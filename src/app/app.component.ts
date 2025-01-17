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

  title = 'Amplify, Angular, Api Gateway, DynamoDB, Lambda';
  data = signal<Data[]>([]);
  createProductForm!: FormGroup;
  deleteProductForm!: FormGroup;
  authenticated: boolean = false;
  
  constructor( 
    private dbService: DynamoDBService,
    private fb: FormBuilder,
    private router: Router ) {

      Hub.listen('auth', (data) => {
        switch (data.payload.event) {
          case 'signedIn':
            this.authenticated = true;
            break;
          case 'signedOut':
            console.log('user have been signedOut successfully.');
            this.authenticated = false;
            break;
          case 'tokenRefresh':
            console.log('auth tokens have been refreshed.');
            break;
          case 'tokenRefresh_failure':
            console.log('failure while refreshing auth tokens.');
            break;
          case 'signInWithRedirect':
            console.log('signInWithRedirect API has successfully been resolved.');
            break;
          case 'signInWithRedirect_failure':
            console.log('failure while trying to resolve signInWithRedirect API.');
            break;
          case 'customOAuthState':
            console.log('custom state returned from CognitoHosted UI');
            break;
        }});
     }

  ngOnInit() {
    this.getData();
    this.initEditForm();
    this.initDeleteForm();
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
