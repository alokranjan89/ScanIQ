import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

function MainLayout() {
    return (
        <div className="min-h-screen text-slate-950">
            <Navbar />

            <main className="relative">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
