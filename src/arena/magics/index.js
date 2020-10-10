/**
 * Первичный загрузчик магий
 */
// FIXME: Сюда пока нужно руками добавлять все actions и делать их export
// после будет glob подгрузка модулей
const regeneration = require('../actions/regen');
const { default: acidSpittle } = require('./acidSpittle');
const blessing = require('./blessing');
const { default: chainLightning } = require('./chainLightning');
const curse = require('./curse');
const eclipse = require('./eclipse');
const entangle = require('./entangle');
const frostTouch = require('./frostTouch');
const glitch = require('./glitch');
const lightHeal = require('./lightHeal');
const madness = require('./madness');
const magicArmor = require('./magicArmor');
const { default: magicArrow } = require('./magicArrow');
const magicDefense = require('./magicDefense');
const mediumHeal = require('./mediumHeal');
const paralysis = require('./paralysis');
const { default: poisonBreath } = require('./poisonBreath');
const { default: rockfall } = require('./rockfall');
const silence = require('./silence');
const smallAura = require('./smallAura');
const stoneSkin = require('./stoneSkin');

module.exports = {
  acidSpittle,
  blessing,
  chainLightning,
  glitch,
  silence,
  curse,
  eclipse,
  entangle,
  frostTouch,
  poisonBreath,
  rockfall,
  lightHeal,
  madness,
  magicArmor,
  magicArrow,
  magicDefense,
  mediumHeal,
  paralysis,
  stoneSkin,
  smallAura,
  regeneration,
};
