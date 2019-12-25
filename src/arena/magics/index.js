/**
 * Первичный загрузчик магий
 */
// FIXME: Сюда пока нужно руками добавлять все actions и делать их export
// после будет glob подгрузка модулей
const blessing = require('./blessing');
const chainLightning = require('./chainLightning');
const magicDefense = require('./magicDefense');
const glitch = require('./glitch');
const silence = require('./silence');
const attack = require('../actions/attack');
const protect = require('../actions/protect');
// const regen = require('./regen');
const handsHeal = require('../actions/handsHeal');
const magicArrow = require('./magicArrow');
const curse = require('./curse');
const entangle = require('./entangle');
const frostTouch = require('./frostTouch');
const poisonBreath = require('./poisonBreath');
const rockfall = require('./rockfall');
const lightHeal = require('./lightHeal');
const magicArmor = require('./magicArmor');
const stoneSkin = require('./stoneSkin');
const smallAura = require('./smallAura');
const regeneration = require('../actions/regen');
const postHeal = require('./postHeal');

module.exports = {
  blessing,
  chainLightning,
  magicDefense,
  glitch,
  silence,
  attack,
  protect, // regen: regen,
  handsHeal,
  magicArrow,
  curse,
  entangle,
  frostTouch,
  poisonBreath,
  rockfall,
  lightHeal,
  magicArmor,
  stoneSkin,
  smallAura,
  regeneration,
  postHeal,
};
