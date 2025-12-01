import React from 'react';
import { assets } from '../assets/assets';

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row items-center bg-blue-500 rounded-lg justify-between px-8 ">

      {/* === Left Side === */}
      <div className="flex flex-col gap-4 max-w-lg">
        
        <p className="text-4xl font-semibold leading-tight text-white">
          Book Appointment <br /> With Trusted Doctors
        </p>

        <div className="flex items-center gap-4">
          <img src={assets.group_profiles} alt="Group Profiles" className="w-24" />
          <p className="text-white">
            Simply browse through our extensive list of trusted doctors, and schedule your appointment hassle-free.
          </p>
        </div>

        <a
          href="#speciality"
          className="flex items-center gap-2 bg-white text-gray-600 px-6 py-3 rounded-full w-fit hover:scale-105 transition-all duration-300"
        >
          Book Appointment
          <img className="w-3" src={assets.arrow_icon} alt="Arrow" />
        </a>
      </div>

      {/* === Right Side === */}
      <div className="mt-10 md:mt-0">
        <img src={assets.header_img} alt="Header" className="w-[350px] md:w-[450px]" />
      </div>

    </div>
  );
};

export default Header;
