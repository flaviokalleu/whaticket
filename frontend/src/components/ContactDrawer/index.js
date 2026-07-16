import React, { useState } from "react";
import { X, Phone, Pencil, Mail, CalendarDays, Users2, Radio, Tag as TagIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

import { i18n } from "../../translate/i18n";

import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";

const InfoRow = ({ icon: Icon, label, children }) => (
	<div className="flex items-start gap-2.5 text-sm">
		<Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
		<div className="min-w-0">
			<p className="text-xs text-muted-foreground">{label}</p>
			<div className="truncate font-medium">{children}</div>
		</div>
	</div>
);

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const [modalOpen, setModalOpen] = useState(false);

	const initials = (contact?.name || "?")
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<div
			className={cn(
				"h-full shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out",
				open ? "w-80" : "w-0"
			)}
		>
		<div className="flex h-full w-80 flex-col border-l bg-background">
			<div className="flex min-h-[57px] shrink-0 items-center gap-2 border-b bg-muted/40 px-2">
				<Button variant="ghost" size="icon" onClick={handleDrawerClose}>
					<X className="h-5 w-5" />
				</Button>
				<span className="text-sm font-medium">{i18n.t("contactDrawer.header")}</span>
			</div>

			{loading ? (
				<ContactDrawerSkeleton />
			) : (
				<div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
					<ContactModal
						open={modalOpen}
						onClose={() => setModalOpen(false)}
						contactId={contact.id}
					/>

					{/* Profile card */}
					<div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-6 text-center">
						<Avatar className="h-28 w-28">
							<AvatarImage src={contact.profilePicUrl} alt={contact.name} />
							<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
						</Avatar>
						<p className="text-base font-semibold">{contact.name}</p>
						{contact.isGroup && (
							<Badge variant="secondary" className="gap-1">
								<Users2 className="h-3 w-3" />
								Grupo
							</Badge>
						)}
						<Button
							variant="outline"
							size="sm"
							className="mt-2"
							onClick={() => setModalOpen(true)}
						>
							<Pencil className="h-3.5 w-3.5" />
							{i18n.t("contactDrawer.buttons.edit")}
						</Button>
					</div>

					{/* Contact details */}
					<div className="space-y-3 rounded-xl border bg-card p-4">
						{contact.number && (
							<InfoRow icon={Phone} label="Telefone">
								<a href={`tel:${contact.number}`} className="text-primary hover:underline">
									{contact.number}
								</a>
							</InfoRow>
						)}
						{contact.email && (
							<InfoRow icon={Mail} label="E-mail">
								<a href={`mailto:${contact.email}`} className="text-primary hover:underline">
									{contact.email}
								</a>
							</InfoRow>
						)}
						{contact.createdAt && (
							<InfoRow icon={CalendarDays} label="Cliente desde">
								{format(parseISO(contact.createdAt), "dd/MM/yyyy")}
							</InfoRow>
						)}
					</div>

					{/* Current ticket context */}
					{ticket?.id && (
						<div className="space-y-3 rounded-xl border bg-card p-4">
							<p className="text-sm font-semibold">Atendimento atual</p>
							{ticket.queue && (
								<InfoRow icon={TagIcon} label="Fila">
									<span className="inline-flex items-center gap-1.5">
										<span
											className="h-2 w-2 shrink-0 rounded-full"
											style={{ backgroundColor: ticket.queue.color }}
										/>
										{ticket.queue.name}
									</span>
								</InfoRow>
							)}
							{ticket.whatsapp && (
								<InfoRow icon={Radio} label="Conexão">
									{ticket.whatsapp.name}
								</InfoRow>
							)}
							{ticket.tags?.length > 0 && (
								<div className="flex flex-wrap gap-1.5 pt-1">
									{ticket.tags.map((tag) => (
										<span
											key={tag.id}
											className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
											style={{ backgroundColor: tag.color }}
										>
											{tag.name}
										</span>
									))}
								</div>
							)}
						</div>
					)}

					{contact?.extraInfo?.length > 0 && (
						<div className="rounded-xl border bg-card p-4">
							<p className="mb-2 text-sm font-semibold">
								{i18n.t("contactDrawer.extraInfo")}
							</p>
							<div className="space-y-2">
								{contact.extraInfo.map((info) => (
									<div key={info.id} className="rounded-lg border bg-muted/40 p-2.5">
										<p className="text-xs font-medium text-muted-foreground">
											{info.name}
										</p>
										<div className="truncate pt-0.5 text-sm">
											<MarkdownWrapper>{info.value}</MarkdownWrapper>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
		</div>
	);
};

export default ContactDrawer;
