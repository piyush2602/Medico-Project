import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div className="w-full flex flex-col items-center py-16 px-5">

      {/* Heading */}
      <h1 className="text-3xl font-semibold tracking-wide mb-10">
        CONTACT <span className="text-gray-400 font-bold">US</span>
      </h1>

      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-14">

        {/* LEFT IMAGE */}
        <div>
          <img
            src={assets.contact_image}
            alt="Contact"
            className="w-full rounded-xl shadow-sm object-cover"
          />
        </div>

        {/* RIGHT INFO */}
        <div className="flex flex-col gap-10">

          {/* Office Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">OUR OFFICE</h2>
            <p className="text-gray-700 leading-relaxed">
              2-A, 249/250 Awas Vikas <br />
              Vrindavan, Uttar Pradesh, India
            </p>

            <p className="text-gray-700 mt-4">
              Tel: +919105610746 <br />
              Email: medico@gmail.com
            </p>
          </div>

          {/* Careers */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              CAREERS AT MEDICO
            </h2>

            <p className="text-gray-700 leading-relaxed text-sm">
              Learn more about our teams and job openings.
            </p>

            <button className="mt-5 border border-gray-700 px-6 py-2 rounded-xl hover:bg-black hover:text-white transition-all duration-500">
              Explore Jobs
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Contact;
