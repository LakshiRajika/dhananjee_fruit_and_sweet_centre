import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Table, Select } from 'flowbite-react';
import { HiCalendar, HiFilter, HiShoppingCart, HiClock, HiCurrencyDollar, HiUser, HiDownload } from 'react-icons/hi';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];

export default function AllOrders() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [orderStatusLineData, setOrderStatusLineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedYear, selectedMonth, selectedDay]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/order/all');
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    if (selectedYear) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt).getFullYear() === selectedYear
      );
    }
    
    if (selectedMonth !== '') {
      filtered = filtered.filter(order => 
        new Date(order.createdAt).getMonth() === parseInt(selectedMonth)
      );
    }

    if (selectedDay !== '') {
      filtered = filtered.filter(order => 
        new Date(order.createdAt).getDate() === parseInt(selectedDay)
      );
    }
    
    setFilteredOrders(filtered);
    updateStatsAndCharts(filtered);
  };

  const updateStatsAndCharts = (filtered) => {
    // Update stats
    const totalOrders = filtered.length;
    const pendingOrders = filtered.filter(order => order.status === 'pending').length;
    const totalRevenue = filtered.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    const uniqueCustomers = new Set(filtered.map(order => order.userId)).size;

    setStats({
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalCustomers: uniqueCustomers
    });

    // Update order status data
    const statusCounts = filtered.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
    setOrderStatusData(statusData);

    // Update sales data
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const salesByDate = {};
    const statusByDate = {};

    for (const date of last7Days) {
      salesByDate[date] = 0;
      statusByDate[date] = {};
    }

    filtered.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (salesByDate[date] !== undefined) {
        salesByDate[date] += calculateOrderTotal(order);
        statusByDate[date][order.status] = (statusByDate[date][order.status] || 0) + 1;
      }
    });

    const formattedSalesData = last7Days.map(date => ({
      date,
      sales: salesByDate[date] || 0
    }));

    setSalesData(formattedSalesData);

    // Update status line data
    const allStatuses = [...new Set(filtered.map(order => order.status))];
    const formattedStatusLineData = last7Days.map(date => {
      const entry = { date };
      allStatuses.forEach(status => {
        entry[status] = statusByDate[date][status] || 0;
      });
      return entry;
    });

    setOrderStatusLineData(formattedStatusLineData);
  };

  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`Total Orders: ${stats.totalOrders}`, pageWidth / 2, 20, { align: 'center' });
    doc.text(`Pending Orders: ${stats.pendingOrders}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Total Revenue: Rs ${stats.totalRevenue.toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });
    doc.text(`Total Customers: ${stats.totalCustomers}`, pageWidth / 2, 50, { align: 'center' });

    doc.addPage();
    const chartElements = document.querySelectorAll('.chart-container');
    const numberOfCharts = chartElements.length;
    const chartsPerPage = 2;
    let currentPage = 1;

    for (let i = 0; i < numberOfCharts; i += chartsPerPage) {
      const currentCharts = Array.from(chartElements).slice(i, i + chartsPerPage);
      let yOffset = 20;
      for (const chartElement of currentCharts) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 130;
        const imgHeight = 75;
        const xOffset = (pageWidth / 2) - (imgWidth / 2);
        doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;

        if (i + chartsPerPage < numberOfCharts) {
          doc.addPage();
        }
      }
    }

    doc.save('dashboard_overview.pdf');
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { label: 'Total Orders', value: stats.totalOrders },
      { label: 'Pending Orders', value: stats.pendingOrders },
      { label: 'Total Revenue', value: `Rs ${stats.totalRevenue.toLocaleString()}` },
      { label: 'Total Customers', value: stats.totalCustomers },
    ]);

    const orderStatusSheet = XLSX.utils.json_to_sheet(orderStatusData);
    XLSX.utils.book_append_sheet(wb, ws, 'Overview');
    XLSX.utils.book_append_sheet(wb, orderStatusSheet, 'Order Status');

    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, salesSheet, 'Sales Trend');

    const statusLineSheet = XLSX.utils.json_to_sheet(orderStatusLineData);
    XLSX.utils.book_append_sheet(wb, statusLineSheet, 'Order Status Trend');

    XLSX.writeFile(wb, 'dashboard_overview.xlsx');
  };

  const generateText = () => {
    const text = `
      Dashboard Overview:
      -------------------
      Total Orders: ${stats.totalOrders}
      Pending Orders: ${stats.pendingOrders}
      Total Revenue: Rs ${stats.totalRevenue.toLocaleString()}
      Total Customers: ${stats.totalCustomers}

      Order Status Data:
      ------------------
      ${orderStatusData.map(item => `${item.status}: ${item.count}`).join('\n')}

      Sales Trend (Last 7 Days):
      ---------------------------
      ${salesData.map(item => `Date: ${item.date}, Sales: Rs ${item.sales.toLocaleString()}`).join('\n')}

      Order Status Trend (Last 7 Days):
      ---------------------------------
      ${orderStatusLineData.map(item => `Date: ${item.date}, ${Object.entries(item).map(([status, count]) => `${status}: ${count}`).join(', ')}`).join('\n')}
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard_overview.txt';
    link.click();
  };

  const generateHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Dashboard Overview</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: #1890ff;
          }
          .section {
            margin-bottom: 24px;
          }
          .section h2 {
            color: #722ed1;
          }
        </style>
      </head>
      <body>
        <h1>Dashboard Overview</h1>
        <div class="section">
          <h2>Stats</h2>
          <p><strong>Total Orders:</strong> ${stats.totalOrders}</p>
          <p><strong>Pending Orders:</strong> ${stats.pendingOrders}</p>
          <p><strong>Total Revenue:</strong> Rs ${stats.totalRevenue.toLocaleString()}</p>
          <p><strong>Total Customers:</strong> ${stats.totalCustomers}</p>
        </div>
        <div class="section">
          <h2>Order Status</h2>
          <ul>
            ${orderStatusData.map(item => `<li>${item.status}: ${item.count}</li>`).join('')}
          </ul>
        </div>
        <div class="section">
          <h2>Sales Trend (Last 7 Days)</h2>
          <ul>
            ${salesData.map(item => `<li>${item.date}: Rs ${item.sales.toLocaleString()}</li>`).join('')}
          </ul>
        </div>
        <div class="section">
          <h2>Order Status Trend</h2>
          <ul>
            ${orderStatusLineData.map(item =>
              `<li>${item.date}: ${Object.entries(item).filter(([k]) => k !== 'date').map(([status, count]) => `${status}: ${count}`).join(', ')}</li>`
            ).join('')}
          </ul>
        </div>
      </body>
      </html>
    `;
  
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard_overview.html';
    link.click();
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={generatePDF} 
            style={{ 
              backgroundColor: '#1890ff', 
              color: '#fff', 
              borderColor: '#1890ff' 
            }}
          >
            <HiDownload className="mr-2" /> Generate PDF
          </Button>
          <Button 
            onClick={generateExcel} 
            style={{ 
              backgroundColor: '#1890ff', 
              color: '#fff', 
              borderColor: '#1890ff' 
            }}
          >
            <HiDownload className="mr-2" /> Export to Excel
          </Button>
          <Button 
            onClick={generateText} 
            style={{ 
              backgroundColor: '#1890ff', 
              color: '#fff', 
              borderColor: '#1890ff' 
            }}
          >
            <HiDownload className="mr-2" /> Export to Text
          </Button>
          <Button 
            onClick={generateHTML} 
            style={{ 
              backgroundColor: '#1890ff', 
              color: '#fff', 
              borderColor: '#1890ff' 
            }}
          >
            <HiDownload className="mr-2" /> Download HTML
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {[...Array(5)].map((_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>
              {new Date().getFullYear() - i}
            </option>
          ))}
        </Select>

        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i}>
              {new Date(2000, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </Select>

        <Select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="">All Days</option>
          {[...Array(31)].map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <div className="flex items-center">
            <ShoppingCartOutlined className="text-2xl mr-2" />
            <div>
              <p className="text-gray-500">Total Orders</p>
              <p className="text-xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <ClockCircleOutlined className="text-2xl mr-2" />
            <div>
              <p className="text-gray-500">Pending Orders</p>
              <p className="text-xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <DollarOutlined className="text-2xl mr-2" />
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <UserOutlined className="text-2xl mr-2" />
            <div>
              <p className="text-gray-500">Total Customers</p>
              <p className="text-xl font-bold">{stats.totalCustomers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="chart-container" title="Sales Trend (Bar Chart)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-container" title="Sales Trend (Line Chart)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#52c41a" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="chart-container" title="Sales Overview (Pie Chart)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={salesData}
                dataKey="sales"
                nameKey="date"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {salesData.map((entry, index) => (
                  <Cell key={`sales-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-container" title="Order Status (Pie Chart)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={orderStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#faad14"
                label
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`status-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Order Status Line Chart */}
      <div className="mb-4">
        <Card className="chart-container" title="Order Status Trend (Line Chart)">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={orderStatusLineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {orderStatusData.map((statusObj, index) => (
                <Line
                  key={statusObj.status}
                  type="monotone"
                  dataKey={statusObj.status}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Orders Table */}
      <Card title="Orders">
        <Table>
          <Table.Head>
            <Table.HeadCell>Order ID</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredOrders.map((order) => (
              <Table.Row key={order._id}>
                <Table.Cell>{order._id}</Table.Cell>
                <Table.Cell>{new Date(order.createdAt).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{order.userId}</Table.Cell>
                <Table.Cell>${calculateOrderTotal(order).toFixed(2)}</Table.Cell>
                <Table.Cell>{order.status}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}