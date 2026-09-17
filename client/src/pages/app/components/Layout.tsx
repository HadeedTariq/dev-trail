import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col w-full font-body overflow-x-hidden">
      <Header />
      <div className="mt-10">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
