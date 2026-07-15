import React from "react";
import { styled } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { i18n } from "../../translate/i18n";

const Content = styled("div")(({ theme }) => ({
	display: "flex",
	backgroundColor: "#eee",
	flexDirection: "column",
	padding: "8px 0px 8px 8px",
	height: "100%",
	overflowY: "scroll",
	...theme.scrollbarStyles,
}));

const ContactHeader = styled(Paper)(() => ({
	display: "flex",
	padding: 8,
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	"& > *": {
		margin: 4,
	},
}));

const ContactDetails = styled(Paper)(() => ({
	marginTop: 8,
	padding: 8,
	display: "flex",
	flexDirection: "column",
}));

const ContactExtraInfo = styled(Paper)(() => ({
	marginTop: 4,
	padding: 6,
}));

const AvatarSkeleton = styled(Skeleton)(() => ({
	margin: 15,
	width: 160,
	height: 160,
}));

const ContactDrawerSkeleton = () => {
	return (
		<Content>
			<ContactHeader square variant="outlined">
				<AvatarSkeleton animation="wave" variant="circular" width={160} height={160} />
				<Skeleton animation="wave" height={25} width={90} />
				<Skeleton animation="wave" height={25} width={80} />
				<Skeleton animation="wave" height={25} width={80} />
			</ContactHeader>
			<ContactDetails square>
				<Typography variant="subtitle1">
					{i18n.t("contactDrawer.extraInfo")}
				</Typography>
				<ContactExtraInfo square variant="outlined">
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</ContactExtraInfo>
				<ContactExtraInfo square variant="outlined">
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</ContactExtraInfo>
				<ContactExtraInfo square variant="outlined">
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</ContactExtraInfo>
			</ContactDetails>
		</Content>
	);
};

export default ContactDrawerSkeleton;
