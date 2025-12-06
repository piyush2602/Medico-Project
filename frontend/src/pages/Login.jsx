import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Auth = () => {
  const navigate = useNavigate();
  const { register, login } = useContext(AppContext);

  // Toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let success = false;

    if (isLogin) {
      // Login
      success = await login(email, password);
    } else {
      // Register
      success = await register(fullName, email, password);
    }

    // Navigate to home on success
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border-2 border-blue-300">

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        <p className="text-gray-600 mb-8">
          {isLogin
            ? "Please login to book appointment"
            : "Please sign up to book appointment"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Full Name (Signup only) */}
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-indigo-500"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 border rounded-lg focus:outline-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border rounded-lg focus:outline-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-medium transition"
          >
            {isLogin ? "Login" : "Create account"}
          </button>
        </form>

        {/* Switch between Login & Signup */}
        <p className="text-gray-600 text-sm text-center mt-6">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setIsLogin(false)}
                className="text-indigo-600 cursor-pointer hover:underline"
              >
                Create account here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setIsLogin(true)}
                className="text-indigo-600 cursor-pointer hover:underline"
              >
                Login here
              </span>
            </>
          )}
        </p>

      </div>
    </div>
  );
};

export default Auth;
