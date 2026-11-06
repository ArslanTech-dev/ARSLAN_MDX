import { safeFetch } from './fetcher.js';

export async function getWeather(city) {
  const res = await safeFetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=b1b15e88fa797225412429c1c50c122a&units=metric`);
  return await res.json();
}

export async function translateText(text, to = 'ur') {
  const res = await safeFetch(`https://api.popcat.xyz/translate?to=${to}&text=${encodeURIComponent(text)}`);
  const data = await res.json();
  return data.translated;
}