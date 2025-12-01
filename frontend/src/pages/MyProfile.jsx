import React, { useState } from "react";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "Edward Vincent",
    image: assets.profile_pic,
    email: "richardjameswap@gmail.com",
    phone: "+1 123 456 7890",
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Church Road, London",
    },
    gender: "Male",
    dob: "2024-07-20",
  });

  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="w-full flex justify-center py-10 px-5">
      <div className="w-full max-w-3xl">

        {/* Profile Picture + Name */}
        <div className="flex items-center gap-5 mb-8">
          <img
            src={userData.image}
            className="w-28 h-28 rounded-xl object-cover"
            alt="profile"
          />
          {isEdit ? (
            <input
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="border p-2 rounded-lg w-60"
            />
          ) : (
            <h1 className="text-2xl font-semibold">{userData.name}</h1>
          )}
        </div>
<hr />
        {/* Contact Information Section */}
        <p className="text-gray-600 text-sm font-semibold underline mb-3">
          CONTACT INFORMATION
        </p>

        <div className="grid grid-cols-[130px_1fr] gap-y-4 text-gray-800 text-[15px]">

          {/* Email */}
          <p className="text-gray-600">Email id:</p>
          <p className="text-blue-500">{userData.email}</p>

          {/* Phone */}
          <p className="text-gray-600">Phone:</p>
          {isEdit ? (
            <input
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="border p-2 rounded"
            />
          ) : (
            <p className="text-blue-500">{userData.phone}</p>
          )}

          {/* Address */}
          <p className="text-gray-600">Address:</p>
          {isEdit ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={userData.address.line1}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                value={userData.address.line2}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
                className="border p-2 rounded"
              />
            </div>
          ) : (
            <p>
              {userData.address.line1} <br />
              {userData.address.line2}
            </p>
          )}
        </div>

        {/* Basic Information */}
        <p className="text-gray-600 text-sm font-semibold underline mt-10 mb-3">
          BASIC INFORMATION
        </p>

        <div className="grid grid-cols-[130px_1fr] gap-y-4 text-gray-800 text-[15px]">

          {/* Gender */}
          <p className="text-gray-600">Gender:</p>
          {isEdit ? (
            <select
              className="border p-2 rounded w-40"
              value={userData.gender}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          ) : (
            <p>{userData.gender}</p>
          )}

          {/* Birthday */}
          <p className="text-gray-600">Birthday:</p>
          {isEdit ? (
            <input
              type="date"
              className="border p-2 rounded w-48"
              value={userData.dob}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, dob: e.target.value }))
              }
            />
          ) : (
            <p>
              {new Date(userData.dob).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-10">
          {isEdit ? (
            <button
              onClick={() => setIsEdit(false)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
            >
              Save information
            </button>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
