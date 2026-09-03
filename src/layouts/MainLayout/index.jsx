import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080D1A] text-white flex">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Header />

        <main className="p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default MainLayout;