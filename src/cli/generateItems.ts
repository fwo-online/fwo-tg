import { generateItems, generateItemsSets } from '@/helpers/itemHelper';
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

async function generate() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      save: {
        type: 'boolean',
        short: 's',
        default: false
      }
    },
    allowPositionals: true,
  })

  try {
    const items = await generateItems()
    console.log('Items generated!')
    if (values.save) {
      await writeFile('./items.json', JSON.stringify(items, null, 2))
      console.log('Items saved!')
    }

    const itemsSets = await generateItemsSets()
    console.log('Items sets generated!')
      
    if (values.save) {
      await writeFile('./items-sets.json', JSON.stringify(itemsSets, null, 2))
      console.log('Items sets saved!')
    }

    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

void generate();
