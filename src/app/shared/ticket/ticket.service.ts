import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketI, TrainSection } from './ticket';
import { AuthService } from '../auth/auth.service';
import bwipjs from 'bwip-js';
import { getShortLocation } from './short-locations';
import dateFormat from 'dateformat';


@Injectable()
export class TicketService {
  private selectedTicket?: string;
  tickets: { [key: string]: Ticket } = {};

  person = {
    anrede: 'Herr',
    name: '',
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.loadTickets();
    this.loadPerson();

  }

  loadPerson() {
    const t = localStorage.getItem('person');
    if (!t) return;
    try {
      this.person = JSON.parse(t);
    } catch { }
  }

  savePerson() {
    localStorage.setItem('person', JSON.stringify(this.person));
  }

  selectTicket(tkey: string): void {
    this.selectedTicket = tkey;
  }

  deleteTicket(tkey: string): void {
    delete this.tickets[tkey];
    this.saveTickets();
  }

  getSelectedTicket(): Ticket {
    if (this.selectedTicket === undefined) this.selectedTicket = Object.keys(this.tickets)[0];
    return this.tickets[this.selectedTicket];
  }

  saveTickets(): void {
    localStorage.setItem('tickets', JSON.stringify(Object.entries(this.tickets).map(([k, v]) => [k, v.data])));
  }

  loadTickets(): void {
    try {
      const t = localStorage.getItem('tickets');
      if (!t) return;
      this.tickets = Object.fromEntries(JSON.parse(t).map(([k, v]: [string, TicketI]) => [k, new Ticket(v)]));
    } catch {
    }
  }

  encodeXML(unsafe: string) {
    return unsafe.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  addTicket(ticket: Ticket): void {
    this.tickets[ticket.getKey()] = ticket;
  }

  addTicketByXml(buchungsZeitpunkt: string, ticket: Element, schedule: Element) {
    const tkey = ticket.querySelector(`mtk tkey`)?.textContent;
    if (!tkey) throw Error('could not find ticket key');
    const barcode = ticket.querySelector(`htdata ht[name='barcode']`)?.textContent!;
    const httext = ticket.querySelector(`htdata ht[name='httext']`)?.textContent!;
    const sichtmerkmal = ticket.querySelector(`htdata ht[name='sichtmerkmal']`)?.textContent!;

    const journey: TrainSection[] = [];

    let trainlist = schedule.getElementsByTagName("trainlist");
    if (trainlist.length != 1) {
      throw new Error('something went wrong');
    }
    trainlist = trainlist[0].children;
    for (let i = 0; i < trainlist.length; i++) {
      const train = trainlist[i];
      journey.push({
        type: 'train',
        verkehrsmittel: { name: train.getAttribute('tn')! },
        abfahrtsOrt: train.querySelector(`dep n`)?.textContent!,
        abfahrtsZeitpunkt: train.querySelector(`dep`)?.getAttribute('dt')?.split('T')[0] + 'T' + train.querySelector(`dep`)?.getAttribute('t'),
        abfahrtsGleis: train.querySelector(`dep ptf`)?.textContent!,
        ankunftsOrt: train.querySelector(`arr n`)?.textContent!,
        ankunftsZeitpunkt: train.querySelector(`arr`)?.getAttribute('dt')?.split('T')[0] + 'T' + train.querySelector(`arr`)?.getAttribute('t'),
        ankunftsGleis: train.querySelector(`arr ptf`)?.textContent!,
      });
    }

    this.addTicket(new Ticket({
      tkey, barcode, httext, sichtmerkmal, journey, buchungsZeitpunkt, barcode2: this.generateAztecCode()
    }));
    this.saveTickets();
  }

  async loadTicketFromDb(ticketNumber: string, lastName: string): Promise<void> {
    const xml = await firstValueFrom(this.http.post(
      `https://skillproxy.i9.ar/mobile/dbc/xs.go`,
      `<?xml version="1.0"?><rqorderdetails version="1.0"><rqheader l="de" v="22060000" d="iPhone13,1" os="iOS_15.5" app="NAVIGATOR"/><rqorder on="${this.encodeXML(ticketNumber)}"/><authname tln="${this.encodeXML(lastName)}"/></rqorderdetails>`,
      {
        responseType: 'text',
        headers: {
          'X-PROXY-HOST': 'fahrkarten.bahn.de',
          'X-PROXY-PREVENT-OPTIONS': '',
          'X-PROXY-AUTHORIZATION': `Bearer ${this.authService.getAuthToken()}`,
          'Content-Type': 'application/xml; charset=UTF-8',
        },
      }
    ));

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const tcklist = doc.getElementsByTagName('tcklist')[0].children;
    const schedulelist = doc.getElementsByTagName('schedulelist')[0].children;
    const orderDate = doc.getElementsByTagName('order')[0].getAttribute('cdt');
    if (orderDate === null) throw new Error('something went wrong');
    for (let i = 0; i < tcklist.length; i++) {
      this.addTicketByXml(orderDate, tcklist[i], schedulelist[i]);
    }
  }

  generateAztecCode(): string {
    const canvas = document.createElement('canvas');
    bwipjs.toCanvas(canvas, {
      bcid: 'azteccode',
      text: Array.from(new Array(60), () => (Math.random() + 1).toString(36).substring(2, 12).padStart(10, '0')).join(''),
    });
    return canvas.toDataURL('image/png');
  }

  async generateSichtmerkmal(
    tkey: string,
    journey: TrainSection[],
  ): Promise<string>   {
    const zugtypen = journey.map(v => v.verkehrsmittel.name.split(' ')[0]);
    let ticketType = 'IC/EC';
    if (zugtypen.includes('ICE')) ticketType = 'ICE';

    const s = `SuperSparpreis ${Ticket.formatDate(journey[0].abfahrtsZeitpunkt)} ${tkey} ${journey[0].abfahrtsOrt} ${journey.at(-1)!.ankunftsOrt} ${ticketType} 2 Kl. 1 Erw. ${this.person.name} `.repeat(10);
    const ab = dateFormat(journey[0].abfahrtsZeitpunkt, 'dd mm');
    const w = 332;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = w;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, w);

    for (let iy = 0; iy < 27; iy++) {
      for (let ix = 0; ix < 5; ix++) {
        const l = 0.24 * w; // length
        const x = 0.12 * w + (l * ix);
        const y = 0.15 * w + (0.025 * w * iy);
        const heightRatio = 0.7;
        const tf = l * 2 / 5; // two fifths of length
        ctx.beginPath();
        ctx.strokeStyle = '#dddddd';

        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + tf, y - (l * heightRatio - tf), x + l - tf, y + l * heightRatio - tf, x + l, y);

        ctx.stroke();
      }
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w * 0.5, w);

