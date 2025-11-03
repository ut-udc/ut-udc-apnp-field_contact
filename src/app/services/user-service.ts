import {inject, Injectable, Signal} from '@angular/core';
import {Db} from './db';
import {User} from '../models/user';
import {toSignal} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';
import {liveQuery} from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  db:Db = inject(Db);

  user: Signal <User | undefined>  = toSignal(from(
    liveQuery( ()=> this.db.users
      .where('loggedInUser')
      .equals(1)
      .first()))
  );

  appVersion() {
    return 6;
  }
}
