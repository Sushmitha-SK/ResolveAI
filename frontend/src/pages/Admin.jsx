import React, { useState } from 'react'
import axios from "axios";

const Admin = () => {

    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ role: "", skills: "" });
    const [searchQuery, setSearchQuery] = useState("");

    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/auth/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUsers(res.data);
            setFilteredUsers(res.data);

        } catch (err) {
            if (err.response) {
                console.error(err.response.data.error || "Error fetching users");
            } else {
                console.error("Error fetching users", err);
            }
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

            const res = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // If request is successful
            setEditingUser(null);
            setFormData({ role: "", skills: "" });
            fetchUsers();

        } catch (err) {
            if (err.response) {
                console.error(err.response.data.error || "Failed to update user");
            } else {
                console.error("Update failed", err);
            }
        }
    };


    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(
            users.filter((user) => user.email.toLowerCase().includes(query))
        );
    };



    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6">Admin Panel - Manage Users</h1>
            <input
                type="text"
                className="w-full mb-6"
                placeholder="Search by email"
                value={searchQuery}
                onChange={handleSearch}
            />
            {filteredUsers.map((user) => (
                <div
                    key={user._id}
                    className="shadow rounded p-4 mb-4 border"
                >
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Current Role:</strong> {user.role}
                    </p>
                    <p>
                        <strong>Skills:</strong>{" "}
                        {user.skills && user.skills.length > 0
                            ? user.skills.join(", ")
                            : "N/A"}
                    </p>

                    {editingUser === user.email ? (
                        <div className="mt-4 space-y-2">
                            <select
                                className="w-full"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                            >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Comma-separated skills"
                                className="w-full"
                                value={formData.skills}
                                onChange={(e) =>
                                    setFormData({ ...formData, skills: e.target.value })
                                }
                            />

                            <div className="flex gap-2">
                                <button
                                    className=""
                                    onClick={handleUpdate}
                                >
                                    Save
                                </button>
                                <button
                                    className=""
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="mt-2"
                            onClick={() => handleEditClick(user)}
                        >
                            Edit
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}

export default Admin