    for (let ci = 0; ci < 10; ci++) {
      const a = ci % 3 ? Math.PI * 0.5 : 0;
      const c = 6;
      const r = w * 0.15 * (ci / 9);
      let x = w * 0.2;
      let y = w * 0.51;
      ctx.beginPath();
      for (let i = 0; i < c; i++) {
        ctx.lineTo(x + r * Math.cos(a + (2 * Math.PI / c) * i), y + r * Math.sin(a + (2 * Math.PI / c) * i));
      }
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#dddddd';
      ctx.stroke();
    }

    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(w * 0.15, w * 0.46, w * 0.08, w * 0.08);


    ctx.save();
    ctx.rotate(Math.PI * 0.3);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      ctx.moveTo(w * 0.37, w * 0.1 + (w * i * 0.05));
      ctx.lineTo(w * 0.67, w * 0.1 + (w * i * 0.05));
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#aaaaaa';
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.rotate(Math.PI * 0.7);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      ctx.moveTo(w * 0.15, -w * 0.5 + (w * i * 0.05));
      ctx.lineTo(w * 0.45, -w * 0.5 + (w * i * 0.05));
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#aaaaaa';
      ctx.stroke();
    }
    ctx.restore();

    ctx.font = `${w * 0.2}px Arial`;
    ctx.fillStyle = '#cccccc';
    ctx.fillText(tkey[0], w * 0.6, w * 0.47);
    ctx.font = `${w * 0.3}px Arial`;
    ctx.fillText(tkey[5], w * 0.75, w * 0.5);

    ctx.save();
    ctx.rotate(-0.12);
    ctx.font = `${w * 0.055}px Arial`;
    ctx.fillStyle = '#aaaaaa';
    for (let i = 0; i < 14; i++) {
      ctx.fillText(s, w * (i * -0.7), w * (0.2 + i * 0.06));
    }
    ctx.restore();

    ctx.font = `bold ${w * 0.046}px Arial`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(this.person.name, w * 0.5, w * 0.37);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, w * 0.22);
    ctx.fillRect(0, w * 0.78, w, w);

    ctx.font = `bold  ${w * 0.10}px Arial`;
    ctx.fillStyle = '#dddddd';
    ctx.textAlign = 'center';
    ctx.fillText(ab, w * 0.215, w * 0.54);

    ctx.font = `bold  ${w * 0.10}px Arial`;
    ctx.fillStyle = '#777777';
    ctx.textAlign = 'center';
    ctx.fillText(ab, w * 0.2, w * 0.55);

    const drawText = (tx: number, ty: number, c1: string, c2: string) => {
      ctx.font = `${w * 0.15}px Arial`;
      const m1 = ctx.measureText(`${tkey[2]}${tkey[3]}`).width * 0.5;

      ctx.fillStyle = c1;
      ctx.textAlign = 'center';
      ctx.fillText(`${tkey[2]}${tkey[3]}`, tx, ty, w);

      ctx.font = `${w * 0.19}px Arial`;
      const m2 = ctx.measureText(tkey[1]).width * 0.5;
      ctx.fillStyle = c2;
      ctx.textAlign = 'center';
      ctx.fillText(tkey[1], tx - m1 - m2, ty, w);

      ctx.font = `${w * 0.15}px Arial`;
      const m3 = ctx.measureText(tkey[0]).width * 0.5;
      ctx.fillStyle = c1;
      ctx.textAlign = 'center';
      ctx.fillText(tkey[0], tx - m1 - (m2 * 2) - m3, ty, w);

      ctx.font = `${w * 0.19}px Arial`;
      const m4 = ctx.measureText(tkey[4]).width * 0.5;
      ctx.fillStyle = c2;
      ctx.textAlign = 'center';
      ctx.fillText(tkey[4], tx + m1 + m4, ty, w);

      ctx.font = `${w * 0.15}px Arial`;
      const m5 = ctx.measureText(tkey[5]).width * 0.5;
      ctx.fillStyle = c1;
      ctx.textAlign = 'center';
      ctx.fillText(tkey[5], tx + m1 + (m4 * 2) + m5, ty, w);
    };

    drawText(w * 0.5, w * 0.21, '#cccccc', '#777777');

    ctx.save();
    ctx.scale(-1, 1);
    ctx.rotate(Math.PI);
    drawText(w * 0.5, -w * 0.79, '#eeeeee', '#999999');
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  static KEY_CHARS = '123456789ABCDEFGHKLMNOPQRSTUVWXYZ';

  generateTicketKey(): string {
    return Array.from(new Array(6), () => TicketService.KEY_CHARS[Math.floor(TicketService.KEY_CHARS.length * Math.random())]).join('');
  }

  async generateHttext(
    tkey: string,
    buchungsZeitpunkt: string,
    journey: TrainSection[],
  ): Promise<string> {
    return new Promise((res) => {
      const preis = '42,90';
      let jouneyS = '';
      let jouneySI = 0;
      let jouneyEI = journey.length;
      if (!['ICE', 'IC', 'EC'].includes(journey[0].verkehrsmittel.name.split(' ')[0])) {
        jouneyS += 'NV*';
        jouneySI = 1;
      }
      if (journey.length > 1 && !['ICE', 'IC', 'EC'].includes(journey.at(-1)!.verkehrsmittel.name.split(' ')[0])) {
        jouneyEI = journey.length - 1;
      }
      jouneyS += journey.slice(jouneySI, jouneyEI).filter(v => ['ICE', 'IC', 'EC'].includes(v.verkehrsmittel.name.split(' ')[0])).map((v, i, a) => `${getShortLocation(v.abfahrtsOrt)} ${Ticket.formatTime(v.abfahrtsZeitpunkt)} ${v.verkehrsmittel.name.replace(' ', '')}` + (i == a.length - 1 ? `/${getShortLocation(v.ankunftsOrt)}` : '')).join('/');
      if (jouneyEI == journey.length - 1) jouneyS += '*NV';

      const zugtypen = journey.map(v => v.verkehrsmittel.name.split(' ')[0]);
      let ticketType = 'IC/EC';
      if (zugtypen.includes('ICE')) ticketType = 'ICE';
      const a = new FileReader();
      a.onload = (e) => res((<string>e.target?.result).split('base64,')[1]);
      a.readAsDataURL(new Blob([`
      <p>${this.person.anrede}&nbsp; ${this.person.name}<br>
      <br>
      ${ticketType} Fahrkarte, Super Sparpreis (Einfache Fahrt)<br>
      Gültigkeit: ab ${Ticket.formatDate(journey[0].abfahrtsZeitpunkt)}<br>
      Gilt nur für eingetragene Züge und Tage/Zeiten (Zugbindung).<br>
      NV=Nahverkehrszüge vor/nach Fernverkehrszügen.<br>
      <br>
      Klasse: 2, Erw.: 1<br>
      Hinfahrt: ${journey[0].abfahrtsOrt} - ${journey.at(-1)!.ankunftsOrt}, mit ${ticketType}, (SSPX1310)<br>
      <br>
      Über: ${jouneyS}<br>
      <br>
      Nur gültig mit amtlichem Lichtbildausweis (z.B. Personalausweis). Dieser ist bei der Kontrolle vorzuzeigen.<br>
      Bei Fahrkarten mit BahnCard-Rabatt zeigen Sie bitte zusätzlich Ihre gültige BahnCard vor.<br>
      <br>
      Storno ausgeschlossen.<br>
      <br>
      Auftrags-Nr: ${tkey}<br>
      Gesamtpreis: ${preis} EUR<br>
      Gebucht am ${Ticket.formatDate(buchungsZeitpunkt)} um ${Ticket.formatTime(buchungsZeitpunkt)} Uhr<br>
      </p>
      `], { type: 'text/html' }));
    });
  }

  async generateTicket(journey: TrainSection[]): Promise<void> {
    const k = this.generateTicketKey();
    const buchungsZeitpunkt = Ticket.makeBuchungsDate();
    const t = new Ticket({
      tkey: k,
      barcode: this.generateAztecCode(),
      httext: await this.generateHttext(k, buchungsZeitpunkt, journey),
      sichtmerkmal: await this.generateSichtmerkmal(k, journey),
      buchungsZeitpunkt,
      journey,
    });
    this.addTicket(t);
    this.saveTickets();
    this.selectTicket(t.getKey());
  }
}
