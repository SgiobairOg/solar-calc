// Import stylesheets
import './style.css';

// Import Calcs
import { SolarCalc } from './solar-calc/solar-calc';

const options = {
  zurich: {
    latitude: 47.379991,
    longitude: 8.556211,
    timeZoneOffset: +1
  },
  london: {
    latitude: 51.5,
    longitude: -0.127755,
    timeZoneOffset: +1
  },
  "wayne, PA (test)": {
    latitude: 40.9,
    longitude: -74.3,
    date: '25 June 2019',
    timeZoneOffset: -4 
  },
  "wayne, PA": {
    latitude: 40.9,
    longitude: -74.3,
    timeZoneOffset: -5 
  },
  svalbard: {
    latitude: 78.751414,
    longitude: 18.188870,
    timeZoneOffset: +1
  },
  "svalbard, summer": {
    latitude: 78.751414,
    longitude: 18.188870,
    timeZoneOffset: +1,
    date: "4 August 2020"
  }
};

let testLocale = 'wayne, PA (test)';
const localeSelect: HTMLSelectElement = document.querySelector('[name=locales]');

Object.keys(options).forEach( key => {
  const newOption = document.createElement('option');
  newOption.value = key;
  newOption.innerHTML = key.toLocaleUpperCase();
  localeSelect.appendChild(newOption);
});

localeSelect.addEventListener('change', (event) => {
  testLocale = localeSelect.value;
  console.log(testLocale);
  runCalculations();
});

function runCalculations() {
  const calc: SolarCalc = new SolarCalc(options[testLocale]);

  const sunrise = calc.getSunrise();
  const sunset = calc.getSunset();

  const appDiv: HTMLElement = document.getElementById('app');
  appDiv.innerHTML = `
    <h1>Sunrise and Sunset</h1>
    <p>Location: ${testLocale.toLocaleUpperCase()}
    <p>Position: ${options[testLocale].latitude}˚, ${options[testLocale].longitude}˚</p>
    <table>
      <tr>
        <td>Sunrise</td>
        <td>${sunrise}</td>
      </tr>
      <tr>
        <td>Sunset</td>
        <td>${sunset}</td>
      </tr>
    </table>
  `;
}

runCalculations();