import { GM } from './constants';
import { Dept, Member } from './types';

export const MEMBERS: Member[] = [
  { name: 'Sara Almugrin',     dept: 'CHE',  leader: true, color: '#b07055', linkedin: 'https://www.linkedin.com/in/sara-almugrin-198819279/'      },
  { name: 'Ruba Alshahrani',   dept: 'PETE',               color: '#8EA468', linkedin: 'https://www.linkedin.com/in/'                              },
  { name: 'Lamees Alikhwan',   dept: 'SWE',                color: '#5888b0', linkedin: 'https://www.linkedin.com/in/lamees-al-ikhwan-48a492231'    },
  { name: 'Rema Almoamer',     dept: 'EE',                 color: '#5a9c84', linkedin: 'https://www.linkedin.com/in/reema-almoammar-610757263/'    },
  { name: 'Sarah Al Jumaiaah', dept: 'CHE',                color: '#8870a8', linkedin: 'https://www.linkedin.com/in/'                              },
  { name: 'Wajan Alkharobi',   dept: 'PETE',               color: '#4e9660', linkedin: 'https://www.linkedin.com/in/'                              },
];

export const DEPT_META: Record<Dept, { label: string; bg: string; text: string; border: string }> = {
  CHE:  { label: 'Chemical Engineering',   bg: GM.yellowDim, text: GM.yellowText, border: GM.yellowBorder },
  PETE: { label: 'Petroleum Engineering',  bg: GM.greenDim,  text: GM.greenText,  border: GM.greenBorder  },
  SWE:  { label: 'Software Engineering',   bg: GM.greenDim,  text: GM.greenText,  border: GM.greenBorder  },
  EE:   { label: 'Electrical Engineering', bg: GM.yellowDim, text: GM.yellowText, border: GM.yellowBorder },
};

export function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}
