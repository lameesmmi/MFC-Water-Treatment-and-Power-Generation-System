export type Dept = 'CHE' | 'PETE' | 'SWE' | 'EE';

export interface Member {
  name:     string;
  dept:     Dept;
  leader?:  boolean;
  color:    string;
  linkedin: string;
}
