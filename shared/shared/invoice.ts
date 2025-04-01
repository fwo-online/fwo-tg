export enum InvoiceType {
  ResetAttributes = 'resetAttributes',
}
export const invoiceTypes = {
  [InvoiceType.ResetAttributes]: {
    components: { arcanite: 7 },
    stars: 1,
    title: 'Сброс характеристик',
    desctiption: 'Сброс характеристик персонажа',
  },
};
