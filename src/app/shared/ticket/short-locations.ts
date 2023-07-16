export function getShortLocation(s: string) {
  const t = shortLocations[s];
  if (t === undefined) return s;
  return t;
}

export const shortLocations: {[key: string]: string} = {
  'Lutherstadt Wittenberg Hbf': 'LWittbg',
  'Erfurt Hbf': 'EF-Hbf',
  'Frankfurt(Main)Hbf': 'F-Hbf',
  'Dortmund Hbf': 'DO-Hbf',
  'Düsseldorf Hbf': 'D-Hbf',
  'Hannover Hbf': 'H-Hbf',
  'Hamburg Hbf': 'HH-Hbf',
  'Heidelberg Hbf': 'HD-Hbf',
  'Berlin Hbf': 'B-Hbf',
  'Magdeburg Hbf': 'MD-Hbf',
  'Leipzig Hbf': 'L-Hbf',
  'Hamm(Westf)Hbf': 'HammWf',
  'Dresden Hbf': 'DD-Hbf',
  'Köln Hbf': 'K-Hbf',
  'Brandenburg Hbf': 'BRB-Hbf',
  'München Hbf': 'M-Hbf',
  'Halle(Saale)Hbf': 'HAL-Hbf',
  'Stuttgart Hbf': 'S-Hbf',
  'Aachen Hbf': 'AC-Hbf',
  'Augsburg Hbf': 'A-Hbf',
  'Nürnberg Hbf': 'N-Hbf',
};
