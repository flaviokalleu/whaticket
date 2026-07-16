import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { Loader2, Smartphone, MoreVertical, Link2, ScanLine } from "lucide-react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import { Dialog, DialogContent } from "../ui/dialog";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const steps = [
	{ icon: Smartphone, text: "Abra o WhatsApp no seu celular" },
	{ icon: MoreVertical, text: "Toque em Menu ou Configurações" },
	{ icon: Link2, text: 'Toque em "Aparelhos conectados" e depois "Conectar um aparelho"' },
	{ icon: ScanLine, text: "Aponte a câmera para o QR Code ao lado" },
];

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
	const [qrCode, setQrCode] = useState("");

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				setQrCode(data.qrcode);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on("whatsappSession", (data) => {
			if (data.action === "update" && data.session.id === whatsAppId) {
				setQrCode(data.session.qrcode);
			}

			if (data.action === "update" && data.session.qrcode === "") {
				onClose();
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [whatsAppId, onClose]);

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
				<div className="grid sm:grid-cols-2">
					{/* Instructions */}
					<div className="space-y-6 p-8">
						<div>
							<h2 className="text-lg font-bold tracking-tight">
								{i18n.t("qrCode.message")}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Escaneie o código para conectar seu número.
							</p>
						</div>
						<ol className="space-y-4">
							{steps.map((step, index) => (
								<li key={index} className="flex items-start gap-3">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<step.icon className="h-4 w-4" />
									</span>
									<span className="pt-1.5 text-sm leading-snug text-foreground">
										{step.text}
									</span>
								</li>
							))}
						</ol>
					</div>

					{/* QR code panel */}
					<div className="flex flex-col items-center justify-center gap-4 bg-muted/40 p-8">
						<div className="relative flex h-72 w-72 items-center justify-center rounded-2xl border bg-background p-4 shadow-sm">
							{/* corner accents */}
							<span className="absolute left-2 top-2 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-primary" />
							<span className="absolute right-2 top-2 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-primary" />
							<span className="absolute bottom-2 left-2 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-primary" />
							<span className="absolute bottom-2 right-2 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-primary" />

							{qrCode ? (
								<QRCode value={qrCode} size={224} />
							) : (
								<div className="flex flex-col items-center gap-3 text-muted-foreground">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<span className="text-sm">Gerando QR Code…</span>
								</div>
							)}
						</div>
						<p className="text-center text-xs text-muted-foreground">
							O código expira e é renovado automaticamente
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(QrcodeModal);
