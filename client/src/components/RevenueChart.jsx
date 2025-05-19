import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp, Calendar, DollarSign, IndianRupee } from 'lucide-react';
import axiosClient from '../service/axiosClient';

const RevenueChart = () => {
    const [timeFrame, setTimeFrame] = useState("year");
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const chartRef = useRef();

    const getLabels = () => {
        if (timeFrame === 'month') {
            return Array.from({ length: 31 }, (_, i) => `Date ${i + 1}`);
        } else if (timeFrame === 'last6') {
            const now = new Date();
            return Array.from({ length: 6 }, (_, i) => {
                const date = new Date(now.getFullYear(), now.getMonth() - 5 + i);
                return date.toLocaleString('default', { month: 'long' });
            });
        } else {
            return [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
        }
    };

    const normalizeData = (raw) => {
        const labels = getLabels();
        const map = new Map(raw.map(d => [d.label, d.revenue]));
        return labels.map(label => ({
            label,
            revenue: map.get(label) || 0
        }));
    };

    useEffect(() => {
        fetchData();
    }, [timeFrame]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get(`/api/admin/order/orderstatus/revenue?timeFrame=${timeFrame}`);
            console.log("Revenue API response:", res.data);
            const normalized = normalizeData(res.data);
            console.log("Normalized revenue data:", normalized);
            setData(normalized);
            setIsLoading(false);
        } catch (err) {
            console.error("Revenue Fetch Error", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (data.length > 0) drawChart();
    }, [data]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getChartTitle = () => {
        if (timeFrame === 'month') {
            return "Daily Revenue This Month";
        } else if (timeFrame === 'last6') {
            return "Revenue - Last 6 Months";
        } else {
            return "Monthly Revenue This Year";
        }
    };

    const getTotalRevenue = () => {
        return data.reduce((sum, item) => sum + item.revenue, 0);
    };

    const getAverageRevenue = () => {
        const nonZeroItems = data.filter(item => item.revenue > 0);
        if (nonZeroItems.length === 0) return 0;
        return getTotalRevenue() / nonZeroItems.length;
    };

    const drawChart = () => {
        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 40, right: 60, bottom: 80, left: 70 };
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
            .text(getChartTitle());

        // Define gradient for the area
        const gradient = chart.append("defs")
            .append("linearGradient")
            .attr("id", "area-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#3b82f6")
            .attr("stop-opacity", 0.8);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#3b82f6")
            .attr("stop-opacity", 0);

        const x = d3.scalePoint()
            .domain(data.map(d => d.label))
            .range([0, width])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.revenue) * 1.2])
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

        // Add Y axis with currency formatting
        chart.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatCurrency(d)))
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#555");

        // Add X axis label
        chart.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#555")
            .text(timeFrame === "month" ? "Day" : "Month");

        // Add Y axis label
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#555")
            .text("Revenue");

        // Create area for the chart
        const area = d3.area()
            .x(d => x(d.label))
            .y0(height)
            .y1(d => y(d.revenue))
            .curve(d3.curveMonotoneX);

        // Create line for the chart
        const line = d3.line()
            .x(d => x(d.label))
            .y(d => y(d.revenue))
            .curve(d3.curveMonotoneX);

        // Add area path
        chart.append("path")
            .datum(data)
            .attr("fill", "url(#area-gradient)")
            .attr("d", area);

        // Add line path with animation
        const path = chart.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#2563eb")
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);

        // Animation for the line
        const totalLength = path.node().getTotalLength();
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1500)
            .attr("stroke-dashoffset", 0);

        // Add circles for data points
        chart.selectAll(".data-circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "data-circle")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.revenue))
            .attr("r", 0)
            .attr("fill", "#2563eb")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .style("opacity", d => d.revenue > 0 ? 1 : 0)
            .transition()
            .delay((d, i) => i * 100)
            .duration(500)
            .attr("r", 6);

        // Add tooltips for data points
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("box-shadow", "0 1px 3px rgba(0,0,0,0.2)")
            .style("opacity", 0)
            .style("pointer-events", "none");

        chart.selectAll(".hover-target")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "hover-target")
            .attr("cx", d => x(d.label))
            .attr("cy", d => y(d.revenue))
            .attr("r", 15)
            .attr("fill", "transparent")
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

                const displayLabel = timeFrame === "month" && d.label.startsWith("Date ")
                    ? d.label.replace("Date ", "Day ")
                    : d.label;

                tooltip.html(`
                    <div style="font-weight: bold;">${displayLabel}</div>
                    <div>${formatCurrency(d.revenue)}</div>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");

                d3.select(this.parentNode)
                    .select(`.data-circle[cx='${x(d.label)}'][cy='${y(d.revenue)}']`)
                    .transition()
                    .duration(200)
                    .attr("r", 8);
            })
            .on("mouseout", function (event, d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);

                d3.select(this.parentNode)
                    .select(`.data-circle[cx='${x(d.label)}'][cy='${y(d.revenue)}']`)
                    .transition()
                    .duration(200)
                    .attr("r", 6);
            });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <TrendingUp className="mr-2 text-blue-600" size={24} />
                    Revenue Overview
                </h2>

                <div className="flex items-center bg-gray-100 rounded-lg p-2">
                    <Calendar className="text-gray-500 mr-2" size={18} />
                    <select
                        value={timeFrame}
                        onChange={e => setTimeFrame(e.target.value)}
                        className="bg-transparent border-none text-gray-700 font-medium focus:outline-none cursor-pointer"
                    >
                        <option value="year">Current Year</option>
                        <option value="last6">Last 6 Months</option>
                        <option value="month">Current Month</option>
                    </select>
                </div>
            </div>

            {!isLoading && data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                        <div className="bg-blue-100 rounded-full p-3 mr-4">
                            <IndianRupee className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-xl font-bold text-gray-800">{formatCurrency(getTotalRevenue())}</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                        <div className="bg-blue-100 rounded-full p-3 mr-4">
                            <TrendingUp className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Average {timeFrame === "month" ? "Daily" : "Monthly"} Revenue</p>
                            <p className="text-xl font-bold text-gray-800">{formatCurrency(getAverageRevenue())}</p>
                        </div>
                    </div>
                </div>
            )}

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
                    ? "Monthly revenue distribution in the current year"
                    : timeFrame === "last6"
                        ? "Revenue distribution over the last 6 months"
                        : "Daily revenue distribution in the current month"}
            </div>
        </div>
    );
};

export default RevenueChart;