import { CharacterClass } from '@fwo/shared';

export const drawCharacter = (canvas: HTMLCanvasElement, characterClass: CharacterClass) => {
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
    switch (characterClass) {
      case CharacterClass.Warrior:
        body.src = new URL('/character/Warrior.png', import.meta.url).href;
        break;
      case CharacterClass.Mage:
        body.src = new URL('/character/Mage.png', import.meta.url).href;
        break;
      case CharacterClass.Priest:
        body.src = new URL('/character/Priest.png', import.meta.url).href;
        break;
      case CharacterClass.Archer:
        body.src = new URL('/character/Archer.png', import.meta.url).href;
        break;
      default:
        body.src = new URL('/character/Warrior.png', import.meta.url).href;
    }

    body.onload = () => {
      layers.push(body);
      draw();
    };
  };

  const drawWeapon = () => {
    const body = new Image();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { code } = character.inventory[0];
    // fixme fix vite dynamic import
    body.src = new URL('/items/wac.png', import.meta.url).href;
    body.onload = () => {
      layers.push(body);
      draw();
    };
  };

  drawBody();
  // if (character.inventory.length) {
  //   drawWeapon();
  // }
};
