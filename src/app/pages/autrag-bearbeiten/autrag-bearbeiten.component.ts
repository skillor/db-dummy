import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-autrag-bearbeiten',
  templateUrl: './autrag-bearbeiten.component.html',
  styleUrls: ['./autrag-bearbeiten.component.scss']
})
export class AutragBearbeitenComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    (<any>window).my_auftrag_bearbeiten_modal.showModal()
  }
}
