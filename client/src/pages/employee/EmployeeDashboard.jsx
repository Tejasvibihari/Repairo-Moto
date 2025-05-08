import React, { useEffect, useState } from 'react'
import ProfileCard from '../../components/empolyee/ProfileCard'
import { useSelector } from 'react-redux'
import OrderStatusCard from '../../components/empolyee/OrderStatusCard';
import BikeRepairCard from '../../components/empolyee/BikeRepairCard';
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../../components/ui/CircularLoading';
import Dashboard from '../dashboard/Dashboard';


export default function EmployeeDashboard() {
    const employee = useSelector((state) => state.employeeAuth.employee);
    const [loading, setLoading] = useState(false);
    const [fetchOrder, setFetchOrder] = useState([]);
    const [inProgressOrders, setInProgressOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    useEffect(() => {
        // Fetch employee data from the API if needed
        const fetchOrderForEmployee = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/api/admin/order/by-position?position=${employee.position}&employeeId=${employee._id}`)
                console.log(response.data)
                setFetchOrder(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
        fetchOrderForEmployee();

    }, []);
    useEffect(() => {
        setInProgressOrders(fetchOrder.filter(order => order.status === "In Progress"));
        setCompletedOrders(fetchOrder.filter(order => order.status === "Completed"));
    }, [fetchOrder])
    if (employee.position === "telecaller" || employee.position === "operational manager") {
        return <Dashboard />;
    }
    return (
        <>
            {
                loading ? <div className='flex justify-center items-center h-screen flex-col space-y-4'>
                    <CircularLoading />
                    <span className='text-lg font-semibold text-gray-700'>
                        Loading.....
                    </span>
                </div> : <div>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div className='md:col-span-3'>
                            <ProfileCard key={employee._id} employee={employee} />
                        </div>
                        <div className='md:col-span-1'>
                            <BikeRepairCard
                                completedOrders={18}
                                totalOrders={25}
                                date={new Date()}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                        <OrderStatusCard
                            title="Total Orders"
                            count={fetchOrder.length}
                            icon="bag"
                            color="amber"
                            trend="+14% from last month"
                            className="w-full"
                        />
                        <OrderStatusCard
                            title="In Progress Orders"
                            count={inProgressOrders.length}
                            icon="clock"
                            color="purple"
                            trend="+5% from last month"
                            className="w-full"
                        />

                        <OrderStatusCard
                            title="Completed Orders"
                            count={completedOrders.length}
                            icon="check-circle"
                            color="green"
                            trend="+10% from last month"
                            className="w-full"
                        />
                    </div>
                </div>
            }

        </>
    )
}
