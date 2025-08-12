import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const TicketDetails = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTicket(res.data.ticket);
            } catch (err) {
                alert(err.response?.data?.message || "Failed to fetch ticket");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center mt-10 text-gray-500">Ticket not found</div>
        );
    }

    const statusColors = {
        Open: "bg-green-100 text-green-800",
        Closed: "bg-red-100 text-red-800",
        Pending: "bg-yellow-100 text-yellow-800",
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{ticket.title}</h2>
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status] || "bg-gray-200 text-gray-700"
                        }`}
                >
                    {ticket.status || "N/A"}
                </span>
            </div>

            <div className="bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-100">
                <p className="text-gray-700 leading-relaxed">{ticket.description}</p>

                <div className="border-t pt-4 space-y-2">
                    {ticket.priority && (
                        <p>
                            <strong className="text-gray-800">Priority:</strong>{" "}
                            <span className="text-gray-600">{ticket.priority}</span>
                        </p>
                    )}

                    {ticket.relatedSkills?.length > 0 && (
                        <p>
                            <strong className="text-gray-800">Related Skills:</strong>{" "}
                            <span className="text-gray-600">
                                {ticket.relatedSkills.join(", ")}
                            </span>
                        </p>
                    )}

                    {ticket.assignedTo && (
                        <p>
                            <strong className="text-gray-800">Assigned To:</strong>{" "}
                            <span className="text-gray-600">
                                {ticket.assignedTo?.email}
                            </span>
                        </p>
                    )}

                    {ticket.createdAt && (
                        <p className="text-sm text-gray-500">
                            Created At: {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                    )}
                </div>

                {ticket.helpfulNotes && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                        <strong className="block mb-2 text-blue-800">Helpful Notes:</strong>
                        <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetails;
