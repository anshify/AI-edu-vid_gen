import React, { useState } from 'react'

const options = [
    {
      name: 'Youtuber',
      style: 'text-yellow-400 text-3xl font-extrabold uppercase tracking-widest drop-shadow-md p-2',
    },
    {
      name: 'Superme',
      style: 'text-white text-3xl font-bold italic drop-shadow-lg tracking-wide p-3',
    },
    {
      name: 'Neon',
      style: 'text-green-500 text-3xl font-extrabold uppercase tracking-wide glow p-4',
    },
    {
      name: 'Glitch',
      style: 'text-pink-500 text-3xl font-extrabold uppercase tracking-wider glitch-effect p-2',
    },
    {
      name: 'Fire',
      style: 'text-red-500 text-3xl font-extrabold uppercase tracking-wider drop-shadow-lg p-3',
    },
    {
      name: 'Futuristic',
      style: 'text-blue-400 text-3xl font-extrabold tracking-widest drop-shadow-xl p-4',
    }
  ];
  

function Captions({onHandleInputChange}) {
  const [selectedCaptionStyle,setSelectedCaptionStyle]=useState();
  return (
    <div className='mt-5'>
      <h2>Caption Style</h2>
      <p className='text-sm text-gray-400'>Select Caption Style</p>

      <div className='flex flex-wrap gap-4 mt-2'>
        {options.map((option,index)=>(
            <div key={index} 
            onClick={()=>{
                setSelectedCaptionStyle(option.name)
                onHandleInputChange('caption',option)
            }}
            className={`p-2 hover:border bg-slate-900
             border-gray-300 cursor-pointer rounded-lg
             ${selectedCaptionStyle==option.name&&'border'}`}>
                <h2 className={option.style}>{option.name}</h2>
            </div>
        ))}
      </div>
    </div>
  )
}

export default Captions
