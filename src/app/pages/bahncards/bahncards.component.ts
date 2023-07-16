import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-bahncards',
  templateUrl: './bahncards.component.html',
  styleUrls: ['./bahncards.component.scss']
})
export class BahncardsComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    (<any>window).my_bahncards_modal.showModal()
  }
}
