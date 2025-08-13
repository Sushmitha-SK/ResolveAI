import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Tickets = () => {
    const [form, setForm] = useState({ title: "", description: "" });
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    const fetchTickets = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/tickets`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setTickets(res.data || []);
        } catch (err) {
            console.error(
                "Failed to fetch tickets:",
                err.response ? err.response.data : err
            );
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/tickets`,
                form,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setForm({ title: "", description: "" });
            fetchTickets();
        } catch (err) {
            alert(err.response?.data?.message || "Ticket creation failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Ticket</h2>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-xl p-6 space-y-4 border border-gray-100"
            >
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ticket Title"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                />
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Ticket Description"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                ></textarea>
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit Ticket"}
                </button>
            </form>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-800">
                All Tickets
            </h2>
            <div className="space-y-4">
                {tickets.map((ticket) => (
                    <Link
                        key={ticket._id}
                        to={`/tickets/${ticket._id}`}
                        className="block bg-white p-5 rounded-xl shadow hover:shadow-md transition duration-200 border border-gray-100 hover:border-blue-300"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg text-gray-800">
                                {ticket.title}
                            </h3>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === "Open"
                                        ? "bg-green-100 text-green-800"
                                        : ticket.status === "Closed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                            >
                                {ticket.status || "N/A"}
                            </span>
                        </div>
                        <p className="text-gray-600 mb-3">{ticket.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>
                                Assigned To: {ticket.assignedTo?.email || "Unassigned"}
                            </span>
                            <span>
                                Created: {new Date(ticket.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </Link>
                ))}

                {tickets.length === 0 && (
                    <p className="text-gray-500 italic">No tickets submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default Tickets;
