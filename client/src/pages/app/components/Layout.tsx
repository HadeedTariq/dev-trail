import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex flex-col w-full font-body overflow-x-hidden">
      <div className="">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
