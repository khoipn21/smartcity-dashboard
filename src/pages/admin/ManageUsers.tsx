import { useEffect, useState } from "react";
import axiosInstance from "@api/axiosInstance";
import { toast } from "react-toastify";

interface User {
	id: number;
	username: string;
	email: string;
	fullName: string;
	role: string;
}

type SortDirection = "asc" | "desc";

const ManageUsers = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const ITEMS_PER_PAGE = 10;

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get("/api/account/users");
			setUsers(response.data);
			setError("");
		} catch (err) {
			console.error("Error fetching users:", err);
			setError("Failed to load users.");
			toast.error("Failed to load users.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleRoleChange = async (username: string, newRole: string) => {
		try {
			await axiosInstance.put("/api/account/role", { username, role: newRole });
			toast.success(`Role for ${username} updated to ${newRole}.`);
			// Update the local state
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.username === username ? { ...user, role: newRole } : user,
				),
			);
		} catch (err) {
			console.error("Error updating role:", err);
			toast.error("Failed to update role.");
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1); // Reset to first page on new search
	};

	const handleSort = (column: keyof User) => {
		if (sortColumn === column) {
			// Toggle sort direction
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const sortedUsers = [...users].sort((a, b) => {
		if (!sortColumn) return 0;
		const aValue = a[sortColumn];
		const bValue = b[sortColumn];

		if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
		if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	const filteredUsers = sortedUsers.filter((user) =>
		user.username.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (loading) {
		return <div className="text-center mt-8">Loading users...</div>;
	}

	if (error) {
		return <div className="text-center text-red-500 mt-8">{error}</div>;
	}

	const getSortIndicator = (column: keyof User) => {
		if (sortColumn === column) {
			return sortDirection === "asc" ? " ▲" : " ▼";
		}
		return "";
	};

	return (
		<div>
			<h1 className="text-2xl mb-4">Manage Users</h1>
			<div className="flex justify-between mb-4">
				<input
					type="text"
					placeholder="Search users..."
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
								className="py-3 px-6 text-left cursor-pointer"
								onClick={() => handleSort("id")}>
								ID{getSortIndicator("id")}
							</th>
							<th
								className="py-3 px-6 text-left cursor-pointer"
								onClick={() => handleSort("username")}>
								Username{getSortIndicator("username")}
							</th>
							<th
								className="py-3 px-6 text-left cursor-pointer"
								onClick={() => handleSort("fullName")}>
								Full Name{getSortIndicator("fullName")}
							</th>
							<th
								className="py-3 px-6 text-left cursor-pointer"
								onClick={() => handleSort("email")}>
								Email{getSortIndicator("email")}
							</th>
							<th
								className="py-3 px-6 text-left cursor-pointer"
								onClick={() => handleSort("role")}>
								Role{getSortIndicator("role")}
							</th>
						</tr>
					</thead>
					<tbody>
						{paginatedUsers.map((user) => (
							<tr
								key={user.username}
								className="border-b hover:bg-gray-50">
								<td className="py-4 px-6">{user.id}</td>
								<td className="py-4 px-6">{user.username}</td>
								<td className="py-4 px-6">{user.fullName}</td>
								<td className="py-4 px-6">{user.email}</td>
								<td className="py-4 px-6">
									<select
										value={user.role}
										onChange={(e) =>
											handleRoleChange(user.username, e.target.value)
										}
										className="border border-gray-300 rounded p-1">
										<option value="ROLE_USER">User</option>
										<option value="ROLE_ADMIN">Admin</option>
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
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
											? "text-gray-400 bg-white border border-gray-300 cursor-not-allowed"
											: "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
									} rounded-l-lg`}>
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
													? "text-blue-600 bg-blue-50 border border-blue-300"
													: "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
											}`}>
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
											? "text-gray-400 bg-white border border-gray-300 cursor-not-allowed"
											: "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
									} rounded-r-lg`}>
									Next
								</button>
							</li>
						</ul>
					</nav>
				</div>
			)}
		</div>
	);
};

export default ManageUsers;
