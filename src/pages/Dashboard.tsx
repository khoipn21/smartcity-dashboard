import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { logout } from "@api/auth";
import { useAuthStore } from "@store/authStore";
import { FaTreeCity } from "react-icons/fa6";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";

import ManageCities from "@pages/admin/ManageCities";
import ManageServiceCategories from "@pages/admin/ManageServiceCategories";
import ManageUsers from "@pages/admin/ManageUsers";

const Dashboard = () => {
	const setToken = useAuthStore((state) => state.setToken);
	const navigate = useNavigate();
	const role = useAuthStore((state) => state.role);

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout failed", error);
		} finally {
			setToken(null);
			navigate("/login");
		}
	};

	return (
		<div className="flex flex-col md:flex-row min-h-screen">
			<nav className="w-full md:w-64 bg-primary-dark text-white p-6">
				<h2 className="text-4xl mb-4 font-black font-merienda">SMART CITY</h2>
				{role === "ROLE_ADMIN" && (
					<ul>
						<li className="mb-4">
							<Link
								to="/admin/cities"
								className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-light transition-colors">
								<FaTreeCity className="w-4 h-4" />
								Manage Cities
							</Link>
						</li>
						<li className="mb-4">
							<Link
								to="/admin/service-categories"
								className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-light transition-colors">
								<BiSolidCategoryAlt className="w-4 h-4" />
								Manage Categories
							</Link>
						</li>
						<li className="mb-4">
							<Link
								to="/admin/users"
								className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-light transition-colors">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5V4H2v16h5m10-8a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
								Manage Users
							</Link>
						</li>
					</ul>
				)}
				<ul className="mt-8">
					<li>
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 w-full text-left px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition-colors">
							<CiLogout className="w-4 h-4" />
							Logout
						</button>
					</li>
				</ul>
			</nav>
			<main className="flex-1 p-8 bg-gray-100">
				<Routes>
					<Route
						path="cities"
						element={<ManageCities />}
					/>
					<Route
						path="service-categories"
						element={<ManageServiceCategories />}
					/>
					<Route
						path="users"
						element={<ManageUsers />}
					/>
				</Routes>
			</main>
		</div>
	);
};

export default Dashboard;
