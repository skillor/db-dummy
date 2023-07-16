import { trigger, transition, style, query, animateChild, group, animate } from "@angular/animations";

const slideDuration = '0.3s';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('Left => Right', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
        })
      ]),
      query(':enter', [style({ right: '-100%' })]),
      group([
        query(':leave', [animate(`${slideDuration} ease-out`, style({ right: '100%' }))]),
        query(':enter', [animate(`${slideDuration} ease-out`, style({ right: '0%' }))])
      ]),
    ]),
    transition('Right => Left', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        })
      ]),
      query(':enter', [style({ left: '-100%' })]),
      group([
        query(':leave', [animate(`${slideDuration} ease-out`, style({ left: '100%' }))]),
        query(':enter', [animate(`${slideDuration} ease-out`, style({ left: '0%' }))])
      ]),
    ]),
  ].concat(['Auftrag', 'Bahncards', 'Fahrplan'].map(v => transition('* <=> ' + v, [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
      })
    ]),
    query(':enter', [style({ right: '-100%' })]),
    group([
      query(':leave', [animate(`${slideDuration} ease-out`, style({ right: '100%' }))]),
      query(':enter', [animate(`${slideDuration} ease-out`, style({ right: '0%' }))])
    ]),
  ]),)));
