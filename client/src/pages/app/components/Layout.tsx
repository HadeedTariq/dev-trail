import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex flex-col w-full font-body overflow-x-hidden">
      <div className="">
        <Sidebar />
      </div>
    </div>
  );
};

export default Layout;
