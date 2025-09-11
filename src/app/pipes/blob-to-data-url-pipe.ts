import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'blobToDataURL',
  standalone: true,
})
export class BlobToDataUrlPipe implements PipeTransform {

  transform(value: Blob | null): string {
    if (!value) {
      return '';
    }
    debugger;
    return URL.createObjectURL(value);
  }

}
