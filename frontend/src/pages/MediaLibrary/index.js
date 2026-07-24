import React, { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import {
	Trash2,
	Upload,
	Loader2,
	FileText,
	FileAudio,
	FileVideo,
	File as FileIcon,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

const mediaIcon = (mediaType) => {
	if (mediaType?.startsWith("video")) {
		return <FileVideo className="h-10 w-10 text-muted-foreground" />;
	}
	if (mediaType?.startsWith("audio")) {
		return <FileAudio className="h-10 w-10 text-muted-foreground" />;
	}
	if (mediaType?.startsWith("application") || mediaType === "document") {
		return <FileText className="h-10 w-10 text-muted-foreground" />;
	}
	return <FileIcon className="h-10 w-10 text-muted-foreground" />;
};

const MediaLibrary = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);

	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [uploadName, setUploadName] = useState("");
	const [uploadFile, setUploadFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef(null);

	const [selectedItem, setSelectedItem] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/media-library");
				setItems(data || []);
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	const handleOpenUploadModal = () => {
		setUploadName("");
		setUploadFile(null);
		setUploadModalOpen(true);
	};

	const handleCloseUploadModal = () => {
		setUploadModalOpen(false);
		setUploadName("");
		setUploadFile(null);
	};

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadFile(file);
		if (!uploadName) {
			setUploadName(file.name);
		}
	};

	const handleUpload = async (e) => {
		e.preventDefault();
		if (!uploadFile) {
			toast.error("Selecione um arquivo.");
			return;
		}
		if (!uploadName.trim()) {
			toast.error("Informe um nome.");
			return;
		}

		const formData = new FormData();
		formData.append("medias", uploadFile);
		formData.append("name", uploadName);

		setUploading(true);
		try {
			const { data } = await api.post("/media-library", formData);
			setItems((prev) => [data, ...prev]);
			toast.success("Arquivo enviado com sucesso!");
			handleCloseUploadModal();
		} catch (err) {
			toastError(err);
		}
		setUploading(false);
	};

	const handleDeleteItem = async (itemId) => {
		try {
			await api.delete(`/media-library/${itemId}`);
			setItems((prev) => prev.filter((item) => item.id !== itemId));
			toast.success("Arquivo excluído com sucesso!");
		} catch (err) {
			toastError(err);
		}
		setSelectedItem(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={selectedItem && `Excluir arquivo ${selectedItem.name}?`}
				open={confirmModalOpen}
				onClose={() => {
					setConfirmModalOpen(false);
					setSelectedItem(null);
				}}
				onConfirm={() => handleDeleteItem(selectedItem.id)}
			>
				Esta ação não pode ser revertida.
			</ConfirmationModal>
			<Dialog
				open={uploadModalOpen}
				onOpenChange={(o) => !o && handleCloseUploadModal()}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Enviar arquivo</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpload} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="mediaName">Nome</Label>
							<Input
								id="mediaName"
								value={uploadName}
								onChange={(e) => setUploadName(e.target.value)}
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="mediaFile">Arquivo</Label>
							<Input
								id="mediaFile"
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleCloseUploadModal}
								disabled={uploading}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={uploading}>
								{uploading && <Loader2 className="h-4 w-4 animate-spin" />}
								Enviar
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			<MainHeader>
				<Title>Biblioteca de mídias</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenUploadModal}>
						<Upload className="h-4 w-4" />
						Enviar arquivo
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				{loading ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{[...Array(8)].map((_, i) => (
							<Skeleton key={i} className="h-40 rounded-xl" />
						))}
					</div>
				) : items.length === 0 ? (
					<p className="py-10 text-center text-sm text-muted-foreground">
						Nenhum arquivo na biblioteca
					</p>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{items.map((item) => (
							<Card key={item.id} className="overflow-hidden">
								<div className="flex h-28 items-center justify-center bg-muted">
									{item.mediaType?.startsWith("image") ? (
										<img
											src={`${getBackendUrl()}/public/${item.mediaUrl}`}
											alt={item.name}
											className="h-full w-full object-cover"
										/>
									) : (
										mediaIcon(item.mediaType)
									)}
								</div>
								<CardContent className="flex items-center justify-between gap-2 p-3">
									<span className="truncate text-sm font-medium" title={item.name}>
										{item.name}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
										onClick={() => {
											setSelectedItem(item);
											setConfirmModalOpen(true);
										}}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</MainContainer>
	);
};

export default MediaLibrary;
