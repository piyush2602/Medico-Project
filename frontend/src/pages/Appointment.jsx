// import React, { useContext, useState, useEffect } from 'react'
// import { AppContext } from '../context/AppContext'
// import { useParams } from 'react-router-dom'
// import { assets } from '../assets/assets';

// const Appointment = () => {

//   const { docId } = useParams();    // FIXED
//   const { doctors, currencySymbol } = useContext(AppContext);
//   const daysOfWeek = ['SUN','MON','TUE','WED','THRU','FRI','SAT']




//   const [docInfo, setDocInfo] = useState(null);
//   const [docSlots, setDocSlots]=useState([])
//   const [slotIndex,setSlotIndex]=useState(0)
//   const [slotTime,setSlotTime]=useState('')

//   const fetchDocInfo = () => {
//     const found = doctors.find(doc => doc._id === docId);
//     setDocInfo(found);
//     // console.log("Doctor Info:", found);
//   };

//   const getAvailableSlots=async()=>{
//      setDocSlots([])

//       //getting current date
//       let today = new Date()
//      for(let i = 0; i<7 ; i++){
//       //getting date with index
//       let currentDate = new Date(today)
//       currentDate.setDate(today.getDate()+i)

//       //setting end time of the date with index
//       let endTime= new Date()
//       endTime.setDate(today.getDate()+i)
//       endTime.setHours(21,0,0,0)

//       //setting hours
//       if(today.getDate()==currentDate.getDate()){
//         currentDate.setHours(currentDate.getHours()>10 ? currentDate.getHours()+1 : 10)
//         currentDate.setMinutes(currentDate.getMinutes()>30 ? 30 : 0)
//       }
//       else{
//         currentDate.setHours(10)
//         currentDate.setMinutes(0)
//       }
//       let timeSlots = []
//       while(currentDate < endTime){
//         let formatted = currentDate.toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit'})
//         //add slot to array
//         timeSlots.push({
//           datetime: new Date(currentDate),
//           time: formattedTime
//         })

//         // increament time by 30 minutes
//         currentDate.setMinutes(currentDate.getMinutes()+30)
//       }
//       setDocSlots(prev=>([...prev, timeSlots]))
//      }
//   }

//   useEffect(() => {
//     fetchDocInfo();
//   }, [doctors, docId]);

//   useEffect(()=>{
//     getAvailableSlots()
//   },[docInfo])

//   useEffect(()=>{
//     console.log(docSlots);
//   },[])


//   return (
//     docInfo && (
//       <div className="flex flex-col sm:flex-row gap-4">

//         {/* Doctor Image */}
//         <div >
//           <img className="bg-green-300 w-full sm:max-w-72 rounded-lg"
//             src={docInfo.image}
//             alt=""
//           />
//         </div>
//          <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
//         {/* Doctor Name */}
//         <p className="flex items-center gap-2 text-2xl font-medium text-black">{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
//         <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
//                 <p className="text-gray-600">{docInfo.degree}-{docInfo.speciality}</p>
//                 <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button></div>
//         {/* ----Doctor about---- */}
//         <div className="mt-1">
//   <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
//     <p>About</p>
//     <img src={assets.info_icon} alt="" className="w-4 h-4" />
//   </div>

//   <p className="text-sm text-gray-500 max-w-[700px] mt-1">
//     {docInfo.about}
//   </p>
// </div>
//      <p className='text-gray-500 font-medium mt-4'>
//       Appointment fee: <span className='text-gray-600'>{ currencySymbol}{docInfo.fees}</span>
//      </p>
//       </div>

//       {/* -----Booking Slots */}
//       {/* <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
//         <p>Booking Slots</p>
//         <div>
//           {
//             docSlots.length && docSlots.map((item,index)=>(
//               <div key={index}>
//                 <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
//                 <p>{item[0] && item[0].datetime.getDate()}</p>
//               </div>
//             ))
//           }
//         </div>
//       </div> */}
      
//  </div>)
//   );
// };

// export default Appointment;

import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  // Fetch Doctor Info
  const fetchDocInfo = () => {
    const found = doctors.find((doc) => doc._id === docId);
    setDocInfo(found);
  };

  // Generate Slots
  const getAvailableSlots = () => {
    if (!docInfo) return;

    let allSlots = [];
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let startTime = new Date(currentDate);
      let endTime = new Date(currentDate);

      startTime.setHours(10, 0, 0, 0);
      endTime.setHours(21, 0, 0, 0);

      // If today → start from NEXT 30-min slot
      if (i === 0) {
        const now = new Date();
        let minutes = now.getMinutes();
        now.setMinutes(minutes < 30 ? 30 : 60);
        now.setSeconds(0);
        startTime = now;
      }

      let daySlots = [];
      while (startTime < endTime) {
        let formatted = startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        daySlots.push({
          datetime: new Date(startTime),
          time: formatted,
        });

        startTime.setMinutes(startTime.getMinutes() + 30);
      }

      allSlots.push(daySlots);
    }

    setDocSlots(allSlots);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div className="flex flex-col gap-6">

        {/* Doctor Section (Image + Description Box) */}
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Doctor Image */}
          <div>
            <img
              className="bg-green-300 w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>

          {/* Description Box */}
          <div className="flex-1 border border-gray-300 rounded-2xl p-8 bg-white">

            {/* Name */}
            <p className="flex items-center gap-2 text-2xl font-semibold text-black">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>

            {/* Degree + Experience */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* About */}
            <div className="mt-3">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <p>About</p>
                <img src={assets.info_icon} alt="" className="w-4 h-4" />
              </div>

              <p className="text-sm text-gray-500 mt-1 leading-6">
                {docInfo.about}
              </p>
            </div>

            {/* Fee */}
            <p className="text-gray-600 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-800 font-semibold">
                {currencySymbol}{docInfo.fees}
              </span>
            </p>

          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Booking Slots (outside & below description box, centered, reduced width) */}
<div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 '>
  <div className="w-[90%] sm:w-[80%] lg:w-[70%] border border-white rounded-2xl bg-white p-10">

    <p className="text-2xl font-semibold mb-6">Booking slots</p>

    {/* Day tabs */}
    <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
      {docSlots.length > 0 &&
        docSlots.map((daySlots, index) => (
          <div className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-green-400 text-white' : 'border border-gray-200'}`}
            key={index}
            onClick={() => setSlotIndex(index)}
      
          >
            <p className="text-xs font-semibold uppercase tracking-wide">
              {daySlots[0] &&
                daysOfWeek[daySlots[0].datetime.getDay()]}
            </p>
            <p className="text-lg font-bold mt-1">
              {daySlots[0] && daySlots[0].datetime.getDate()}
            </p>
          </div>
        ))}
    </div>

    {/* Time slots (scroll horizontally, max 8 at once) */}
    <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
     {docSlots.length && docSlots[slotIndex].map((item,index)=>(
      <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time=== slotTime ? 'bg-green-400 text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>
      {item.time.toLowerCase()}
      </p>
     ))}
    </div>

    {/* Book Appointment Button */}
    <button
      disabled={!slotTime}
      className={`mt-10 w-full py-4 rounded-full text-white text-lg font-semibold transition
        ${
          slotTime
            ? "bg-green-400 hover:bg-green-400"
            : "bg-indigo-300 cursor-not-allowed"
        }
      `}
    >
      Book an appointment
    </button>
  </div>

  {/* ----Listing Related Doctors---- */}
  <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
</div>
</div>
    )
  );
};

export default Appointment;
