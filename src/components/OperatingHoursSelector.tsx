import React, { useState, useEffect } from "react";

interface OperatingHoursSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

const OperatingHoursSelector: React.FC<OperatingHoursSelectorProps> = ({
	value,
	onChange,
}) => {
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [startTime, setStartTime] = useState("09:00");
	const [endTime, setEndTime] = useState("17:00");

	const daysOptions = [
		{ value: "Mon", label: "Monday" },
		{ value: "Tue", label: "Tuesday" },
		{ value: "Wed", label: "Wednesday" },
		{ value: "Thu", label: "Thursday" },
		{ value: "Fri", label: "Friday" },
		{ value: "Sat", label: "Saturday" },
		{ value: "Sun", label: "Sunday" },
	];

	const timeOptions = Array.from({ length: 15 }, (_, i) => {
		const hour = i + 7; // Starting from 7 AM
		return `${hour.toString().padStart(2, "0")}:00`;
	});

	// Parse initial value
	useEffect(() => {
		if (value) {
			try {
				// Expected format: "Mon-Fri: 09:00-17:00"
				const [days, times] = value.split(": ");
				const [start, end] = times.split("-");
				const dayRange = days.split("-");

				if (dayRange.length === 2) {
					const startIdx = daysOptions.findIndex(
						(d) => d.value === dayRange[0],
					);
					const endIdx = daysOptions.findIndex((d) => d.value === dayRange[1]);
					const selectedDays = daysOptions
						.slice(startIdx, endIdx + 1)
						.map((d) => d.value);
					setSelectedDays(selectedDays);
				}

				setStartTime(start);
				setEndTime(end);
			} catch (error) {
				console.error("Error parsing operating hours:", error);
			}
		}
	}, [value]);

	const handleDayToggle = (day: string) => {
		setSelectedDays((prev) => {
			if (prev.includes(day)) {
				return prev.filter((d) => d !== day);
			} else {
				return [...prev, day].sort(
					(a, b) =>
						daysOptions.findIndex((d) => d.value === a) -
						daysOptions.findIndex((d) => d.value === b),
				);
			}
		});
	};

	useEffect(() => {
		if (selectedDays.length > 0) {
			let formattedDays = "";
			if (selectedDays.length === 1) {
				formattedDays = selectedDays[0];
			} else {
				formattedDays = `${selectedDays[0]}-${
					selectedDays[selectedDays.length - 1]
				}`;
			}
			const formattedValue = `${formattedDays}: ${startTime}-${endTime}`;
			onChange(formattedValue);
		}
	}, [selectedDays, startTime, endTime, onChange]);

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">
					Select Days
				</label>
				<div className="flex flex-wrap gap-2">
					{daysOptions.map((day) => (
						<button
							key={day.value}
							type="button"
							onClick={() => handleDayToggle(day.value)}
							className={`px-3 py-1 rounded ${
								selectedDays.includes(day.value)
									? "bg-primary text-white"
									: "bg-gray-200 text-gray-700"
							}`}>
							{day.value}
						</button>
					))}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Opening Time
					</label>
					<select
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
						{timeOptions.map((time) => (
							<option
								key={time}
								value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Closing Time
					</label>
					<select
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
						{timeOptions.map((time) => (
							<option
								key={time}
								value={time}>
								{time}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="mt-2 text-sm text-gray-500">
				Current Schedule:{" "}
				{selectedDays.length > 0
					? `${selectedDays[0]}-${
							selectedDays[selectedDays.length - 1]
					  }: ${startTime}-${endTime}`
					: "No schedule set"}
			</div>
		</div>
	);
};

export default OperatingHoursSelector;
