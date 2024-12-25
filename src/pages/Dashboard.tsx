import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { logout } from "@api/auth";
import { useAuthStore } from "@store/authStore";
import { FaTreeCity } from "react-icons/fa6";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { RiLandscapeFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";

import ManageCities from "@pages/admin/ManageCities";
import ManageServiceCategories from "@pages/admin/ManageServiceCategories";
import ManageUsers from "@pages/admin/ManageUsers";
import ManageServices from "@pages/admin/ManageServices";
import ManageServicesByCity from "./admin/ManageServicesByCity";
import ManageAllServices from "./admin/ManageAllServices";
import Statistics from "./admin/Statistics";

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
			<nav className="w-full md:w-64 bg-primary-dark text-white p-6 md:sticky md:top-0 md:h-screen overflow-y-auto">
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
								<FaUser className="w-4 h-4" />
								Manage Users
							</Link>
						</li>
						<li className="mb-4">
							<Link
								to="/admin/services"
								className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-light transition-colors">
								<RiLandscapeFill className="w-4 h-4" />
								<span>Manage Services</span>
							</Link>
						</li>
						{/* <li className="mb-4">
							<Link
								to="/admin/all-services"
								className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-light transition-colors">
								<FaTools className="w-4 h-4" />
								<span>Manage All Services</span>
							</Link>
						</li> */}
						<li className="mb-4">
							<Link
								to="/admin/statistics"
								className="flex items-center gap-2 px-4 py-2 rounded hover:bg-primary-light transition-colors">
								<FaChartLine className="w-4 h-4" />
								<span>Statistics</span>
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
					<Route
						path="services"
						element={<ManageServices />}
					/>
					<Route
						path="services/:cityId"
						element={<ManageServicesByCity />}
					/>
					<Route
						path="all-services"
						element={<ManageAllServices />}
					/>
					<Route
						path="statistics"
						element={<Statistics />}
					/>
				</Routes>
			</main>
		</div>
	);
};

export default Dashboard;
