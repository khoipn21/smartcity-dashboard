import React from "react";

interface ChartSelectorProps {
	timeRange: string;
	chartType: string;
	onTimeRangeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	onChartTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ChartSelector: React.FC<ChartSelectorProps> = ({
	timeRange,
	chartType,
	onTimeRangeChange,
	onChartTypeChange,
}) => {
	return (
		<div className="flex items-center gap-4 mb-6">
			<div>
				<label className="block text-gray-700 mb-2">Time Range:</label>
				<select
					value={timeRange}
					onChange={onTimeRangeChange}
					className="px-4 py-2 border rounded">
					<option value="month">Month</option>
					<option value="quarter">Quarter</option>
					<option value="year">Year</option>
				</select>
			</div>

			<div>
				<label className="block text-gray-700 mb-2">Chart Type:</label>
				<select
					value={chartType}
					onChange={onChartTypeChange}
					className="px-4 py-2 border rounded">
					<option value="line">Line Chart</option>
					<option value="pie">Pie Chart</option>
				</select>
			</div>
		</div>
	);
};

export default ChartSelector;
