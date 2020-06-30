const fs = require('fs');
const xray = require('x-ray')();

const URI = "https://oldschool.runescape.wiki/w/Optimal_quest_guide";

xray(URI, 'tbody', {
  quests: ['tr td:nth-child(1) a@title'],
  uris: ['tr td:nth-child(1) a@href']
})
.then(obj => {
  let quests = obj.quests.map(quest => {
    return { name: quest, uri: obj.uris.shift() }
  });
  
  fs.writeFileSync('quests.json', JSON.stringify(quests, null, 4));
})