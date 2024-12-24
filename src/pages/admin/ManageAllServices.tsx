import React, { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import OperatingHoursSelector from "@components/OperatingHoursSelector";

interface Service {
	id: number;
	name: string;
	description: string;
	address: string;
	contactInfo: string;
	operatingHours: string;
	categoryId: number;
	cityId: number;
	imageUrls: string[];
	categoryName: string;
	cityName: string;
}

interface ServiceCategory {
	id: number;
	name: string;
	description?: string;
}

interface City {
	id: number;
	name: string;
	country: string;
	description?: string;
}

interface SortState {
	column: keyof Service | null;
	direction: "asc" | "desc";
}

const ManageAllServices = () => {
	const [services, setServices] = useState<Service[]>([]);
	const [categories, setCategories] = useState<ServiceCategory[]>([]);
	const [cities, setCities] = useState<City[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [currentService, setCurrentService] = useState<Service | null>(null);
	const [editFormData, setEditFormData] = useState<
		Omit<Service, "id" | "cityId" | "imageUrls" | "categoryName" | "cityName">
	>({
		name: "",
		description: "",
		address: "",
		contactInfo: "",
		operatingHours: "",
		categoryId: 0,
	});
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [sortStates, setSortStates] = useState<{
		[cityName: string]: SortState;
	}>({});
	const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
	const [addFormData, setAddFormData] = useState<{
		name: string;
		description: string;
		address: string;
		contactInfo: string;
		operatingHours: string;
		categoryId: number;
		cityId: number;
	}>({
		name: "",
		description: "",
		address: "",
		contactInfo: "",
		operatingHours: "",
		categoryId: 0,
		cityId: 0,
	});
	const [addSelectedImages, setAddSelectedImages] = useState<File[]>([]);

	useEffect(() => {
		fetchAllServices();
		fetchCategories();
		fetchCities();
	}, []);

	const fetchAllServices = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get("/api/allservices");
			setServices(response.data);
			setError("");
		} catch (err) {
			console.error("Error fetching all services:", err);
			setError("Failed to load services.");
			toast.error("Failed to load services.");
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const response = await axiosInstance.get("/api/service-categories");
			setCategories(response.data);
		} catch (err) {
			console.error("Error fetching service categories:", err);
			toast.error("Failed to load service categories.");
		}
	};

	const fetchCities = async () => {
		try {
			const response = await axiosInstance.get("/api/cities");
			setCities(response.data);
		} catch (err) {
			console.error("Error fetching cities:", err);
			toast.error("Failed to load cities.");
		}
	};

	const handleEditChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setEditFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentService) return;

		const formData = new FormData();
		formData.append("name", editFormData.name);
		formData.append("description", editFormData.description);
		formData.append("address", editFormData.address);
		formData.append("contactInfo", editFormData.contactInfo);
		formData.append("operatingHours", editFormData.operatingHours);
		formData.append("categoryId", editFormData.categoryId.toString());

		// Append images to delete
		imagesToDelete.forEach((filename) => {
			formData.append("imagesToDelete", filename);
		});

		// Append new images if any
		selectedImages.forEach((image) => {
			formData.append("images", image);
		});

		try {
			await axiosInstance.put(
				`/api/cities/${currentService.cityId}/services/${currentService.id}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);
			toast.success(`Service "${editFormData.name}" updated successfully.`);
			fetchAllServices();
			setIsEditModalOpen(false);
			setCurrentService(null);
			setEditFormData({
				name: "",
				description: "",
				address: "",
				contactInfo: "",
				operatingHours: "",
				categoryId: 0,
			});
			setSelectedImages([]);
			setImagesToDelete([]);
		} catch (err) {
			console.error("Error updating service:", err);
			toast.error("Failed to update service.");
		}
	};

	const openEditModal = (service: Service) => {
		setCurrentService(service);
		setEditFormData({
			name: service.name,
			description: service.description,
			address: service.address,
			contactInfo: service.contactInfo,
			operatingHours: service.operatingHours,
			categoryId: service.categoryId,
		});
		setImagesToDelete([]);
		setSelectedImages([]);
		setIsEditModalOpen(true);
	};

	const handleDeleteService = async (serviceId: number, cityId: number) => {
		if (!window.confirm("Are you sure you want to delete this service?")) {
			return;
		}

		try {
			await axiosInstance.delete(`/api/cities/${cityId}/services/${serviceId}`);
			toast.success("Service deleted successfully.");
			fetchAllServices();
		} catch (err) {
			console.error("Error deleting service:", err);
			toast.error("Failed to delete service.");
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setSelectedImages(Array.from(e.target.files));
		}
	};

	const handleImageDelete = (filename: string) => {
		setImagesToDelete((prev) => [...prev, filename]);

		if (currentService) {
			setCurrentService({
				...currentService,
				imageUrls: currentService.imageUrls.filter((img) => img !== filename),
			});
		}
	};

	const handleImageRestore = (filename: string) => {
		setImagesToDelete((prev) => prev.filter((img) => img !== filename));
		if (currentService) {
			setCurrentService({
				...currentService,
				imageUrls: [...currentService.imageUrls, filename],
			});
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleSort = (cityName: string, column: keyof Service) => {
		setSortStates((prevStates) => {
			const currentState = prevStates[cityName] || {
				column: null,
				direction: "asc",
			};
			return {
				...prevStates,
				[cityName]: {
					column,
					direction:
						currentState.column === column && currentState.direction === "asc"
							? "desc"
							: "asc",
				},
			};
		});
	};

	const getSortIndicator = (cityName: string, column: keyof Service) => {
		const sortState = sortStates[cityName];
		if (sortState?.column === column) {
			return sortState.direction === "asc" ? " ▲" : " ▼";
		}
		return "";
	};

	const servicesByCity: { [key: string]: Service[] } = {};
	services.forEach((service) => {
		if (!servicesByCity[service.cityName]) {
			servicesByCity[service.cityName] = [];
		}
		servicesByCity[service.cityName].push(service);
	});

	const filteredAndSortedServicesByCity: { [key: string]: Service[] } = {};
	Object.keys(servicesByCity).forEach((cityName) => {
		const cityServices = servicesByCity[cityName].filter((service) =>
			service.name.toLowerCase().includes(searchTerm.toLowerCase()),
		);

		const sortState = sortStates[cityName];
		if (sortState?.column) {
			cityServices.sort((a, b) => {
				const aValue = a[sortState.column!];
				const bValue = b[sortState.column!];

				if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
				if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
				return 0;
			});
		}

		filteredAndSortedServicesByCity[cityName] = cityServices;
	});

	const handleAddChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setAddFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append("name", addFormData.name);
		formData.append("description", addFormData.description);
		formData.append("address", addFormData.address);
		formData.append("contactInfo", addFormData.contactInfo);
		formData.append("operatingHours", addFormData.operatingHours);
		formData.append("categoryId", addFormData.categoryId.toString());
		formData.append("cityId", addFormData.cityId.toString());

		// Append images if any
		addSelectedImages.forEach((image) => {
			formData.append("images", image);
		});

		try {
			await axiosInstance.post(
				`/api/cities/${addFormData.cityId}/services`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);
			toast.success(`Service "${addFormData.name}" added successfully.`);
			fetchAllServices();
			setIsAddModalOpen(false);
			setAddFormData({
				name: "",
				description: "",
				address: "",
				contactInfo: "",
				operatingHours: "",
				categoryId: 0,
				cityId: 0,
			});
			setAddSelectedImages([]);
		} catch (err) {
			console.error("Error adding service:", err);
			toast.error("Failed to add service.");
		}
	};

	const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAddSelectedImages(Array.from(e.target.files));
		}
	};

	const handlePreviewImages = (isAdd: boolean = false) => {
		const images = isAdd ? addSelectedImages : selectedImages;
		return images.map((file) => {
			const imageUrl = URL.createObjectURL(file);
			return (
				<div
					key={file.name}
					className="relative">
					<img
						src={imageUrl}
						alt="Preview"
						className="w-24 h-24 object-cover rounded"
						onLoad={() => URL.revokeObjectURL(imageUrl)}
					/>
					<div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm">
						+
					</div>
					<button
						type="button"
						onClick={() => {
							if (isAdd) {
								setAddSelectedImages(
									addSelectedImages.filter((img) => img !== file),
								);
							} else {
								setSelectedImages(selectedImages.filter((img) => img !== file));
							}
						}}
						className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
						&times;
					</button>
				</div>
			);
		});
	};

	return (
		<div className="p-6">
			<Link
				to="/admin/services"
				className="text-blue-500 hover:underline mb-4 inline-block">
				&larr; Back to Services Management
			</Link>
			<h1 className="text-2xl font-bold mb-4">Manage All Services</h1>
			<div className="flex justify-between items-center">
				<button
					onClick={() => setIsAddModalOpen(true)}
					className="mb-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
					Add New Service
				</button>
				{/* Search Bar */}
				<div className="mb-4 w-1/3">
					<input
						type="text"
						placeholder="Search services..."
						value={searchTerm}
						onChange={handleSearchChange}
						className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			</div>

			{loading ? (
				<p>Loading services...</p>
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : services.length === 0 ? (
				<p>No services available.</p>
			) : (
				<div>
					{/* Services Grouped by City */}
					{Object.keys(filteredAndSortedServicesByCity).map((cityName) => (
						<div
							key={cityName}
							className="mb-8">
							<h2 className="text-xl font-semibold mb-2">{cityName}</h2>
							<div className="overflow-x-auto">
								<table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
									<thead className="bg-primary text-white">
										<tr>
											<th
												className="py-3 px-6 cursor-pointer w-20 text-center whitespace-nowrap"
												onClick={() => handleSort(cityName, "id")}>
												ID{getSortIndicator(cityName, "id")}
											</th>
											<th
												className="py-3 px-6 cursor-pointer w-48 text-center whitespace-nowrap"
												onClick={() => handleSort(cityName, "name")}>
												Name{getSortIndicator(cityName, "name")}
											</th>
											<th
												className="py-3 px-6 cursor-pointer w-96 text-center whitespace-nowrap"
												onClick={() => handleSort(cityName, "description")}>
												Description{getSortIndicator(cityName, "description")}
											</th>
											<th className="py-3 px-6 w-32 text-center whitespace-nowrap">
												Image
											</th>
											<th
												className="py-3 px-6 cursor-pointer w-64 text-center whitespace-nowrap"
												onClick={() => handleSort(cityName, "address")}>
												Address{getSortIndicator(cityName, "address")}
											</th>
											<th
												className="py-3 px-6 cursor-pointer w-48 text-center whitespace-nowrap"
												onClick={() => handleSort(cityName, "contactInfo")}>
												Contact Info{getSortIndicator(cityName, "contactInfo")}
											</th>
											<th
												className="py-3 px-6 cursor-pointer w-48 text-center whitespace-nowrap"
												onClick={() => handleSort(cityName, "operatingHours")}>
												Operating Hours
												{getSortIndicator(cityName, "operatingHours")}
											</th>
											<th className="py-3 px-6 w-40 text-center whitespace-nowrap">
												Category
											</th>
											<th className="py-3 px-6 w-32 text-center whitespace-nowrap">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredAndSortedServicesByCity[cityName].map(
											(service) => (
												<tr
													key={service.id}
													className="border-b hover:bg-gray-50">
													<td className="py-4 px-6 text-center">
														{service.id}
													</td>
													<td className="py-4 px-6 text-center">
														{service.name}
													</td>
													<td className="py-4 px-6 text-center">
														{service.description}
													</td>
													<td className="py-4 px-6 text-center">
														{service.imageUrls &&
														service.imageUrls.length > 0 ? (
															<img
																src={`${
																	import.meta.env.VITE_API_URL
																}/api/images/${service.imageUrls[0]}`}
																alt={service.name}
																className="w-12 h-12 object-cover rounded"
															/>
														) : (
															<span>None</span>
														)}
													</td>
													<td className="py-4 px-6 text-center">
														{service.address}
													</td>
													<td className="py-4 px-6 text-center">
														{service.contactInfo}
													</td>
													<td className="py-4 px-6 text-center">
														{service.operatingHours}
													</td>
													<td className="py-4 px-6 text-center">
														{service.categoryName}
													</td>
													<td className="py-4 px-6 text-center">
														<div className="flex justify-center">
															<button
																onClick={() => openEditModal(service)}
																className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors mr-2">
																Edit
															</button>
															<button
																onClick={() =>
																	handleDeleteService(
																		service.id,
																		service.cityId,
																	)
																}
																className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
																Delete
															</button>
														</div>
													</td>
												</tr>
											),
										)}
									</tbody>
								</table>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Add Service Modal */}
			{isAddModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 py-6">
					<div className="bg-white p-8 rounded-lg w-full max-w-3xl overflow-y-auto max-h-full">
						<h2 className="text-2xl mb-6">Add New Service</h2>
						<form onSubmit={handleAddSubmit}>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Name</label>
								<input
									type="text"
									name="name"
									value={addFormData.name}
									onChange={handleAddChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Description</label>
								<textarea
									name="description"
									value={addFormData.description}
									onChange={handleAddChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									rows={4}
									required></textarea>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Address</label>
								<input
									type="text"
									name="address"
									value={addFormData.address}
									onChange={handleAddChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Contact Info</label>
								<input
									type="text"
									name="contactInfo"
									value={addFormData.contactInfo}
									onChange={handleAddChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">
									Operating Hours
								</label>
								<OperatingHoursSelector
									value={addFormData.operatingHours}
									onChange={(value) => {
										setAddFormData((prev) => ({
											...prev,
											operatingHours: value,
										}));
									}}
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Category</label>
								<select
									name="categoryId"
									value={addFormData.categoryId}
									onChange={handleAddChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required>
									<option value="">Select Category</option>
									{categories.map((category) => (
										<option
											key={category.id}
											value={category.id}>
											{category.name}
										</option>
									))}
								</select>
							</div>

							{/* New City Selection */}
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">City</label>
								<select
									name="cityId"
									value={addFormData.cityId}
									onChange={handleAddChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required>
									<option value="">Select City</option>
									{cities.map((city) => (
										<option
											key={city.id}
											value={city.id}>
											{city.name}
										</option>
									))}
								</select>
							</div>
							<div className="mb-6">
								<label className="block text-gray-700 mb-2">Images</label>
								<div className="flex flex-wrap gap-4 mb-4">
									{handlePreviewImages(true)}

									<label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary">
										<input
											type="file"
											multiple
											onChange={handleAddImageChange}
											className="hidden"
											accept="image/*"
										/>
										<span className="text-3xl text-gray-400">+</span>
									</label>
								</div>
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors">
									Cancel
								</button>
								<button
									type="submit"
									className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors">
									Add Service
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Service Modal */}
			{isEditModalOpen && currentService && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 py-6">
					<div className="bg-white p-8 rounded-lg w-full max-w-3xl overflow-y-auto max-h-full">
						<h2 className="text-2xl mb-6">Edit Service</h2>
						<form onSubmit={handleEditSubmit}>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Name</label>
								<input
									type="text"
									name="name"
									value={editFormData.name}
									onChange={handleEditChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Description</label>
								<textarea
									name="description"
									value={editFormData.description}
									onChange={handleEditChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									rows={4}
									required></textarea>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Address</label>
								<input
									type="text"
									name="address"
									value={editFormData.address}
									onChange={handleEditChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Contact Info</label>
								<input
									type="text"
									name="contactInfo"
									value={editFormData.contactInfo}
									onChange={handleEditChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">
									Operating Hours
								</label>
								<OperatingHoursSelector
									value={editFormData.operatingHours}
									onChange={(value) => {
										setEditFormData((prev) => ({
											...prev,
											operatingHours: value,
										}));
									}}
								/>
							</div>
							<div className="mb-4">
								<label className="block text-gray-700 mb-2">Category</label>
								<select
									name="categoryId"
									value={editFormData.categoryId}
									onChange={handleEditChange}
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
									required>
									<option value="">Select Category</option>
									{categories.map((category) => (
										<option
											key={category.id}
											value={category.id}>
											{category.name}
										</option>
									))}
								</select>
							</div>
							<div className="mb-6">
								<label className="block text-gray-700 mb-2">Images</label>
								<div className="flex flex-wrap gap-4 mb-4">
									{currentService.imageUrls.map((filename) => (
										<div
											key={filename}
											className="relative">
											<img
												src={`${
													import.meta.env.VITE_API_URL
												}/api/images/${filename}`}
												alt={currentService.name}
												className="w-24 h-24 object-cover rounded"
											/>
											<button
												type="button"
												onClick={() => handleImageDelete(filename)}
												className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
												&times;
											</button>
										</div>
									))}

									{imagesToDelete.map((filename) => (
										<div
											key={filename}
											className="relative opacity-50">
											<img
												src={`${
													import.meta.env.VITE_API_URL
												}/api/images/${filename}`}
												alt="Marked for deletion"
												className="w-24 h-24 object-cover rounded"
											/>
											<button
												type="button"
												onClick={() => handleImageRestore(filename)}
												className="absolute top-0 right-0 bg-yellow-500 text-white rounded-full p-1 hover:bg-yellow-600">
												↺
											</button>
										</div>
									))}

									{handlePreviewImages()}

									<label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary">
										<input
											type="file"
											multiple
											onChange={handleImageChange}
											className="hidden"
											accept="image/*"
										/>
										<span className="text-3xl text-gray-400">+</span>
									</label>
								</div>
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors">
									Cancel
								</button>
								<button
									type="submit"
									className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors">
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManageAllServices;
