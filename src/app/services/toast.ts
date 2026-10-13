import { inject, Injectable } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';

@Injectable({
  providedIn: 'root',
})

export class ToastService {
  private messageService = inject(MessageService);

  showWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: message });
  }

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}
