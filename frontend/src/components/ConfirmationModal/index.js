import React from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";

import { i18n } from "../../translate/i18n";

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	return (
		<Dialog open={open} onOpenChange={() => onClose(false)}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-muted-foreground">{children}</p>
				<DialogFooter>
					<Button variant="outline" onClick={() => onClose(false)}>
						{i18n.t("confirmationModal.buttons.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							onClose(false);
							onConfirm();
						}}
					>
						{i18n.t("confirmationModal.buttons.confirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
