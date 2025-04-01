export enum InvoiceType {
  ResetAttributes = 'resetAttributes',
}
export const invoiceTypes = {
  [InvoiceType.ResetAttributes]: {
    components: { arcanite: 7 },
    stars: 300,
    title: 'Сброс характеристик',
    desctiption: 'Сброс характеристик персонажа',
  },
};
