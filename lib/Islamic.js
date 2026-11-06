import { safeFetch } from './fetcher.js';

export async function getSurah(surahNum) {
  const res = await safeFetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.asad`);
  const data = await res.json();
  return data.data;
}

export async function getPrayerTimes(city, country = 'PK') {
  const res = await safeFetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=2`);
  const data = await res.json();
  return data.data.timings;
}