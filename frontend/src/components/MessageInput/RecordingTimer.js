import React, { useState, useEffect } from "react";

const RecordingTimer = () => {
	const initialState = {
		minutes: 0,
		seconds: 0,
	};
	const [timer, setTimer] = useState(initialState);

	useEffect(() => {
		const interval = setInterval(
			() =>
				setTimer(prevState => {
					if (prevState.seconds === 59) {
						return { ...prevState, minutes: prevState.minutes + 1, seconds: 0 };
					}
					return { ...prevState, seconds: prevState.seconds + 1 };
				}),
			1000
		);
		return () => {
			clearInterval(interval);
		};
	}, []);

	const addZero = n => {
		return n < 10 ? "0" + n : n;
	};

	return (
		<div className="mx-2.5 flex items-center gap-1.5 text-sm font-medium">
			<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
			{`${addZero(timer.minutes)}:${addZero(timer.seconds)}`}
		</div>
	);
};

export default RecordingTimer;
