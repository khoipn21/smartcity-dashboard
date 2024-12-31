import ServiceChart from "./ServiceChart";
import CityChart from "./CityChart";

const Statistics = () => {
	return (
		<div className="p-6">
			<h1 className="text-3xl font-bold mb-6">Statistics Dashboard</h1>

			{/* Service Section */}
			<section className="mb-12">
				<h2 className="text-2xl font-semibold mb-4">Service Foot Traffic</h2>
				<ServiceChart />
			</section>

			{/* City Section */}
			<section>
				<h2 className="text-2xl font-semibold mb-4">City-Based Statistics</h2>
				<CityChart />
			</section>
		</div>
	);
};

export default Statistics;
