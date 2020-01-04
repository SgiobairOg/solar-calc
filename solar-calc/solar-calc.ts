export class SolarCalc {
  private day: number;
  private month: number;
  private year: number;
  private dayOfYear: number;
  private zenith: number;
  private localTimeZoneOffset: number;
  private latitude: number;
  private longitude: number;
  private rising: boolean;
  private longitudeHour: number;
  private approximateEventTime: number;
  private meanAnomaly: number;
  private trueLongitude: number;
  private rightAcension: number;
  private declination: Declination;
  private localHourAngle: number;

  private ZENITH = {
      official: 90 + (50/60),
      civil: 96,
      nautical: 102,
      astronomical: 108
  };

  constructor(properties: SolarCalcProperties) {
    console.clear();
    console.log('New run...');
    this.testCases();
    this.initialiseDate(properties.date, properties.timeZoneOffset);
    this.zenith = this.ZENITH[properties.zenith] || this.ZENITH['official'];
    this.latitude = this.required(properties.latitude, "A numeric latitude is required");
    this.longitude = this.required(properties.longitude, "A numeric longitude is required");
  }

  private initialiseDate(dateString = null, timeZoneOffset): void {
    const dateObj = dateString ? new Date(dateString) : new Date();
    this.day = dateObj.getDate();
    this.month = dateObj.getMonth() + 1;
    this.year = dateObj.getFullYear();
    this.dayOfYear = this.calcDayOfYear(this.day, this.month, this.year);
    this.localTimeZoneOffset = timeZoneOffset || dateObj.getTimezoneOffset() / 60;
  }

  private calcDayOfYear(day: number, month: number, year: number): number {
    const n1 = Math.floor(275 * month / 9);
    const n2 = Math.floor((month + 9) / 12);
    const n3 = (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3));
    return n1 - (n2 * n3) + day - 30;
  }

  private calcLongitudeHour(longitude) {
    return longitude / 15.0;
  }

  // Returns an approximate time for the event expressed in decimal days
  private calcApproximateEventTime(longitudeHour: number, dayOfYear: number, rising = true): number {
    return rising ?
      dayOfYear + ((6.0 - longitudeHour) / 24.0) :
      dayOfYear + ((18.0 - longitudeHour) / 24.0);
  }
  // Calculate Mean Anomaly in Degrees
  private calcMeanAnomaly(approximateTime: number): number {
    return (0.9856 * approximateTime) - 3.289;
  }

  private calcTrueLongitude(meanAnomaly: number): number {
    let trueLongitude = meanAnomaly + 
      (1.916 * Math.sin(this.toRadians(meanAnomaly))) + 
      (0.020 * Math.sin(this.toRadians(2.0 * meanAnomaly))) + 282.634;
    return (trueLongitude + 360) % 360;
  }

  private calcRightAscension(trueLongitude: number): number {
    let rightAscension = this.toDegrees(
      Math.atan(
        0.91764 * Math.tan(
          this.toRadians(trueLongitude)
        )
      )
    );
    rightAscension = (rightAscension + 360) % 360;
    const lQuad = Math.floor(trueLongitude/90) * 90;
    const rQuad = Math.floor(rightAscension/90) * 90;
    return (rightAscension + (lQuad - rQuad)) / 15;
  }

  private calcDeclination(trueLongitude: number): Declination {
    const sinDec = 0.39782 * Math.sin(this.toRadians(trueLongitude));
    const cosDec = Math.cos(Math.asin(sinDec));
    return { 
        sin: sinDec,
        cos: cosDec
    } as Declination;
  }

  private calcLocalHourAngle(zenith: number, declination: Declination, latitude: number, rising = true) {
    const cosH = (Math.cos(this.toRadians(zenith)) - (declination.sin * Math.sin(this.toRadians(latitude)))) / (declination.cos * Math.cos(this.toRadians(latitude)));

    if(cosH > 1 || cosH < -1) {
      return null;
    }
    console.log("arccos x: ", this.toDegrees(Math.acos(cosH)))
    return rising ? (360 - this.toDegrees(Math.acos(cosH))) / 15 : this.toDegrees(Math.acos(cosH)) / 15;
  }

  private calcMeanTimeOfEvent(localHourAngle, rightAcension, approximateTime, localTimeZoneOffset, longitudeHour) {
    const time =  localHourAngle + rightAcension - (0.06571 * approximateTime) - 6.622;
    console.log("T: ", time);
    return ((time - longitudeHour + localTimeZoneOffset + 24) % 24) ;
  }

  private getEvent(rising: boolean): string {
    console.log("d: ", this.dayOfYear);
    this.longitudeHour = this.calcLongitudeHour(this.longitude);
    console.log("λ-Hour: ", this.longitudeHour)
    this.approximateEventTime = this.calcApproximateEventTime(
      this.longitudeHour, this.dayOfYear, rising);
    console.log("𝑡 (hours): ", this.approximateEventTime);
    this.meanAnomaly = this.calcMeanAnomaly(this.approximateEventTime);
    console.log("𝑀 (degrees): ", this.meanAnomaly)
    this.trueLongitude = this.calcTrueLongitude(this.meanAnomaly);
    console.log("𝐿 (degrees): ", this.trueLongitude)
    this.rightAcension = this.calcRightAscension(this.trueLongitude);
    console.log("𝑅𝐴 (hours): ", this.rightAcension)
    this.declination = this.calcDeclination(this.trueLongitude);
    console.log("𝛿 (degrees): ", this.toDegrees(Math.asin(this.declination.sin)));
    this.localHourAngle = this.calcLocalHourAngle(
      this.zenith, this.declination, this.latitude, rising);
    console.log("𝐻 (hours): ", this.localHourAngle);

    const sunrise = this.calcMeanTimeOfEvent(
      this.localHourAngle,
      this.rightAcension,
      this.approximateEventTime,
      this.localTimeZoneOffset,
      this.longitudeHour
    );

    console.groupEnd();
    return this.toTimeString(sunrise);
  }

  getSunrise(): string {
    console.log("\nSunrise");
    console.groupCollapsed('Sunrise Calculation Intermediate Steps');
    return this.getEvent(true);
  }

  getSunset(): string {
    console.log("\nSunset");
    console.groupCollapsed('Sunset Calculation Intermediate Steps');
    return this.getEvent(false);
  }

  // Utils

  private testCases() {
    console.log("\nTests");
    console.log("Time Conversion:");
    console.log("5.99hrs = ", this.toTimeString(5.99));
    console.log("5.99999hrs = ", this.toTimeString(5.99999));
  }

  private required(value: any, message: string): any | null {
    if(!value) {
      throw new Error(message);
      return null;
    } else {
      return value;
    }
  }

  private toRadians(degreeValue: number): number {
    return (Math.PI/180) * degreeValue;
  }

  private toDegrees(radianValue: number): number {
    return (180/Math.PI) * radianValue;
  }

  private toTimeString(decimalHours): string {
    console.log("Decimal time: ", decimalHours);
    const decimalMinutes = Math.round(decimalHours * 60);
    const hours = '00' + Math.floor(decimalMinutes / 60);
    const minutes = '00' + (decimalMinutes % 60);
    return `${hours.slice(-2)}:${minutes.slice(-2)}`;
  }
};
