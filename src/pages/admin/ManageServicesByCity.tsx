import { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import { toast } from "react-toastify";
import { useParams, Link } from "react-router-dom";
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
}

interface City {
	id: number;
	name: string;
	country: string;
}

interface ServiceCategory {
	id: number;
	name: string;
	description?: string;
}

const ManageServicesByCity = () => {
	const { cityId } = useParams<{ cityId: string }>();
	const [services, setServices] = useState<Service[]>([]);
	const [categories, setCategories] = useState<ServiceCategory[]>([]);
	const [city, setCity] = useState<City | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [currentService, setCurrentService] = useState<Service | null>(null);
	const [addFormData, setAddFormData] = useState<
		Omit<Service, "id" | "cityId" | "imageUrls">
	>({
		name: "",
		description: "",
		address: "",
		contactInfo: "",
		operatingHours: "",
		categoryId: 0,
	});
	const [editFormData, setEditFormData] = useState<
		Omit<Service, "id" | "cityId" | "imageUrls">
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
	const [sortColumn, setSortColumn] = useState<keyof Service | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const fetchCity = async () => {
		try {
			const response = await axiosInstance.get(`/api/cities/${cityId}`);
			setCity(response.data);
		} catch (err) {
			console.error("Error fetching city details:", err);
			setError("Failed to load city details.");
			toast.error("Failed to load city details.");
		}
	};

	const fetchServices = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get(
				`/api/cities/${cityId}/services`,
			);
			setServices(response.data);
			setError("");
		} catch (err) {
			console.error("Error fetching services:", err);
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

	useEffect(() => {
		if (cityId) {
			fetchCity();
			fetchServices();
			fetchCategories();
		}
	}, [cityId]);

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

	const handleAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append("name", addFormData.name);
		formData.append("description", addFormData.description);
		formData.append("address", addFormData.address);
		formData.append("contactInfo", addFormData.contactInfo);
		formData.append("operatingHours", addFormData.operatingHours);
		formData.append("categoryId", addFormData.categoryId.toString());

		// Append images if any
		selectedImages.forEach((image) => {
			formData.append("images", image);
		});

		try {
			await axiosInstance.post(`/api/cities/${cityId}/services`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			toast.success(`Service "${addFormData.name}" added successfully.`);
			fetchServices();
			setIsAddModalOpen(false);
			setAddFormData({
				name: "",
				description: "",
				address: "",
				contactInfo: "",
				operatingHours: "",
				categoryId: 0,
			});
			setSelectedImages([]); // Clear selected images
		} catch (err) {
			console.error("Error adding service:", err);
			toast.error("Failed to add service.");
		}
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
				`/api/cities/${cityId}/services/${currentService.id}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);
			toast.success(`Service "${editFormData.name}" updated successfully.`);
			fetchServices();
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

	const getCategoryName = (categoryId: number): string => {
		const category = categories.find((cat) => cat.id === categoryId);
		return category ? category.name : "Unknown Category";
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setSelectedImages(Array.from(e.target.files));
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

	const handleDeleteService = async (serviceId: number) => {
		if (!window.confirm("Are you sure you want to delete this service?")) {
			return;
		}

		try {
			await axiosInstance.delete(`/api/cities/${cityId}/services/${serviceId}`);
			toast.success("Service deleted successfully.");
			fetchServices();
		} catch (err) {
			console.error("Error deleting service:", err);
			toast.error("Failed to delete service.");
		}
	};

	const handleImageDelete = (filename: string) => {
		// Add the filename to the imagesToDelete array
		setImagesToDelete((prev) => [...prev, filename]);

		// Remove the filename from the currentService.imageUrls array to update the UI
		if (currentService) {
			setCurrentService({
				...currentService,
				imageUrls: currentService.imageUrls.filter((img) => img !== filename),
			});
		}
	};

	// Optional: Handle restoring an image marked for deletion
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

	const handleSort = (column: keyof Service) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const getSortIndicator = (column: keyof Service) => {
		if (sortColumn === column) {
			return sortDirection === "asc" ? " ▲" : " ▼";
		}
		return "";
	};

	const sortedServices = [...services].sort((a, b) => {
		if (!sortColumn) return 0;
		const aValue = a[sortColumn];
		const bValue = b[sortColumn];

		if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
		if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	const filteredServices = sortedServices.filter((service) =>
		service.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handlePreviewImages = () => {
		return selectedImages.map((file) => {
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
						onClick={() =>
							setSelectedImages(selectedImages.filter((img) => img !== file))
						}
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
				&larr; Back to Cities
			</Link>
			<h1 className="text-2xl font-bold mb-4">
				Manage Services for {city ? city.name : "City"}
			</h1>
			<button
				onClick={() => setIsAddModalOpen(true)}
				className="mb-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
				Add New Service
			</button>
			{loading ? (
				<p>Loading services...</p>
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : services.length === 0 ? (
				<p>No services available for this city.</p>
			) : (
				<div>
					{/* Search Bar */}
					<div className="mb-4">
						<input
							type="text"
							placeholder="Search services..."
							value={searchTerm}
							onChange={handleSearchChange}
							className="w-1/3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
							<thead className="bg-primary text-white">
								<tr>
									<th
										className="py-3 px-6 cursor-pointer w-20 text-center whitespace-nowrap"
										onClick={() => handleSort("id")}>
										ID{getSortIndicator("id")}
									</th>
									<th
										className="py-3 px-6 cursor-pointer w-48 text-center whitespace-nowrap"
										onClick={() => handleSort("name")}>
										Name{getSortIndicator("name")}
									</th>
									<th
										className="py-3 px-6 cursor-pointer w-96 text-center whitespace-nowrap"
										onClick={() => handleSort("description")}>
										Description{getSortIndicator("description")}
									</th>
									<th className="py-3 px-6 w-32 text-center whitespace-nowrap">
										Image
									</th>
									<th
										className="py-3 px-6 cursor-pointer w-64 text-center whitespace-nowrap"
										onClick={() => handleSort("address")}>
										Address{getSortIndicator("address")}
									</th>
									<th
										className="py-3 px-6 cursor-pointer w-48 text-center whitespace-nowrap"
										onClick={() => handleSort("contactInfo")}>
										Contact Info{getSortIndicator("contactInfo")}
									</th>
									<th
										className="py-3 px-6 cursor-pointer w-48 text-center whitespace-nowrap"
										onClick={() => handleSort("operatingHours")}>
										Operating Hours{getSortIndicator("operatingHours")}
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
								{filteredServices.map((service) => (
									<tr
										key={service.id}
										className="border-b hover:bg-gray-50">
										<td className="py-4 px-6">{service.id}</td>
										<td className="py-4 px-6">{service.name}</td>
										<td className="py-4 px-6">{service.description}</td>
										<td className="py-4 px-6">
											{service.imageUrls && service.imageUrls.length > 0 ? (
												<img
													src={`${import.meta.env.VITE_API_URL}/api/images/${
														service.imageUrls[0]
													}`}
													alt={service.name}
													className="w-12 h-12 object-cover rounded"
												/>
											) : (
												<span>None</span>
											)}
										</td>
										<td className="py-4 px-6">{service.address}</td>
										<td className="py-4 px-6">{service.contactInfo}</td>
										<td className="py-4 px-6">{service.operatingHours}</td>
										<td className="py-4 px-6">
											{getCategoryName(service.categoryId)}
										</td>
										<td className="py-4 px-6">
											<div className="flex justify-center">
												<button
													onClick={() => openEditModal(service)}
													className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors mr-2">
													Edit
												</button>
												<button
													onClick={() => handleDeleteService(service.id)}
													className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
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
							<div className="mb-6">
								<label className="block text-gray-700 mb-2">Images</label>
								<div className="flex flex-wrap gap-4 mb-4">
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

export default ManageServicesByCity;
