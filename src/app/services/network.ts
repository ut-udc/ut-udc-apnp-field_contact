// network service
import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  onlineStatus$: Observable<boolean> = this.onlineStatusSubject.asObservable();

  constructor() {
    fromEvent(window, 'online').subscribe(() => this.updateOnlineStatus(true));
    fromEvent(window, 'offline').subscribe(() =>
      this.updateOnlineStatus(false)
    );
  }

  private updateOnlineStatus(isOnline: boolean): void {
    this.onlineStatusSubject.next(isOnline);
  }
}
