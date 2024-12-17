import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	return (
		<>
			<ToastContainer />
			<Router>
				<Routes>
					<Route
						path="/"
						element={
							isAuthenticated ? (
								<Navigate
									to="/admin"
									replace
								/>
							) : (
								<Navigate
									to="/login"
									replace
								/>
							)
						}
					/>

					<Route
						path="/login"
						element={
							isAuthenticated ? (
								<Navigate
									to="/admin"
									replace
								/>
							) : (
								<LoginPage />
							)
						}
					/>

					<Route
						path="/admin/*"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>

					<Route
						path="*"
						element={
							<Navigate
								to="/"
								replace
							/>
						}
					/>
				</Routes>
			</Router>
		</>
	);
}

export default App;
