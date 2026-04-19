import { settingsButton } from "@tma.js/sdk-react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router";
import { useMountEffect } from "@/hooks/useMountEffect";

export function withSettingsButton(Component: ComponentType) {
	return () => {
		const navigate = useNavigate();
		const toSettings = () => navigate("/settings");

		useMountEffect(() => {
			if (settingsButton.isSupported()) {
				settingsButton.mount();
				settingsButton.show();
				settingsButton.onClick(toSettings);

				return () => {
					settingsButton.hide();
					settingsButton.offClick(toSettings);
				};
			}
		});

		return <Component />;
	};
}
