export enum InvoiceType {
  ResetAttributes = 'resetAttributes',
}
export const invoiceTypes = {
  [InvoiceType.ResetAttributes]: {
    amount: 1,
    title: 'Сброс характеристик',
  },
};
