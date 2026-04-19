import { invoice } from "@tma.js/sdk-react";
import { getDonationInvoice } from "@/api/serviceShop";
import { usePopup } from "@/hooks/usePopup";
import { useRequest } from "@/hooks/useRequest";
import { useSyncCharacter } from "@/modules/character/hooks/useSyncCharacter";

export const useServiceShopDonation = () => {
	const { syncCharacter } = useSyncCharacter();
	const [loading, makeRequest] = useRequest();
	const popup = usePopup();

	const donateByStars = (amount: number) => {
		makeRequest(async () => {
			const { url } = await getDonationInvoice(amount);

			invoice.openUrl(url).then((status) => {
				if (status === "paid") {
					syncCharacter();
					popup.info({ message: "Пожертвование успешно отправлено!" });
				}
				if (status === "cancelled" || status === "failed") {
					popup.info({ message: "Что-то пошло не так" });
				}
			});
		});
	};

	return {
		donateByStars,
		loading,
	};
};
