import React, { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import ChartSelector from "../../components/ChartSelector";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
);

interface VisitResponse {
	id: number;
	userId: number;
	userName: string;
	serviceId: number;
	serviceName: string;
	visitDate: string;
}

interface VisitServiceResponse {
	averageRating: number;
	listVisit: VisitResponse[];
}

const ServiceChart: React.FC = () => {
	const [services, setServices] = useState<{ id: number; name: string }[]>([]);
	const [selectedService, setSelectedService] = useState<number | null>(null);
	const [visitData, setVisitData] = useState<VisitServiceResponse | null>(null);
	const [timeRange, setTimeRange] = useState<string>("month");
	const [chartType, setChartType] = useState<string>("line");

	useEffect(() => {
		// Fetch all services to populate the selection dropdown
		const fetchServices = async () => {
			try {
				const response = await axiosInstance.get("/api/allservices");
				setServices(response.data);
				if (response.data.length > 0) {
					setSelectedService(response.data[0].id);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
			}
		};

		fetchServices();
	}, []);

	useEffect(() => {
		if (selectedService !== null) {
			const fetchVisits = async () => {
				try {
					const response = await axiosInstance.get<VisitServiceResponse>(
						`/api/services/${selectedService}/visits`,
					);
					setVisitData(response.data);
				} catch (error) {
					console.error("Error fetching visits:", error);
				}
			};

			fetchVisits();
		}
	}, [selectedService]);

	const processData = () => {
		if (!visitData) return { labels: [], data: [] };

		const visits = visitData.listVisit.map((v) => parseISO(v.visitDate));

		let grouped: { [key: string]: number } = {};

		visits.forEach((date) => {
			let key = "";
			if (timeRange === "month") {
				key = format(date, "MMMM yyyy"); // e.g., January 2024
			} else if (timeRange === "quarter") {
				const quarter = Math.floor((date.getMonth() + 3) / 3);
				key = `Q${quarter} ${format(date, "yyyy")}`; // e.g., Q1 2024
			} else if (timeRange === "year") {
				key = format(date, "yyyy"); // e.g., 2024
			}

			grouped[key] = (grouped[key] || 0) + 1;
		});

		const labels = Object.keys(grouped).sort((a, b) => {
			// Sort labels chronologically
			const dateA = new Date(a);
			const dateB = new Date(b);
			return dateA.getTime() - dateB.getTime();
		});

		const data = labels.map((label) => grouped[label]);

		return { labels, data };
	};

	const chartData = () => {
		const { labels, data } = processData();
		return {
			labels,
			datasets: [
				{
					label: "Number of Visits",
					data,
					backgroundColor: "rgba(75, 192, 192, 0.5)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 1,
				},
			],
		};
	};

	const pieChartData = () => {
		const { labels, data } = processData();
		const backgroundColors = labels.map(
			(_, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`,
		);

		return {
			labels,
			datasets: [
				{
					data,
					backgroundColor: backgroundColors,
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		};
	};

	return (
		<div>
			<div className="mb-4">
				<label className="block text-gray-700 mb-2">Select Service:</label>
				<select
					value={selectedService || ""}
					onChange={(e) => setSelectedService(Number(e.target.value))}
					className="px-4 py-2 border rounded">
					{services.map((service) => (
						<option
							key={service.id}
							value={service.id}>
							{service.name}
						</option>
					))}
				</select>
			</div>

			<ChartSelector
				timeRange={timeRange}
				chartType={chartType}
				onTimeRangeChange={(e) => setTimeRange(e.target.value)}
				onChartTypeChange={(e) => setChartType(e.target.value)}
			/>

			{chartType === "line" ? (
				<div className="w-3/4 mx-auto">
					<Line
						data={chartData()}
						options={{
							responsive: true,
							maintainAspectRatio: true,
							plugins: {
								legend: { position: "top" },
								title: { display: true, text: "Service Foot Traffic" },
							},
						}}
					/>
				</div>
			) : (
				<div className="w-2/3 mx-auto">
					<Pie
						data={pieChartData()}
						options={{
							responsive: true,
							maintainAspectRatio: true,
							plugins: {
								legend: { position: "right" },
								title: {
									display: true,
									text: "Service Foot Traffic Distribution",
								},
							},
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default ServiceChart;
