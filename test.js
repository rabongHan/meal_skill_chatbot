const map = new Map();

map.set('date', '{\"value\":\"2018-03-20\",\"userTimeZone\":\"UTC+9\"}');

const str = JSON.stringify(Array.from(map.entries()));

console.log(str.substring(31,33));