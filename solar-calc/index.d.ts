export = SolarCalc;

declare class SolarCalc {

  latitude: number;
  longitude: number;
  
  constructor(properties: SolarCalcProperties);
  
  getSunrise(): string;
  getSunset(): string;
}

declare namespace SolarCalc {
  export interface Declination {
    sin: number;
    cos: number;
  }

  export interface SolarCalcProperties {
    latitude: number;
    longitude: number;
    date?: string;
    zenith?: 'civil' | 'official' | 'nautical' | 'astronomical';
  }
}

