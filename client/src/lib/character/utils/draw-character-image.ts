import { CharacterClass } from '@fwo/shared';
import Archer from '$lib/assets/character/Archer.png';
import Mage from '$lib/assets/character/Mage.png';
import Priest from '$lib/assets/character/Priest.png';
import Warrior from '$lib/assets/character/Warrior.png';

const characterImages = {
  [CharacterClass.Warrior]: Warrior,
  [CharacterClass.Mage]: Mage,
  [CharacterClass.Priest]: Priest,
  [CharacterClass.Archer]: Archer,
};

export const drawCharacterImage = (canvas: HTMLCanvasElement, characterClass: CharacterClass) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.imageSmoothingEnabled = false;

  const layers: HTMLImageElement[] = [];

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer) => {
      ctx.drawImage(layer, 0, 0, canvas.width, canvas.height);
    });
  };

  const drawBody = () => {
    const body = new Image();
    body.src = characterImages[characterClass] || characterImages[CharacterClass.Warrior];

    body.onload = () => {
      layers.push(body);
      draw();
    };
  };

  // const drawWeapon = () => {
  //   const body = new Image();
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   // const { code } = character.inventory[0];
  //   // fixme fix vite dynamic import
  //   body.src = new URL('/items/wac.png', import.meta.url).href;
  //   body.onload = () => {
  //     layers.push(body);
  //     draw();
  //   };
  // };

  drawBody();
  // if (character.inventory.length) {
  //   drawWeapon();
  // }
};
