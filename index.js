const fs = require('fs');
const { type } = require('os');
const xray = require('x-ray')();

const URI = "https://oldschool.runescape.wiki/w/Optimal_quest_guide";
const IRONMAN = "/Ironman"
const REQURI = "https://oldschool.runescape.wiki/w/Quests/Skill_requirements";

parseUriToFile(URI, 'quests');
parseUriToFile(URI + IRONMAN, 'quests_ironman');

/**
 * Takes in the uri and filename without .json extension to save.
 * @param {string} uri 
 * @param {string} filename 
 */
function parseUriToFile(uri, filename) {
  xray(uri, 'tbody', {
    quests: ['tr td:nth-child(1) a@title'],
    uris: ['tr td:nth-child(1) a@href']
  })
  .then(obj => {
    let quests = obj.quests
      .map(quest => {
        
        let uri = obj.uris.shift();
  
        // Skip all non-quest items.
        if (quest.toLowerCase().includes('diary') || quest.toLowerCase().includes('achievement'))
          return;
  
        return { name: quest, uri: uri, reqs: [] }
      });
  
    // Remove nulls
    return quests.filter(quest => { return quest != null })
  })
  .then(quests => {
    xray(REQURI, '.mw-parser-output')
    .then(res => {
      let exp = /(?<=See also).*(?=See also)/s
      lines = res.match(exp)[0].split('\n').filter(line => line !== '');
  
      let types = [];
      lines.forEach(line => {
        if (line.includes('[edit'))
          types.push(line.replace('[edit | edit source]', ''));
      });
  
      let requirements = {};
      while (next = lines.shift()) {
        let type = null;
        if (next.includes('[edit | edit source]')) {
          type = next.replace('[edit | edit source]', '');
          requirements[type] = [];
  
          while (inner = lines.shift()) {
            if (inner.includes('[edit | edit source]')) {
              lines.unshift(inner);
              break;
            }
            
            let reqs = inner.split('-');
            reqs = [reqs[0].replace(' ', ''), ...reqs[1].replace(/^\s+|\s+$/g, '').split('*')]
  
            requirements[type].push(reqs);
          }
        }
      }
  
      quests = quests.map(quest => {
        for (const skill in requirements) {
          let requirement = requirements[skill];
  
          for (const req in requirements[skill]) {
            let level = requirement[req][0];
            let qName = requirement[req][1];
            let boostable = requirement[req].length === 3;
    
            if (quest.name === qName) {
              quest.reqs.push({ skill, level, boostable });
            }
          }
        }
  
        return quest;
      });
  
      return quests
    })
    .then(quests => fs.writeFileSync(`${filename}.json`, JSON.stringify(quests, null, 4)));
  });
}