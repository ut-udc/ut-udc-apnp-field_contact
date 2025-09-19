import {inject, Injectable} from '@angular/core';
import {Db} from './db';

@Injectable({
  providedIn: 'root'
})
export class OffenderService {
  db: Db = inject(Db);

  constructor() {


  }



}
