import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
    const [habitList, setHabitList] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (token) {
            fetchHabits();
        }
    }, [token]);

    const fetchHabits = async () => {
        try {
            const response = await fetch("/api/habits", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setHabitList(data);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addHabit = async (habit) => {
        try {
            const response = await fetch("/api/habits", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(habit),
            });
            const data = await response.json();
            if (response.ok) {
                setHabitList([data, ...habitList]);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateHabit = async (habit) => {
        try {
            const response = await fetch(`/api/habits/${habit._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(habit),
            });
            const data = await response.json();
            if (response.ok) {
                setHabitList(
                    habitList.map((h) => (h._id === habit._id ? data : h))
                );
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteHabit = async (id) => {
        try {
            const response = await fetch(`/api/habits/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setHabitList(habitList.filter((h) => h._id !== id));
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <HabitContext.Provider
            value={{ habitList, fetchHabits, addHabit, updateHabit, deleteHabit }}
        >
            {children}
        </HabitContext.Provider>
    );
};