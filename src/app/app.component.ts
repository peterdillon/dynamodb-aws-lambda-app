import { Component, inject, signal, computed } from '@angular/core';
import { DynamoDBService } from './dynamoDB.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';

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

import { Hub } from 'aws-amplify/utils';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Amplify } from "aws-amplify";
import outputs from '../../amplify_outputs.json';
import { Subscription } from 'rxjs';
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

  title = 'Amplify, Angular, Api Gateway, Cognito, DynamoDB, Lambda';
  data = signal<Data[]>([]);
  createProductForm!: FormGroup;
  deleteProductForm!: FormGroup;
  authenticated: boolean = false;
  subscription: Subscription;
  
  constructor( 
    private dbService: DynamoDBService,
    private fb: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService ) {

      this.subscription = router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (!router.navigated) {
            const auth = this.retrieveFromLocalStorage();
            if(auth === 'signedIn') {
              this.authenticated = true;
              this.getData();
            } else {
              this.authenticated = false;
            }
          }
        }
      });


      Hub.listen('auth', (data) => {
        console.log(data.payload.event);
        if (data.payload.event === 'signedIn') {
          this.authenticated = true;
        } else if(data.payload.event === 'signedOut') {
          this.authenticated = false;
        }
        switch (data.payload.event) {
          case 'signedIn':
            console.log('user has been signedIn');
            this.saveToLocalStorage(data.payload.event);
            this.getData();
            break;
          case 'signedOut':
            this.saveToLocalStorage(data.payload.event);
            console.log('user have been signedOut');
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
      this.initEditForm();
      this.initDeleteForm();
     }

    saveToLocalStorage(status: string) {
      this.localStorageService.saveData('auth', status);
      if(status === 'signedIn') {
        this.authenticated = true;
      }
    }
  
    retrieveFromLocalStorage() {
      const status = this.localStorageService.getData('auth');
      if(status === 'signedOut' || null) {
        this.authenticated = false;
      }
      return status;
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
