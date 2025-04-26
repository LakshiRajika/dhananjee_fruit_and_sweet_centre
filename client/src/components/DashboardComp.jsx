import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, Button, Table, Row, Col, Statistic } from "flowbite-react";
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineShoppingCart, 
  HiOutlineCurrencyDollar, 
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineExclamationCircle,
  HiOutlineClipboardList
} from "react-icons/hi";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { generateAllOrdersPDF, generateProductListPDF } from '../utils/pdfService';

export default function DashboardComp() {
  const { currentUser } = useSelector((state) => state.user) || {};
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch('/api/order/all-orders');
      const ordersData = await ordersRes.json();
      
      // Fetch users
      const usersRes = await fetch('/api/user/getusers');
      const usersData = await usersRes.json();

      if (ordersRes.ok && usersRes.ok) {
        const orders = ordersData.data || [];
        const users = usersData.users || [];
        
        // Calculate statistics
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const totalRevenue = orders.reduce((sum, order) => 
          sum + order.items.reduce((orderSum, item) => orderSum + (item.price * item.quantity), 0), 0
        );
        const totalCustomers = users.length;

        setStats({
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalCustomers
        });

        // Set recent orders
        setRecentOrders(orders.slice(0, 5));

        // Generate sample sales data for the last 7 days
        const last7Days = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: Math.floor(Math.random() * 10000) + 5000 // Sample data
          };
        }).reverse();

        setSalesData(last7Days);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMyOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <Button 
          gradientDuoTone="purpleToBlue" 
          onClick={handleViewMyOrders}
          className="flex items-center gap-2"
        >
          <HiOutlineClipboardList className="h-5 w-5" />
          My Orders
        </Button>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Orders" value={stats.totalOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Revenue" 
              value={stats.totalRevenue} 
              prefix="Rs"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Pending Orders" value={stats.pendingOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Customers" value={stats.totalCustomers} />
          </Card>
        </Col>
      </Row>

      {/* Report Generation */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Order Reports" className="h-full">
            <p className="mb-4">Generate detailed reports for all orders</p>
            <Button 
              type="primary" 
              onClick={() => generateAllOrdersPDF(orders)}
              loading={loading}
              className="mr-4"
            >
              Download Orders Report
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Product Reports" className="h-full">
            <p className="mb-4">Generate detailed reports for all products</p>
            <Button 
              type="primary"
              onClick={() => generateProductListPDF(products)}
              loading={loading}
            >
              Download Products Report
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Pending', value: stats.pendingOrders },
                { name: 'Completed', value: stats.totalOrders - stats.pendingOrders }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Order ID</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Total</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {recentOrders.map((order) => (
              <Table.Row key={order.orderId}>
                <Table.Cell>#{order.orderId}</Table.Cell>
                <Table.Cell>{order.customerEmail}</Table.Cell>
                <Table.Cell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  Rs {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}