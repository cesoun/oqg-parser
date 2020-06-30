const fs = require('fs');
const xray = require('x-ray')();

const URI = "https://oldschool.runescape.wiki/w/Optimal_quest_guide";

xray(URI, 'tbody', {
  quests: ['tr td:nth-child(1) a@title'],
  uris: ['tr td:nth-child(1) a@href']
})
.then(obj => {
  let fstream = fs.createWriteStream('quests.txt', { flags: 'w' });

  obj.quests.map(quest => {
    fstream.write(`${quest}|${obj.uris.shift()}\n`);
  });

  fstream.end();
})