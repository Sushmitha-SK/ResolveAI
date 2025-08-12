import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const token = localStorage.getItem("token");
    let user = localStorage.getItem("user");
    if (user) {
        user = JSON.parse(user);
    }

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="bg-gray-400 w-full h-10">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl">
                    Resolve AI
                </Link>
            </div>
            <div className="flex gap-2">
                {!token ? (
                    <>
                        <Link to="/signup" className="">
                            Signup
                        </Link>
                        <Link to="/login" className="">
                            Login
                        </Link>
                    </>
                ) : (
                    <>
                        <p>Hi, {user?.email}</p>
                        {user && user?.role === "admin" ? (
                            <Link to="/admin" className="">
                                Admin
                            </Link>
                        ) : null}
                        <button onClick={logout} className="">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default Navbar