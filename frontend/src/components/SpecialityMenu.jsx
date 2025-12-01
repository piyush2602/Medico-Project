// import React from 'react'
// import { specialityData } from '../assets/assets'
// import { Link } from 'react-router-dom'

// const SpecialityMenu = () => {
//   return (
//     <div id='speciality'>
//       <h1>Find by Speciality</h1>
//       <p>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
//       <div>
//          {specialityData.map((item,index)=>(
//             <Link key={index} to={`/doctors/${item.speciality}`}>
//                 <img src={item.image} alt="" />
//                 <p>{item.speciality}</p>
//             </Link>
//          ))}
//       </div>
//     </div>
//   )
// }

// export default SpecialityMenu

import React from 'react'
import { specialityData } from '../assets/assets'
import { Link } from 'react-router-dom'

const SpecialityMenu = () => {
  return (
    <div id='speciality' className="flex flex-col items-center gap-4 py-16 text-gray-800">
      
      <h1 className="text-3xl font-medium mb-3">Find by Speciality</h1>

      <p className="text-gray-600 mb-8 w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>

      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">

        {specialityData.map((item, index) => (
          <Link onClick={()=>scrollTo(0,0)}
            key={index}
            to={`/doctors/${item.speciality}`}
            className="flex flex-col items-center text-center hover:translate-y-[-10px] transition-all duration-500"
          >
            <img
              src={item.image}
              alt=""
              className="w-16 sm:w-24 object-contain mb-2"
            />
            <p className="text-lg font-medium">{item.speciality}</p>
          </Link>
        ))}

      </div>

    </div>
  )
}

export default SpecialityMenu
