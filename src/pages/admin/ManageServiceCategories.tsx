import { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import { toast } from "react-toastify";

interface ServiceCategory {
	id: number;
	name: string;
	description: string;
}

const ManageServiceCategories = () => {
	const [categories, setCategories] = useState<ServiceCategory[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	// State for handling the edit modal
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [currentCategory, setCurrentCategory] =
		useState<ServiceCategory | null>(null);
	const [editFormData, setEditFormData] = useState<ServiceCategory>({
		id: 0,
		name: "",
		description: "",
	});

	// State for handling the add modal
	const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
	const [addFormData, setAddFormData] = useState<Omit<ServiceCategory, "id">>({
		name: "",
		description: "",
	});

	// State for pagination and search
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchTerm, setSearchTerm] = useState<string>("");

	const ITEMS_PER_PAGE = 10;

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get("/api/service-categories"); // Ensure the correct endpoint
			setCategories(response.data);
			setError("");
		} catch (err) {
			console.error("Error fetching service categories:", err);
			setError("Failed to load service categories.");
			toast.error("Failed to load service categories.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const openEditModal = (category: ServiceCategory) => {
		setCurrentCategory(category);
		setEditFormData(category);
		setIsEditModalOpen(true);
	};

	const closeEditModal = () => {
		setIsEditModalOpen(false);
		setCurrentCategory(null);
		setEditFormData({
			id: 0,
			name: "",
			description: "",
		});
	};

	const handleEditChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setEditFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await axiosInstance.put(
				`/api/service-categories/${editFormData.id}`,
				editFormData,
			); // Ensure the correct endpoint
			toast.success(
				`Service Category "${editFormData.name}" updated successfully.`,
			);
			setCategories((prevCategories) =>
				prevCategories.map((category) =>
					category.id === editFormData.id ? editFormData : category,
				),
			);
			closeEditModal();
		} catch (err) {
			console.error("Error updating service category:", err);
			toast.error("Failed to update service category.");
		}
	};

	// Handlers for Add New Category
	const openAddModal = () => {
		setIsAddModalOpen(true);
	};

	const closeAddModal = () => {
		setIsAddModalOpen(false);
		setAddFormData({
			name: "",
			description: "",
		});
	};

	const handleAddChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setAddFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await axiosInstance.post(
				"/api/service-categories",
				addFormData,
			);
			toast.success(
				`Service Category "${response.data.name}" added successfully.`,
			);
			setCategories((prevCategories) => [response.data, ...prevCategories]);
			closeAddModal();
		} catch (err) {
			console.error("Error adding service category:", err);
			toast.error("Failed to add service category.");
		}
	};

	// Handlers for Search
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1); // Reset to first page on new search
	};

	// Filtered and Paginated Categories
	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
	const paginatedCategories = filteredCategories.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (loading) {
		return (
			<div className="text-center mt-8">Loading service categories...</div>
		);
	}

	if (error) {
		return <div className="text-center text-red-500 mt-8">{error}</div>;
	}

	return (
		<div>
			<h1 className="text-2xl mb-4">Manage Service Categories</h1>

			{/* Add New Category Button */}
			<div className="flex justify-between items-center mb-4">
				<button
					onClick={openAddModal}
					className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
					Add New Category
				</button>

				{/* Search Bar */}
				<input
					type="text"
					placeholder="Search categories..."
					value={searchTerm}
					onChange={handleSearchChange}
					className="w-1/3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
					<thead className="bg-primary text-white">
						<tr>
							<th className="py-3 px-6 text-left">ID</th>
							<th className="py-3 px-6 text-left">Name</th>
							<th className="py-3 px-6 text-left">Description</th>
							<th className="py-3 px-6 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{paginatedCategories.map((category) => (
							<tr
								key={category.id}
								className="border-b hover:bg-gray-50">
								<td className="py-4 px-6">{category.id}</td>
								<td className="py-4 px-6">{category.name}</td>
								<td className="py-4 px-6">{category.description}</td>
								<td className="py-4 px-6">
									<button
										onClick={() => openEditModal(category)}
										className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
										Edit
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex justify-center mt-4">
					<nav>
						<ul className="inline-flex -space-x-px">
							<li>
								<button
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									className={`px-3 py-2 ml-0 leading-tight ${
										currentPage === 1
											? "text-gray-400 cursor-not-allowed"
											: "text-primary hover:bg-primary-light"
									} border border-gray-300 rounded-l-lg`}>
									Previous
								</button>
							</li>
							{Array.from({ length: totalPages }, (_, index) => index + 1).map(
								(page) => (
									<li key={page}>
										<button
											onClick={() => handlePageChange(page)}
											className={`px-3 py-2 leading-tight ${
												currentPage === page
													? "text-white bg-primary"
													: "text-primary hover:bg-primary-light"
											} border border-gray-300`}>
											{page}
										</button>
									</li>
								),
							)}
							<li>
								<button
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									className={`px-3 py-2 leading-tight ${
										currentPage === totalPages
											? "text-gray-400 cursor-not-allowed"
											: "text-primary hover:bg-primary-light"
									} border border-gray-300 rounded-r-lg`}>
									Next
								</button>
							</li>
						</ul>
					</nav>
				</div>
			)}

			{/* Edit Modal */}
			{isEditModalOpen && currentCategory && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2">
						<h2 className="text-xl mb-4">Edit Service Category</h2>
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
							<div className="flex justify-end">
								<button
									type="button"
									onClick={closeEditModal}
									className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors">
									Cancel
								</button>
								<button
									type="submit"
									className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add Modal */}
			{isAddModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2">
						<h2 className="text-xl mb-4">Add New Service Category</h2>
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
							<div className="flex justify-end">
								<button
									type="button"
									onClick={closeAddModal}
									className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors">
									Cancel
								</button>
								<button
									type="submit"
									className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors">
									Add Category
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManageServiceCategories;
