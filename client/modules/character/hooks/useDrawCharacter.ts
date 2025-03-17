import { CharacterClass, type Character } from '@fwo/shared';

export const drawCharacter = (canvas: HTMLCanvasElement, character: Character) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.imageSmoothingEnabled = false;

  const layers: HTMLImageElement[] = [];

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer) => {
      ctx.drawImage(layer, 0, 0);
    });
  };

  const drawBody = () => {
    const body = new Image();
    switch (character.class) {
      case CharacterClass.Warrior:
        body.src = new URL('/images/warrior.png', import.meta.url).href;
        break;
      case CharacterClass.Mage:
        body.src = new URL('/images/mage.png', import.meta.url).href;
        break;
      default:
        body.src = new URL('/character/male.png', import.meta.url).href;
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
