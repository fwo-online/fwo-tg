export enum InvoiceType {
  ResetAttributes = 'resetAttributes',
  ChangeName = 'changeName',
  Donation = 'donation',
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
  [InvoiceType.Donation]: {
    stars: 0,
    title: 'Поддержать',
  },
};
