// import React, { useState } from 'react';
// import { assets } from '../assets/assets';
// import { NavLink, useNavigate } from 'react-router-dom';

// const Navbar = () => {

//   const navigate = useNavigate();

//   const [showMenu, setShowMenu] = useState(false);
//   const [token, setToken] = useState(true);

//   const linkStyle =
//     "relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full";

//   const activeStyle =
//     "relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-blue-600";

//   return (
//     <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">

//       <img onClick={()=>navigate('/')} className="w-44 cursor-pointer" src={assets.logo} alt="" />

//       <ul className="hidden md:flex items-start gap-8 font-medium">

//         <NavLink
//           to="/"
//           className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//         >
//           <li>HOME</li>
//         </NavLink>

//         <NavLink
//           to="/doctors"
//           className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//         >
//           <li>ALL DOCTORS</li>
//         </NavLink>

//         <NavLink
//           to="/about"
//           className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//         >
//           <li>ABOUT</li>
//         </NavLink>

//         <NavLink
//           to="/contact"
//           className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
//         >
//           <li>CONTACT</li>
//         </NavLink>
//       </ul>

//       <div className="flex items-center gap-4">
//         {token ? (
//           <div className="flex items-center gap-2 cursor-pointer group relative">
//             <img className="w-8 rounded-full" src={assets.profile_pic} alt="" />
//             <img className="w-2.5" src={assets.dropdown_icon} alt="" />

//             {/* Dropdown */}
//             <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
//               <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
//                 <p
//                   onClick={() => navigate('my-profile')}
//                   className="hover:text-black cursor-pointer"
//                 >
//                   My Profile
//                 </p>
//                 <p
//                   onClick={() => navigate('my-appointments')}
//                   className="hover:text-black cursor-pointer"
//                 >
//                   My Appointments
//                 </p>
//                 <p
//                   onClick={() => setToken(false)}
//                   className="hover:text-black cursor-pointer"
//                 >
//                   Logout
//                 </p>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <button
//             onClick={() => navigate('/login')}
//             className="bg-blue-500 text-white px-8 py-3 rounded-full font-light hidden md:block"
//           >
//             Create account
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useState, useContext } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const HamburgerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="black" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CrossIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24">
    <path d="M6 6l12 12M6 18L18 6" stroke="black" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, logout } = useContext(AppContext);

  const linkStyle =
    "relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full";

  const activeStyle =
    "relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-blue-600";

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-400 px-4 md:px-10">

      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        className="w-32 sm:w-40 cursor-pointer"
        src={assets.logo}
        alt=""
      />

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-start gap-8 font-medium">
        <NavLink to="/" className={({ isActive }) => (isActive ? activeStyle : linkStyle)}><li>HOME</li></NavLink>
        <NavLink to="/doctors" className={({ isActive }) => (isActive ? activeStyle : linkStyle)}><li>ALL DOCTORS</li></NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? activeStyle : linkStyle)}><li>ABOUT</li></NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? activeStyle : linkStyle)}><li>CONTACT</li></NavLink>
        <a href="https://medico-admin-zpnw.onrender.com" target="_blank" rel="noopener noreferrer" className={linkStyle}><li>ADMIN PANEL</li></a>
      </ul>

      {/* Desktop Profile */}
      <div className="hidden md:flex items-center gap-4">
        {token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={assets.profile_pic} alt="" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />

            {/* Dropdown */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p onClick={() => navigate('my-profile')} className="hover:text-black cursor-pointer">My Profile</p>
                <p onClick={() => navigate('my-appointments')} className="hover:text-black cursor-pointer">My Appointments</p>
                <p onClick={() => logout()} className="hover:text-black cursor-pointer">Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-8 py-3 rounded-full font-light"
          >
            Create account
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
        {showMenu ? <CrossIcon /> : <HamburgerIcon />}
      </button>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-30 py-6 flex flex-col gap-6 text-center font-medium md:hidden">
          <NavLink to="/" onClick={() => setShowMenu(false)}>HOME</NavLink>
          <NavLink to="/doctors" onClick={() => setShowMenu(false)}>ALL DOCTORS</NavLink>
          <NavLink to="/about" onClick={() => setShowMenu(false)}>ABOUT</NavLink>
          <NavLink to="/contact" onClick={() => setShowMenu(false)}>CONTACT</NavLink>
          <a href="https://medico-admin-zpnw.onrender.com" target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)}>ADMIN PANEL</a>

          {token ? (
            <>
              <p onClick={() => { navigate('my-profile'); setShowMenu(false); }}>My Profile</p>
              <p onClick={() => { navigate('my-appointments'); setShowMenu(false); }}>My Appointments</p>
              <p onClick={() => { logout(); setShowMenu(false); }}>Logout</p>
            </>
          ) : (
            <button
              onClick={() => { navigate('/login'); setShowMenu(false); }}
              className="bg-blue-500 text-white px-8 py-3 rounded-full font-light mx-auto"
            >
              Create account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;

