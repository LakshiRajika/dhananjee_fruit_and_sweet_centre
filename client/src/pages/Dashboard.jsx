import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';
import FeedbackDashboard from './FeedbackDashboard';
import MyFeedbacks from './myFeedback';
import ProductList from './ProductList'
import AddProduct from './InsertProduct'

import AdminDeliveryManagement from './AdminDeliveryManagement';
import Feedback from './Feedback'; // ✅ Add this if using <Feedback />

import ActiveUsers from './ActiveUsers';


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

      {tab=="productList"&& <ProductList />}
      {tab=="addProduct"&& <AddProduct/>}
      {/* feedback */}
      {tab === "feedback" && <FeedbackDashboard />}
      {tab === "my-feedbacks" && <MyFeedbacks />}


      {/* comments  */}
      {tab === "comments" && <DashComments />}
      
      {tab === "delivery-details" && <AdminDeliveryManagement />}
      {tab === "dash" && <DashboardComp />}
      {/* Render the feedback page  correct*/}
      

      {tab === "active-users" && <ActiveUsers />}


    </div>
  );
}
