 /**
  * Monster Service
  * @description Класс для создание монстра
  * @module Service/Monster
  * @todo Это нерабочий модуль, только прототип
  */

 let Monster = function(data) {
   this.name = data && data.name ? data.name : this.generateName();
   this.class = data && data.class ? data.class : this.generateClass();
 };

 Monster.prototype = {
   name: undefined,
   class: undefined,
   xp: 25,
   level: 1,
   baseStats: {
     strength: 10,
     intelligence: 10,
     dexterity: 10,
     life: 100,
     mana: 100,
   },
   currentLife: null,
   currentMana: null,
   damage: 1,
   attackSpeed: 1,

   generateName: function() {
     let rng = Math.floor((Math.random() * 4));
     let names = [
       'Grumpy',
       'Ezekiel',
       'Foobar',
       'Baumkopf Holzfaust',
     ];

     return names[rng];
   },

   generateClass: function() {
     let rng = Math.floor((Math.random() * 5));
     let names = [
       'Wolf',
       'Bear',
       'Vampir',
       'Zombie',
       'Skeleton',
     ];

     return names[rng];
   },

   getMonsterData: function() {
     return {
       name: this.name,
       class: this.class,
       level: this.level,
       xp: this.xp,
       damage: this.getTotalDamage(),
       currentLife: this.getCurrentLife(),
       totalLife: this.getTotalLife(),
       currentMana: this.getCurrentMana(),
       totalMana: this.getTotalMana(),
     };
   },

   getTotalDamage: function() {
     return this.damage;
   },

   getCurrentLife: function() {
     return this.currentLife || this.baseStats.life;
   },

   getTotalLife: function() {
     return this.baseStats.life;
   },

   getCurrentMana: function() {
     return this.currentMana || this.baseStats.mana;
   },

   getTotalMana: function() {
     return this.baseStats.mana;
   },

   heal: function(value) {
     this.currentLife = this.currentLife + value > this.getTotalLife() ?
       this.currentLife + value : this.getTotalLife();
   },
 };

 module.exports = {
   generateNewMonster: function() {
     return new Monster();
   },
 };
