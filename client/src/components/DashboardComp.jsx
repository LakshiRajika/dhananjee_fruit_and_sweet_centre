import React from "react";
import { useSelector } from "react-redux";
import { Card, Button } from "flowbite-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  text: { fontSize: 14, marginBottom: 2 },
});

const DashboardPDF = ({ user, totalOrders, pendingOrders, activity }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Dashboard Report</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>User Profile</Text>
        <Text style={styles.text}>Username: {user?.username || "N/A"}</Text>
        <Text style={styles.text}>Email: {user?.email || "N/A"}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.text}>Total Orders: {totalOrders}</Text>
        <Text style={styles.text}>Pending Orders: {pendingOrders}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Recent Activity</Text>
        {activity.map((item, index) => (
          <Text key={index} style={styles.text}>{item}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default function DashboardComp() {
  const { currentUser } = useSelector((state) => state.user) || {};
  const totalOrders = 12;
  const pendingOrders = 2;
  const activity = [
    "✔ Order #1234 delivered successfully",
    "✔ Profile updated",
    "❌ Payment failed for Order #1256",
  ];

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-3xl font-semibold text-center my-5 text-emerald-600">
        Dashboard
      </h1>
      
      {/* User Profile Section */}
      <Card className="mb-5">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
          />
          <div>
            <h2 className="text-xl font-semibold">{currentUser?.username || "Guest"}</h2>
            <p className="text-gray-600">{currentUser?.email || "No email provided"}</p>
          </div>
        </div>
      </Card>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl text-emerald-500 font-bold">{totalOrders}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Pending Orders</h3>
          <p className="text-2xl text-red-500 font-bold">{pendingOrders}</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-5">
        <h3 className="text-xl font-semibold mb-3">Recent Activity</h3>
        <ul className="text-gray-700">
          {activity.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>

      {/* PDF Download Button */}
      <div className="mt-5 text-center">
        <PDFDownloadLink
          document={<DashboardPDF user={currentUser} totalOrders={totalOrders} pendingOrders={pendingOrders} activity={activity} />}
          fileName="dashboard_report.pdf"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
        >
          {({ loading }) => (loading ? "Generating PDF..." : "Download PDF Report")}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
