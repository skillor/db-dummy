import { Injectable } from '@angular/core';
import { Observable, finalize, first, fromEvent, map } from 'rxjs';

@Injectable()
export class FileService {

  constructor() { }

  loadRawFile(accept: string): Observable<File> {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = accept;

    document.body.appendChild(input);

    let obs = fromEvent(input, 'change').pipe(
      first(),
      map(() => {
        if (!input.files || input.files.length == 0 || input.files[0].size > 250000000 || !FileReader) {
          throw Error('something went wrong');
        }
        const file = input.files[0];
        return file;
      }),
      finalize(() => document.body.removeChild(input)),
    );

    input.click();
    return obs;
  }
}
