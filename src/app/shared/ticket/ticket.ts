import dateFormat from 'dateformat';

export type JourneySection = TrainSection | ChangeSection;

export type ChangeSection = {
  type: 'change';
  t: string;
}

export type TrainSection = {
  type: 'train';
  abfahrtsZeitpunkt: string,
  abfahrtsOrt: string,
  abfahrtsGleis: string,
  ankunftsZeitpunkt: string,
  ankunftsOrt: string,
  ankunftsGleis: string,
  verkehrsmittel: { name: string }
}

export type TicketI = {
  tkey: string,
  barcode: string,
  barcode2?: string,
  httext: string,
  sichtmerkmal: string,
  buchungsZeitpunkt: string,
  journey: TrainSection[],
}

function b64DecodeUnicode(s: string) {
  return decodeURIComponent(Array.prototype.map.call(atob(s), function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''));
}

export class Ticket {
  constructor(public data: TicketI) { }

  getKey(): string {
    return this.data.tkey;
  }

  getID(): string {
    return this.data.tkey.split('-')[0]!;
  }

  getBarCode(): string {
    return this.data.barcode;
  }

  getBarCode2(): string | undefined {
    return this.data.barcode2;
  }

  getHttext(): string {
    return b64DecodeUnicode(this.data.httext);
  }

  getSichtmerkmal(): string {
    return this.data.sichtmerkmal;
  }

  static formatDate(t: string | Date): string {
    return dateFormat(t, 'dd.mm.yyyy');
  }

  static formatTime(t: string | Date): string {
    return dateFormat(t, 'HH:MM');
  }

  getDate(): string {
    return Ticket.formatDate(this.data.journey[0].abfahrtsZeitpunkt);
  }

  static makeBuchungsDate(): string {
    const d = new Date();
    d.setHours(d.getHours() - 80);
    return dateFormat(d, 'yyyy-mm-dd\'T\'HH:MM:ss');
  }

  getBuchungsDate(): string {
    return Ticket.formatDate(this.data.buchungsZeitpunkt);
  }

  getBuchungsTime(): string {
    return Ticket.formatTime(this.data.buchungsZeitpunkt);
  }

  getDateShort(): string {
    return dateFormat(this.data.journey[0].abfahrtsZeitpunkt, 'dd.mm.yy');
  }

  getStartTime(): string {
    return Ticket.formatTime(this.data.journey[0].abfahrtsZeitpunkt);
  }

  getStartBhf(): string {
    return this.data?.journey[0].abfahrtsOrt;
  }

  getStart(): string {
    return this.getStartTime() + ' ' + this.getStartBhf();
  }

  getEndTime(): string {
    return Ticket.formatTime(this.data.journey.at(-1)!.ankunftsZeitpunkt);
  }

  getEndBhf(): string {
    return this.data.journey.at(-1)!.ankunftsOrt;
  }

  getEnd(): string {
    return this.getEndTime() + ' ' + this.getEndBhf();
  }

  getSections(): JourneySection[] {
    return Ticket.makeSections(this.data.journey);
  }

  static makeSections(sections: TrainSection[]): JourneySection[] {
    const journey: JourneySection[] = [];
    for (let i=0; i<sections.length-1; i++) {
      journey.push({...sections[i], type: 'train'});
      const t = (new Date(sections[i+1].abfahrtsZeitpunkt).getTime() - new Date(sections[i].ankunftsZeitpunkt).getTime()) / 1000;
      journey.push({
        type: 'change',
        t: (t / 60) + ' Min.',
      })
    }
    journey.push({...sections.at(-1)!, type: 'train'});
    return journey;
  }
}
