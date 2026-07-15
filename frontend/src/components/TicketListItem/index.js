import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";

import { styled } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@mui/material";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const StyledListItem = styled(ListItem, {
	shouldForwardProp: prop => prop !== "pending",
})(({ pending }) => ({
	position: "relative",
	...(pending && { cursor: "unset" }),
}));

const ContactNameWrapper = styled("span")({
	display: "flex",
	justifyContent: "space-between",
});

const LastMessageTime = styled(Typography)({
	justifySelf: "flex-end",
});

const ClosedBadge = styled(Badge)({
	alignSelf: "center",
	justifySelf: "flex-end",
	marginRight: 32,
	marginLeft: "auto",
});

const ContactLastMessage = styled(Typography)({
	paddingRight: 20,
});

const NewMessagesCount = styled(Badge)({
	"& .MuiBadge-badge": {
		color: "white",
		backgroundColor: green[500],
	},
	alignSelf: "center",
	marginRight: 8,
	marginLeft: "auto",
});

const AcceptButton = styled(ButtonWithSpinner)({
	position: "absolute",
	left: "50%",
});

const TicketQueueColor = styled("span")({
	flex: "none",
	width: "8px",
	height: "100%",
	position: "absolute",
	top: "0%",
	left: "0%",
});

const UserTag = styled("div")({
	position: "absolute",
	marginRight: 5,
	right: 5,
	bottom: 5,
	background: "#2576D2",
	color: "#ffffff",
	border: "1px solid #CCC",
	padding: 1,
	paddingLeft: 5,
	paddingRight: 5,
	borderRadius: 10,
	fontSize: "0.9em",
});

const TicketListItem = ({ ticket }) => {
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleAcepptTicket = async id => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
	};

	const handleSelectTicket = id => {
		history.push(`/tickets/${id}`);
	};

	return (
		<React.Fragment key={ticket.id}>
			<StyledListItem
				dense
				button
				onClick={e => {
					if (ticket.status === "pending") return;
					handleSelectTicket(ticket.id);
				}}
				selected={ticketId && +ticketId === ticket.id}
				pending={ticket.status === "pending"}
			>
				<Tooltip
					arrow
					placement="right"
					title={ticket.queue?.name || "Sem fila"}
				>
					<TicketQueueColor
						style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
					></TicketQueueColor>
				</Tooltip>
				<ListItemAvatar>
					<Avatar src={ticket?.contact?.profilePicUrl} />
				</ListItemAvatar>
				<ListItemText
					disableTypography
					primary={
						<ContactNameWrapper>
							<Typography
								noWrap
								component="span"
								variant="body2"
								color="textPrimary"
							>
								{ticket.contact.name}
							</Typography>
							{ticket.status === "closed" && (
								<ClosedBadge badgeContent={"closed"} color="primary" />
							)}
							{ticket.lastMessage && (
								<LastMessageTime
									component="span"
									variant="body2"
									color="textSecondary"
								>
									{isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
										<>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
									) : (
										<>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
									)}
								</LastMessageTime>
							)}
							{ticket.whatsappId && (
								<UserTag title={i18n.t("ticketsList.connectionTitle")}>{ticket.whatsapp?.name}</UserTag>
							)}
						</ContactNameWrapper>
					}
					secondary={
						<ContactNameWrapper>
							<ContactLastMessage
								noWrap
								component="span"
								variant="body2"
								color="textSecondary"
							>
								{ticket.lastMessage ? (
									<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
								) : (
									<br />
								)}
							</ContactLastMessage>

							<NewMessagesCount badgeContent={ticket.unreadMessages} />
						</ContactNameWrapper>
					}
				/>
				{ticket.status === "pending" && (
					<AcceptButton
						color="primary"
						variant="contained"
						size="small"
						loading={loading}
						onClick={e => handleAcepptTicket(ticket.id)}
					>
						{i18n.t("ticketsList.buttons.accept")}
					</AcceptButton>
				)}
			</StyledListItem>
			<Divider variant="inset" component="li" />
		</React.Fragment>
	);
};

export default TicketListItem;
