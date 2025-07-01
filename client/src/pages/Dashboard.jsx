import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardOverview from '../components/DashboardOverview';
import FeedbackDashboard from './FeedbackDashboard';
import ProductList from './ProductList'
import AddProduct from './InsertProduct'
import AdminDeliveryManagement from './AdminDeliveryManagement';
import Feedback from './Feedback';
import AdminOrders from './AdminOrders';
import DashDeliveries from '../components/DashDeliveries';
import UserOrders from '../components/UserOrders';
import AllOrders from '../components/AllOrders';
import OrderPrediction from '../components/OrderPrediction';
import RefundManagement from '../components/RefundManagement';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        <DashSidebar />
      </div>
      {tab === "profile" && <DashProfile />}
      {tab === "posts" && <DashPosts />}
      {tab === "users" && <DashUsers />}
      {tab === "productList" && <ProductList />}
      {tab === "addProduct" && <AddProduct/>}
      {tab === "feedback" && <FeedbackDashboard />}
      {tab === "comments" && <DashComments />}
      {tab === "delivery-details" && <AdminDeliveryManagement />}
      {tab === "dash" && <DashboardOverview />}
      {tab === "feedback" && <Feedback />}
      {tab === "orders" && <AdminOrders />}
      {tab === "my-orders" && <UserOrders />}
      {tab === "my-deliveries" && <DashDeliveries />}
      {tab === "all-orders" && <AllOrders />}
      {tab === "order-prediction" && <OrderPrediction />}
      {tab === "refunds" && <RefundManagement />}
    </div>
  );
}