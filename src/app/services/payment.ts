import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { PaymentInitialize, PaymentInitializeResponse, PaymentVerifyResponse } from '../interfaces/payment';
import { Observable } from 'rxjs';

@Service()
export class Payment {
  http = inject(HttpClient);

  initialize(data: PaymentInitialize): Observable<PaymentInitializeResponse> {
    return this.http.post<PaymentInitializeResponse>(`${environment.baseUrl}/api/Payments/Initialize`, data)
  }

  verify(reference: string): Observable<PaymentVerifyResponse> {
    return this.http.get<PaymentVerifyResponse>(`${environment.baseUrl}/api/Payments/Verify/${encodeURIComponent(reference)}`)
  }


}
