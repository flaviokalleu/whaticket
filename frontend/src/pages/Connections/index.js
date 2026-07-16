import React, { useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
	Pencil,
	Trash2,
	CheckCircle2,
	QrCode,
	WifiOff,
	Wifi,
	Loader2,
	AlertTriangle,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/table";
import { Card } from "../../components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../../components/ui/tooltip";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

const CustomToolTip = ({ title, content, children }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent className="max-w-[280px] text-center">
					<p className="font-medium">{title}</p>
					{content && <p className="text-muted-foreground">{content}</p>}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const Connections = () => {
	const { whatsApps, loading } = useContext(WhatsAppsContext);
	const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
	const [qrModalOpen, setQrModalOpen] = useState(false);
	const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const confirmationModalInitialState = {
		action: "",
		title: "",
		message: "",
		whatsAppId: "",
		open: false,
	};
	const [confirmModalInfo, setConfirmModalInfo] = useState(
		confirmationModalInitialState
	);

	const handleStartWhatsAppSession = async (whatsAppId) => {
		try {
			await api.post(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleRequestNewQrCode = async (whatsAppId) => {
		try {
			await api.put(`/whatsappsession/${whatsAppId}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenWhatsAppModal = () => {
		setSelectedWhatsApp(null);
		setWhatsAppModalOpen(true);
	};

	const handleCloseWhatsAppModal = useCallback(() => {
		setWhatsAppModalOpen(false);
		setSelectedWhatsApp(null);
	}, []);

	const handleOpenQrModal = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setQrModalOpen(true);
	};

	const handleCloseQrModal = useCallback(() => {
		setSelectedWhatsApp(null);
		setQrModalOpen(false);
	}, []);

	const handleEditWhatsApp = (whatsApp) => {
		setSelectedWhatsApp(whatsApp);
		setWhatsAppModalOpen(true);
	};

	const handleOpenConfirmationModal = (action, whatsAppId) => {
		if (action === "disconnect") {
			setConfirmModalInfo({
				action,
				title: i18n.t("connections.confirmationModal.disconnectTitle"),
				message: i18n.t("connections.confirmationModal.disconnectMessage"),
				whatsAppId,
			});
		}

		if (action === "delete") {
			setConfirmModalInfo({
				action,
				title: i18n.t("connections.confirmationModal.deleteTitle"),
				message: i18n.t("connections.confirmationModal.deleteMessage"),
				whatsAppId,
			});
		}
		setConfirmModalOpen(true);
	};

	const handleSubmitConfirmationModal = async () => {
		if (confirmModalInfo.action === "disconnect") {
			try {
				await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
			} catch (err) {
				toastError(err);
			}
		}

		if (confirmModalInfo.action === "delete") {
			try {
				await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
				toast.success(i18n.t("connections.toasts.deleted"));
			} catch (err) {
				toastError(err);
			}
		}

		setConfirmModalInfo(confirmationModalInitialState);
	};

	const renderActionButtons = (whatsApp) => {
		return (
			<div className="flex flex-wrap items-center gap-2">
				{whatsApp.status === "qrcode" && (
					<Button size="sm" onClick={() => handleOpenQrModal(whatsApp)}>
						{i18n.t("connections.buttons.qrcode")}
					</Button>
				)}
				{whatsApp.status === "DISCONNECTED" && (
					<>
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleStartWhatsAppSession(whatsApp.id)}
						>
							{i18n.t("connections.buttons.tryAgain")}
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleRequestNewQrCode(whatsApp.id)}
						>
							{i18n.t("connections.buttons.newQr")}
						</Button>
					</>
				)}
				{(whatsApp.status === "CONNECTED" ||
					whatsApp.status === "PAIRING" ||
					whatsApp.status === "TIMEOUT") && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => handleOpenConfirmationModal("disconnect", whatsApp.id)}
					>
						{i18n.t("connections.buttons.disconnect")}
					</Button>
				)}
				{whatsApp.status === "OPENING" && (
					<Button size="sm" variant="outline" disabled>
						{i18n.t("connections.buttons.connecting")}
					</Button>
				)}
			</div>
		);
	};

	const renderStatusToolTips = (whatsApp) => {
		return (
			<div className="flex items-center justify-center">
				{whatsApp.status === "DISCONNECTED" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.disconnected.title")}
						content={i18n.t("connections.toolTips.disconnected.content")}
					>
						<WifiOff className="h-5 w-5 text-muted-foreground" />
					</CustomToolTip>
				)}
				{whatsApp.status === "OPENING" && (
					<Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
				)}
				{whatsApp.status === "qrcode" && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.qrcode.title")}
						content={i18n.t("connections.toolTips.qrcode.content")}
					>
						<QrCode className="h-5 w-5 text-primary" />
					</CustomToolTip>
				)}
				{whatsApp.status === "CONNECTED" && (
					<CustomToolTip title={i18n.t("connections.toolTips.connected.title")}>
						<Wifi className="h-5 w-5 text-emerald-500" />
					</CustomToolTip>
				)}
				{(whatsApp.status === "TIMEOUT" || whatsApp.status === "PAIRING") && (
					<CustomToolTip
						title={i18n.t("connections.toolTips.timeout.title")}
						content={i18n.t("connections.toolTips.timeout.content")}
					>
						<AlertTriangle className="h-5 w-5 text-amber-500" />
					</CustomToolTip>
				)}
			</div>
		);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={confirmModalInfo.title}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={handleSubmitConfirmationModal}
			>
				{confirmModalInfo.message}
			</ConfirmationModal>
			<QrcodeModal
				open={qrModalOpen}
				onClose={handleCloseQrModal}
				whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
			/>
			<WhatsAppModal
				open={whatsAppModalOpen}
				onClose={handleCloseWhatsAppModal}
				whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
			/>
			<MainHeader>
				<Title>{i18n.t("connections.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenWhatsAppModal}>
						{i18n.t("connections.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<Card className="border-none shadow-sm">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="text-center">
									{i18n.t("connections.table.name")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("connections.table.status")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("connections.table.session")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("connections.table.lastUpdate")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("connections.table.default")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("connections.table.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRowSkeleton columns={6} />
							) : (
								whatsApps?.length > 0 &&
								whatsApps.map((whatsApp) => (
									<TableRow key={whatsApp.id}>
										<TableCell className="text-center font-medium">
											{whatsApp.name}
										</TableCell>
										<TableCell className="text-center">
											{renderStatusToolTips(whatsApp)}
										</TableCell>
										<TableCell className="text-center">
											{renderActionButtons(whatsApp)}
										</TableCell>
										<TableCell className="text-center text-sm text-muted-foreground">
											{format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
										</TableCell>
										<TableCell className="text-center">
											{whatsApp.isDefault && (
												<div className="flex items-center justify-center">
													<CheckCircle2 className="h-5 w-5 text-emerald-500" />
												</div>
											)}
										</TableCell>
										<TableCell className="text-center">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEditWhatsApp(whatsApp)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleOpenConfirmationModal("delete", whatsApp.id)
													}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</Card>
			</div>
		</MainContainer>
	);
};

export default Connections;
