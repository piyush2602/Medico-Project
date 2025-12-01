import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>

      {/* UPDATED — changed layout to flex-row */}
      <div className='flex justify-between items-start gap-14 my-10 mt-40 text-sm'>

        {/* -----Left section */}
        <div className='w-1/3'>
            <img className='mb-5 w-40 bg-white' src={assets.logo} alt="" />
            <p className='w-full text-gray-600 leading-6'>
              Medico delivers quality healthcare that’s affordable, accessible, and always within reach.
              From trusted doctors to personalised diagnostics, experience seamless care whenever and wherever you need it.
            </p>
        </div>

        {/* -----Center section */}
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-600 '>
                <li>Home</li>
                <li>Contact us</li>
                <li>About us</li>
                <li>Privacy policy</li>
            </ul>
        </div>

        {/* -----Right section */}
        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-600 '>
                <li>+919105610746</li>
                <li>medico@gmail.com</li>
            </ul>
        </div>

      </div>

      {/* -----Copyright Text */}
      <div>
        <hr />
        <p className='text-center py-4 text-black text-sm'>
          Copyright © 2024 GreatStack - All Right Reserved.
        </p>
      </div>

    </div>
  )
}

export default Footer
