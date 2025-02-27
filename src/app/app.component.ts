import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { DynamoDBService, Data } from './services/dynamoDB.service';
import { CounterService } from './services/counter.service';
import { LocalStorageService } from './local-storage.service';

import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TextFieldModule } from '@angular/cdk/text-field';
import { inject, Injector, ViewChild } from '@angular/core';

import { Hub } from 'aws-amplify/utils';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Amplify } from "aws-amplify";
import outputs from '../../amplify_outputs.json';
Amplify.configure(outputs);

interface Developers {
  value: string;
  name: string;
  title: string;
}

interface Tasks {
  value: string;
  type: string;
}

@Component({
  selector: 'app-root',
  imports: [MatBadgeModule, MatCheckboxModule, MatSelectModule, TextFieldModule, AmplifyAuthenticatorModule, MatDividerModule, MatMenuModule, MatGridListModule, MatToolbarModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, ReactiveFormsModule, MatCardModule, MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  private _injector = inject(Injector);
  title = 'Amplify, Angular, Api Gateway, Cognito, DynamoDB, Lambda';
  createProductForm!: FormGroup;
  deleteProductForm!: FormGroup;
  authenticated: boolean = false;
  subscription: Subscription;
  data = signal<Data[]>([]);
  developers: Developers[] = [
    {value: 'Danny', name: 'Danny', title: 'UI Designer'},
    {value: 'Tara', name: 'Tara', title: 'Backend'},
    {value: 'Peter', name: 'Peter', title: 'Full Stack'},
    {value: 'Patrick', name: 'Patrick', title: 'AI Implementation'},
  ];
  tasks: Tasks[] = [
    {value: 'Epic', type: 'Epic'},
    {value: 'Story', type: 'Story'},
    {value: 'Bug', type: 'Bug'},
    {value: 'Subtask', type: 'Subtask'}
  ];

  
  constructor( 
    private dbService: DynamoDBService,
    private fb: FormBuilder,
    private router: Router,
    public counterService: CounterService,
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
    this.getData();
    this.onChanges();
  }

  editItem(id:string, name:string, project:string, description:string, type:string, assigned:string) {
    this.createProductForm.get('id')?.enable();
    this.createProductForm.patchValue({
      id: id,
      name: name,
      project: project,
      description: description,
      type: type,
      assigned: assigned,
      edit:true
    });
  }

  initEditForm() {
    this.createProductForm = this.fb.group({
      name: [''],
      project: ['Bazinga!'],
      description: [''],
      type: [],
      assigned: [],
      id: ['', { disabled: true }],
      edit: []
    });
    this.createProductForm.get('id')?.disable();
  }

  onChanges(): void {
    this.createProductForm.get('edit')?.valueChanges.subscribe(res => {
      res ? this.createProductForm.get('id')?.enable() : this.createProductForm.get('id')?.disable();
    })
  };

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

  compareFn(option1: any, option2: any): boolean {
    return option1 && option2 ? option1.value === option2.value : option1 === option2;
  }


  addEditItem() {
    this.dbService.addEditItem(this.createProductForm.value)
      .subscribe(() => this.getData());
      this.initEditForm();
  }

  deleteItem(id: string) {
    this.dbService.deleteItem(id)
      .subscribe(() => this.getData());
      this.initEditForm();
  }

  getData() {
    this.dbService.getData()
      .subscribe(data => { 
        this.data.set(data);
        console.log(data);
      });  
      
  }

}
