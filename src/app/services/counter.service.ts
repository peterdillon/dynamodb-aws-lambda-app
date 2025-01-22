import { Injectable, signal  } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
  export class CounterService {
    // Private writable signal
    private counterSignal = signal(0);
  
    // Public read-only signal
    readonly counter = this.counterSignal.asReadonly();
  
    constructor() {}
  
    // Method to increment the counter
    increment() {
      this.counterSignal.update((val) => val + 1);
    }
  }