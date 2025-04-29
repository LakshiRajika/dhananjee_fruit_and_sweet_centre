import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
  HiChatAlt2,
} from "react-icons/hi";
import { FaPlusSquare, FaList, FaTruck, FaBoxOpen } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {currentUser && currentUser.isAdmin && (
            <Link to="/dashboard?tab=dash">
              <Sidebar.Item
                className={`hover:bg-gray-200 ${
                  tab === "dash" || !tab ? "bg-gray-300" : ""
                }`}
                icon={HiChartPie}
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>
          )}

          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              className={`hover:bg-gray-200 ${
                tab === "profile" ? "bg-gray-300" : ""
              }`}
              icon={HiUser}
              label={currentUser.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>

          <Link to="/dashboard?tab=posts">
            <Sidebar.Item
              className={`hover:bg-gray-200 ${
                tab === "posts" ? "bg-gray-300" : ""
              }`}
              icon={HiDocumentText}
              as="div"
            >
              Posts
            </Sidebar.Item>
          </Link>

          <Link to="/dashboard?tab=comments">
            <Sidebar.Item
              className={`hover:bg-gray-200 ${
                tab === "comments" ? "bg-gray-300" : ""
              }`}
              icon={HiAnnotation}
              as="div"
            >
              Comments
            </Sidebar.Item>
          </Link>

        <Link to="/dashboard?tab=my-feedbacks">
          <Sidebar.Item
            className={`hover:bg-gray-200 ${
              tab === "my-feedbacks" ? "bg-gray-300" : ""
            }`}
            icon={HiChatAlt2}
            as="div"
  >
              My Feedbacks
          </Sidebar.Item>
        </Link>

          {currentUser.isAdmin && (
            <>
              <Link to="/dashboard?tab=users">
                <Sidebar.Item
                  className={`hover:bg-gray-200 ${
                    tab === "users" ? "bg-gray-300" : ""
                  }`}
                  icon={HiOutlineUserGroup}
                  as="div"
                >
                  Users
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=active-users">
                <Sidebar.Item
                  className={`hover:bg-gray-200 ${
                    tab === "active-users" ? "bg-gray-300" : ""
                  }`}
                  icon={HiOutlineUserGroup}
                  as="div"
                >
                  User Growth
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=feedback">
                <Sidebar.Item
                  className={`hover:bg-gray-200 ${
                    tab === "feedback" ? "bg-gray-300" : ""
                  }`}
                  icon={HiChatAlt2}
                  as="div"
                >
                  Feedback
                </Sidebar.Item>
              </Link>

              {/* Inventory Section */}
              <Sidebar.Collapse
                icon={FaBoxOpen}
                label="Inventory"
                className={`hover:bg-gray-200 ${
                  tab === "addProduct" ? "bg-gray-300" : ""
                }`}
              >
                <Link to="/dashboard?tab=addProduct">
                  <Sidebar.Item
                    className={`hover:bg-gray-200 ${
                      tab === "addProduct" ? "bg-gray-300" : ""
                    }`}
                    icon={FaPlusSquare}
                    as="div"
                  >
                    Add Product
                  </Sidebar.Item>
                </Link>

                <Link to="/dashboard?tab=productList">
                  <Sidebar.Item
                    className={`hover:bg-gray-200 ${
                      tab === "productList" ? "bg-gray-300" : ""
                    }`}
                    icon={FaList}
                    as="div"
                  >
                    Product List
                  </Sidebar.Item>
                </Link>
              </Sidebar.Collapse>

              <Link to="/dashboard?tab=delivery-details">
                <Sidebar.Item
                  className={`hover:bg-gray-200 ${
                    tab === "delivery-details" ? "bg-gray-300" : ""
                  }`}
                  icon={FaTruck}
                  as="div"
                >
                  Deliveries
                </Sidebar.Item>
              </Link>
            </>
          )}

          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer hover:bg-gray-200"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
