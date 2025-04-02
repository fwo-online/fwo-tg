import { getPaymentsByInvoiceType } from '@/api/payment';
import { CharacterService } from '@/arena/CharacterService';
import { InvoiceType } from '@fwo/shared';
import { uniq } from 'es-toolkit';

export const getDonators = async () => {};

export class DonationHelper {
  static donationLivetime = 30 * 24 * 60 * 60 * 1000; // 1 month
  static announcementPeriod = 4 * 60 * 60 * 1000; // 4 hours
  static lastAnnouncement = Date.now() - this.announcementPeriod;

  static shouldAnnounce() {
    return Date.now() - this.lastAnnouncement >= this.announcementPeriod;
  }

  static resetLastAnnouncement() {
    this.lastAnnouncement = Date.now();
  }

  static async getDonators() {
    const fromDate = new Date(Date.now() - this.donationLivetime);
    const payments = await getPaymentsByInvoiceType(
      { createdAt: { $gte: fromDate } },
      InvoiceType.Donation,
    );
    const users = uniq(payments.map(({ user }) => user));

    return Promise.all(users.map((user) => CharacterService.getCharacter(user.toString())));
  }

  static async isDonator(user: string | number) {
    const fromDate = new Date(Date.now() - this.donationLivetime);
    const payments = await getPaymentsByInvoiceType(
      {
        createdAt: { $gte: fromDate },
        user,
      },
      InvoiceType.Donation,
    );

    return Boolean(payments.length);
  }
}
