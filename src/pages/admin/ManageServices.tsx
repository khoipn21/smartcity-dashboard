import { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

interface City {
	id: number;
	name: string;
	country: string;
	description?: string;
}

const ManageServices = () => {
	const [cities, setCities] = useState<City[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const navigate = useNavigate();

	const fetchCities = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get("/api/cities");
			setCities(response.data);
			setError("");
		} catch (err) {
			console.error("Error fetching cities:", err);
			setError("Failed to load cities.");
			toast.error("Failed to load cities.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCities();
	}, []);

	const handleCityClick = (cityId: number) => {
		navigate(`/admin/services/${cityId}`);
	};

	const filteredCities = cities.filter((city) =>
		city.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold mb-4">Manage Services by City</h1>
				<Link
					to="/admin/all-services"
					className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-dark transition-colors bg-primary text-white">
					<span>Manage All Services</span>
				</Link>
			</div>

			<input
				type="text"
				placeholder="Search cities..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="w-full max-w-md mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
			/>

			{loading ? (
				<p>Loading cities...</p>
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredCities.map((city) => (
						<div
							key={city.id}
							className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => handleCityClick(city.id)}>
							<h2 className="text-xl font-semibold">{city.name}</h2>
							<p className="text-gray-600">{city.country}</p>
							<p className="mt-2 text-sm text-gray-500">{city.description}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ManageServices;
