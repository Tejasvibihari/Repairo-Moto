import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BarChart3, Calendar } from 'lucide-react';
import axiosClient from '../service/axiosClient';

const OrderChart = () => {
    const [timeFrame, setTimeFrame] = useState("year");
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const chartRef = useRef();

    const getAllLabels = () => {
        if (timeFrame === "month") {
            // Days 1-31 with "Date " prefix to match API format
            return Array.from({ length: 31 }, (_, i) => `Date ${i + 1}`);
        } else {
            // Full month names to match API format
            return [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
        }
    };

    const normalizeData = (rawData) => {
        const labels = getAllLabels();
        const dataMap = new Map(rawData.map(d => [d.label, d.count]));
        return labels.map(label => ({
            label,
            count: dataMap.get(label) || 0
        }));
    };

    useEffect(() => {
        fetchData();
    }, [timeFrame]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            console.log(`Fetching data for timeFrame: ${timeFrame}`);
            const res = await axiosClient.get(`/api/admin/order/orderstatus/completed-orders?timeFrame=${timeFrame}`);
            // console.log("API response:", res.data);
            const normalized = normalizeData(res.data);
            // console.log("Normalized data:", normalized);
            setData(normalized);
            setIsLoading(false);
        } catch (error) {
            console.error("Fetch error", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (data.length > 0) drawChart();
    }, [data]);

    const drawChart = () => {
        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 40, right: 30, bottom: 80, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const chart = svg
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add chart title
        chart.append("text")
            .attr("x", width / 2)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(timeFrame === "year" ? "Monthly Orders This Year" : "Daily Orders This Month");

        // Custom color palette - modern and cohesive
        const customColors = timeFrame === "year"
            ? [
                "#4361ee", "#3a0ca3", "#7209b7", "#f72585",
                "#4cc9f0", "#4895ef", "#560bad", "#b5179e",
                "#480ca8", "#3f37c9", "#4895ef", "#4cc9f0"
            ]
            : Array(31).fill().map((_, i) => {
                // Generate a gradient of blues for days of month
                return d3.interpolateBlues(0.3 + (i / 31) * 0.7);
            });

        const x = d3
            .scaleBand()
            .domain(data.map(d => d.label))
            .range([0, width])
            .padding(0.2);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.count) * 1.2])
            .nice()
            .range([height, 0]);

        // Add Y grid lines
        chart.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(y)
                    .tickSize(-width)
                    .tickFormat("")
            )
            .style("stroke", "#e0e0e0")
            .style("stroke-opacity", 0.7);

        // Add X axis
        chart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#555")
            .text(d => {
                // For monthly view, strip "Date " prefix for display
                if (timeFrame === "month" && d.startsWith("Date ")) {
                    return d.replace("Date ", "");
                }
                return d;
            });

        // Add Y axis with proper formatting
        chart.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d))
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#555");

        // Bars with gradient and animation
        const bars = chart
            .selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("width", x.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .style("fill", (d, i) => customColors[i % customColors.length])
            .style("filter", "drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.1))");

        // Animation for bars
        bars.transition()
            .duration(800)
            .delay((d, i) => i * 50)
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count));

        // Add value labels on top of bars
        chart.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .style("display", d => d.count === 0 ? "none" : "block")
            .attr("x", d => x(d.label) + x.bandwidth() / 2)
            .attr("y", d => y(d.count) - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("fill", "#333")
            .style("font-weight", "bold")
            .text(d => d.count);

        // Add X axis label
        chart.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#555")
            .text(timeFrame === "year" ? "Month" : "Day");

        // Add Y axis label
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#555")
            .text("Number of Orders");
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BarChart3 className="mr-2" size={24} />
                    Completed Orders
                </h2>

                <div className="flex items-center bg-gray-100 rounded-lg p-2">
                    <Calendar className="text-gray-500 mr-2" size={18} />
                    <select
                        value={timeFrame}
                        onChange={e => setTimeFrame(e.target.value)}
                        className="bg-transparent border-none text-gray-700 font-medium focus:outline-none cursor-pointer"
                    >
                        <option value="year">Current Year</option>
                        <option value="month">Current Month</option>
                    </select>
                </div>
            </div>

            <div className="relative">
                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <svg ref={chartRef} className="w-full"></svg>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-500 text-center">
                {timeFrame === "year"
                    ? "Monthly distribution of completed orders in the current year"
                    : "Daily distribution of completed orders in the current month"}
            </div>
        </div>
    );
};

export default OrderChart;