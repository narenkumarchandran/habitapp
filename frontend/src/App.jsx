import { useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { HabitContext } from "./context/HabitContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HabitsSection from "./components/HabitsSection";
import HeaderSection from "./components/HeaderSection";
import StatsSection from "./components/StatsSection";
import AddHabitModal from "./components/AddHabitModal";

const App = () => {
    const { token } = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
                <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
                <Route path="/" element={token ? <MainApp /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

const MainApp = () => {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const { addHabit } = useContext(HabitContext);

    return (
        <div className="min-h-screen bg-slate-900">
            <main className="container mx-auto max-w-5xl py-12 px-4">
                <HeaderSection setAddModalOpen={setAddModalOpen} />
                <StatsSection />
                <HabitsSection />
                <AddHabitModal
                    addModalOpen={addModalOpen}
                    setAddModalOpen={setAddModalOpen}
                    addHabit={addHabit}
                />
            </main>
        </div>
    );
};

export default App;
