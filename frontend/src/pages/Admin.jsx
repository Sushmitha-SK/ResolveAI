import React, { useState, useEffect } from 'react';
import axios from "axios";

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ role: "", skills: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/auth/users`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(res.data);
            setFilteredUsers(res.data);
        } catch (err) {
            console.error(err.response?.data?.error || "Error fetching users");
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user.email);
        setFormData({
            role: user.role,
            skills: user.skills?.join(", "),
        });
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                email: editingUser,
                role: formData.role,
                skills: formData.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean),
            };

            await axios.put(
                `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEditingUser(null);
            setFormData({ role: "", skills: "" });
            fetchUsers();
        } catch (err) {
            console.error(err.response?.data?.error || "Failed to update user");
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(
            users.filter((user) => user.email.toLowerCase().includes(query))
        );
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                Admin Panel <span className="text-blue-600">— Manage Users</span>
            </h1>

            <input
                type="text"
                className="w-full mb-8 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={handleSearch}
            />

            {filteredUsers.map((user) => (
                <div
                    key={user._id}
                    className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200 hover:shadow-lg transition"
                >
                    <p className="mb-2"><strong className="text-gray-700">Email:</strong> {user.email}</p>
                    <p className="mb-2"><strong className="text-gray-700">Role:</strong> {user.role}</p>
                    <p className="mb-4"><strong className="text-gray-700">Skills:</strong> {user.skills?.length > 0 ? user.skills.join(", ") : "N/A"}</p>

                    {editingUser === user.email ? (
                        <div className="mt-4 space-y-4">
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Comma-separated skills"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            />

                            <div className="flex gap-3">
                                <button
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition"
                                    onClick={handleUpdate}
                                >
                                    Save
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-md transition"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition"
                            onClick={() => handleEditClick(user)}
                        >
                            Edit
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Admin;
