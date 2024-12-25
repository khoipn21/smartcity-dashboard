import React, { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	ArcElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import ChartSelector from "../../components/ChartSelector";

ChartJS.register(
	CategoryScale,
	LinearScale,
	ArcElement,
	LineElement,
	PointElement,
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

interface City {
	id: number;
	name: string;
	country: string;
}

interface Service {
	id: number;
	name: string;
}

const CityChart: React.FC = () => {
	const [cities, setCities] = useState<City[]>([]);
	const [selectedCity, setSelectedCity] = useState<number | null>(null);
	const [visitData, setVisitData] = useState<VisitServiceResponse[]>([]);
	const [timeRange, setTimeRange] = useState<string>("month");
	const [chartType, setChartType] = useState<string>("line");

	useEffect(() => {
		// Fetch all cities to populate the selection dropdown
		const fetchCities = async () => {
			try {
				const response = await axiosInstance.get("/api/cities");
				setCities(response.data);
				if (response.data.length > 0) {
					setSelectedCity(response.data[0].id);
				}
			} catch (error) {
				console.error("Error fetching cities:", error);
			}
		};

		fetchCities();
	}, []);

	useEffect(() => {
		if (selectedCity !== null) {
			const fetchServices = async () => {
				try {
					const response = await axiosInstance.get(
						`/api/cities/${selectedCity}/services`,
					);
					const services = response.data;

					// Fetch visits for each service
					const visitPromises = services.map(async (service: Service) => {
						try {
							const res = await axiosInstance.get<VisitServiceResponse>(
								`/api/services/${service.id}/visits`,
							);
							return res.data.listVisit;
						} catch (error) {
							console.error(
								`Error fetching visits for service ${service.id}:`,
								error,
							);
							return [];
						}
					});

					const visitsArrays = await Promise.all(visitPromises);
					// Flatten the array of arrays
					const allVisits = visitsArrays.flat();

					setVisitData([
						{
							averageRating: 0, // Not used for aggregation
							listVisit: allVisits,
						},
					]);
				} catch (error) {
					console.error("Error fetching services for city:", error);
				}
			};

			fetchServices();
		}
	}, [selectedCity]);

	const processData = () => {
		if (visitData.length === 0) return { labels: [], data: [] };

		const visits = visitData[0].listVisit.map((v) => parseISO(v.visitDate));

		const grouped: { [key: string]: number } = {};

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
					backgroundColor: "rgba(153, 102, 255, 0.5)",
					borderColor: "rgba(153, 102, 255, 1)",
					borderWidth: 1,
				},
			],
		};
	};

	const pieChartData = () => {
		if (visitData.length === 0) return { labels: [], datasets: [] };

		// Aggregate visits per service
		const serviceMap: { [serviceName: string]: number } = {};
		visitData[0].listVisit.forEach((visit) => {
			serviceMap[visit.serviceName] = (serviceMap[visit.serviceName] || 0) + 1;
		});

		const labels = Object.keys(serviceMap);
		const data = Object.values(serviceMap);
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
				<label className="block text-gray-700 mb-2">Select City:</label>
				<select
					value={selectedCity || ""}
					onChange={(e) => setSelectedCity(Number(e.target.value))}
					className="px-4 py-2 border rounded">
					{cities.map((city) => (
						<option
							key={city.id}
							value={city.id}>
							{city.name}
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
								title: { display: true, text: "City Foot Traffic Over Time" },
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

export default CityChart;
