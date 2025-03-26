import { Component, signal, ElementRef, Renderer2, computed, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { DynamoDBService, Data } from './services/dynamoDB.service';
import { LocalStorageService } from './local-storage.service';
import { Developers, Tasks  } from './interfaces';

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
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TextFieldModule } from '@angular/cdk/text-field';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Hub } from 'aws-amplify/utils';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { Amplify } from "aws-amplify";
import outputs from '../../amplify_outputs.json';
Amplify.configure(outputs);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatBadgeModule, MatCheckboxModule, MatSelectModule, TextFieldModule, AmplifyAuthenticatorModule, MatDividerModule, MatMenuModule, MatGridListModule, MatToolbarModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, CommonModule, ReactiveFormsModule, MatCardModule, MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  title = 'Amplify, Angular, Api Gateway, Cognito, DynamoDB, Lambda';
  @ViewChild('inputName') inputName!: ElementRef;
  chart3: Chart | undefined;
  private sortConfig = signal<Sort | null>(null);
  editedItemId = signal<string | null>(null);
  data = signal<Data[]>([]);
  chartInitialized = false;
  createProductForm!: FormGroup;
  deleteProductForm!: FormGroup;
  authenticated: boolean = false;
  subscription: Subscription;
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
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private localStorageService: LocalStorageService) {

      Chart.register(...registerables);
      
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
        if (data.payload.event === 'signedIn' || data.payload.event === 'tokenRefresh') {
          this.authenticated = true;
        } else if(data.payload.event === 'signedOut') {
          this.authenticated = false;
        } else {
          this.authenticated = false;
        }
        switch (data.payload.event) {
          case 'signedIn':
            console.log('user has been signedIn');
            this.saveToLocalStorage(data.payload.event);
            this.getData();
            setTimeout(() => {
              this.initChart();
            }, 0);
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
    this.sortData({ active: 'createdAt', direction: 'asc' } as Sort);
  }
 
  ngAfterViewInit() {
    setTimeout(() => {
      this.initChart();
    }, 0);
  }

  public sortedData = computed(() => {
    const data = this.data();
    const sortConfig = this.sortConfig();
    if (!data.length || !sortConfig || !sortConfig.active || !sortConfig.direction) {
      return data;
    }
    const direction = sortConfig.direction === 'desc' ? 1 : -1;
    return data.slice().sort((a, b) => {
      const valueA = new Date(a[sortConfig.active as keyof Data]).getTime();
      const valueB = new Date(b[sortConfig.active as keyof Data]).getTime();
      return direction * (valueA - valueB);
    });
  });

  sortData(sort: Sort) {
    this.sortConfig.set(sort);
  }

  ngAfterViewChecked() {
    if (this.authenticated && !this.chartInitialized) {
      this.initChart();
      this.chartInitialized = true;
    }
  }

  initChart() {
    if (this.chart3) {
      console.log('Destroying existing chart');
      this.chart3.destroy();
    }
    this.chart3 = new Chart('canvasLine', {
      type: 'bar',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sep"],
        datasets: [{ 
            data: [8,4,1,1,2,8.8,5,7,1,6,9,3],
            label: "Subtasks",
            borderColor: "rgb(0, 221, 221, .7)",
            backgroundColor: "rgb(0, 221, 221, .7)",
            // fill: false,
          }, { 
            data: [5,9,2,1,9,4,6,8.8,5,7,2,4],
            label: "Stories",
            borderColor: "cornflowerblue",
            backgroundColor: "rgb(100, 149, 237, .6)",
            // fill: false,
          }, { 
            data: [1,8,5,7,2,9,4,7,5,9,1,8],
            label: "Epic",
            borderColor: "orange",
            backgroundColor: "rgba(255, 165, 0, .6)",
            // fill: false,
          }, { 
            data: [3,7,8,7,5,9,1,8,7,5,9,1],
            label: "Bug",
            borderColor: "pink",
            backgroundColor: "rgb(255, 105, 180, .6)",
            // fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
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
    this.inputName.nativeElement.focus();
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
    });
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
    const itemId = this.createProductForm.get('id')?.value;
    this.dbService.addEditItem(this.createProductForm.value)
      .subscribe(() => {
        this.getData();
        this.editedItemId.set(itemId);
      });
      this.initEditForm();
      setTimeout(() => {
        this.editedItemId.set(null);
      }, 2500); 
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
      });
  }
}
