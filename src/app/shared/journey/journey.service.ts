import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import dateFormat from 'dateformat';
import { Observable, of, retry } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TrainSection } from '../ticket/ticket';

export type Fahrplan = {
  verbindungen: {
    verbindungsAbschnitte: TrainSection[]
  }[]
};

export type Location = { id: string, name: string };

@Injectable()
export class JourneyService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  searchLocation(s: string): Observable<Location[]> {
    return this.http.get<Location[]>(`https://skillproxy.i9.ar/web/api/reiseloesung/orte?suchbegriff=${encodeURIComponent(s)}&typ=ALL&limit=7`, {
      headers: {
        'X-PROXY-HOST': 'next.bahn.de',
        'X-PROXY-PREVENT-OPTIONS': '',
        'X-PROXY-AUTHORIZATION': `Bearer ${this.authService.getAuthToken()}`,
      }
    }).pipe(retry(3));
  }

  fahrtSuche = {
    fromId: '',
    toId: '',
    abfahrt: '',
  };

  searchFahrplan(): Observable<Fahrplan> {
    if (!this.fahrtSuche.fromId || !this.fahrtSuche.toId || !this.fahrtSuche.abfahrt) return of({verbindungen: []});
    return this.http.post<Fahrplan>(
      'https://skillproxy.i9.ar/web/api/angebote/fahrplan',
      {
        "abfahrtsHalt": this.fahrtSuche.fromId,
        "anfrageZeitpunkt": dateFormat(this.fahrtSuche.abfahrt, 'yyyy-mm-dd\'T\'hh:mm:ss'),
        "ankunftsHalt": this.fahrtSuche.toId,
        "ankunftSuche": "ABFAHRT", "klasse": "KLASSE_2", "produktgattungen": ["ICE", "EC_IC", "IR", "REGIONAL", "SBAHN", "BUS", "SCHIFF", "UBAHN", "TRAM", "ANRUFPFLICHTIG"], "reisende": [{ "typ": "ERWACHSENER", "ermaessigungen": [{ "art": "KEINE_ERMAESSIGUNG", "klasse": "KLASSENLOS" }], "alter": [], "anzahl": 1 }], "rueckfahrtAnfrageFolgt": false, "schnelleVerbindungen": true, "sitzplatzOnly": false, "bikeCarriage": false, "reservierungsKontingenteVorhanden": false,
      }, {
      headers: {
        'X-PROXY-HOST': 'next.bahn.de',
        'X-PROXY-PREVENT-OPTIONS': '',
        'X-PROXY-AUTHORIZATION': `Bearer ${this.authService.getAuthToken()}`,
      }
    }).pipe(retry(3));
  }
}
