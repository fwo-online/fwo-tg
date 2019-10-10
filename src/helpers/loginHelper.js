var CharModel = require("../models/character");

async function regChar (id, prof, sex, cb) {
    createNewChar(id, prof, sex, cb);
}

const createNewChar = async function (tg_id, prof, sex, cb) {
    let h;
    switch (prof) {
        case 'Воин':
 
         h = {
          prof: 'w',
          str: 10,
          dex: 8,
          int: 3,
          wis: 3,
          inventory: [{
           code: 'waa',
           puton: true,
           place: 'a'
          }],
         }
         break;
 
        case 'Лучник':
 
         h = {
          prof: 'l',
          str: 3,
          dex: 8,
          int: 10,
          wis: 3,
          inventory: [{
           code: 'wab',
           puton: true,
           place: 'a'
          }],
         }
         break;
 
        case 'Маг':
 
         h = {
          prof: 'm',
          str: 3,
          dex: 3,
          int: 8,
          wis: 10,
          mag: {
           'magic_arrow': 1
          },
          inventory: [{
           code: 'wac',
           puton: true,
           place: 'a'
          }],
         }
         break;
 
        case 'Лекарь':
 
         h = {
          prof: 'p',
          str: 3,
          dex: 3,
          int: 10,
          wis: 8,
          mag: {
           'light_heal': 1
          },
          inventory: [{
           code: 'wac',
           puton: true,
           place: 'a'
          }],
         }
         break;
 
        default:
         cb('prof error', null);
         break;
       }

       if (!h) return;

       h.sex = sex;
       h.tg_id = tg_id;
       h.nickname = tg_id;

       try {
            let newChar = new CharModel(h);
            await newChar.save();
            let resp = CharModel.find({tg_id: from.id})
        } catch {(e =>
            console.log(e))
        }
}

module.exports.regChar = regChar;