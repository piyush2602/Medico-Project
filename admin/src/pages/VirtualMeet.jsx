import React from 'react'

const VirtualMeet = () => {
    return (
        <div className='w-full h-screen'>
            <iframe
                src="https://skymeet-6prd.onrender.com/"
                title="Virtual Meet"
                className='w-full h-full border-none bg-white'
                allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
                allowFullScreen
            ></iframe>
        </div>
    )
}

export default VirtualMeet
