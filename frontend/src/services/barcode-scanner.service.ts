import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BarcodeScannerService {
  private scannerActiveSubject = new BehaviorSubject<boolean>(false);
  public scannerActive$ = this.scannerActiveSubject.asObservable();

  private lastScannedCodeSubject = new BehaviorSubject<string | null>(null);
  public lastScannedCode$ = this.lastScannedCodeSubject.asObservable();

  constructor() {}

  activateScanner(): void {
    this.scannerActiveSubject.next(true);
  }

  deactivateScanner(): void {
    this.scannerActiveSubject.next(false);
  }

  isScannerActive(): boolean {
    return this.scannerActiveSubject.value;
  }

  onCodeScanned(code: string): void {
    this.lastScannedCodeSubject.next(code);
  }

  toggleScanner(): void {
    const currentState = this.scannerActiveSubject.value;
    this.scannerActiveSubject.next(!currentState);
  }
}
