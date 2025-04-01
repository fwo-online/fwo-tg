export enum InvoiceType {
  ResetAttributes = 'resetAttributes',
  ChangeName = 'changeName',
}

export const invoiceTypes = {
  [InvoiceType.ResetAttributes]: {
    components: { arcanite: 7 },
    stars: 300,
    title: 'Сброс характеристик',
  },
  [InvoiceType.ChangeName]: {
    components: { arcanite: 5 },
    stars: 200,
    title: 'Смена имени персонажа',
  },
};
