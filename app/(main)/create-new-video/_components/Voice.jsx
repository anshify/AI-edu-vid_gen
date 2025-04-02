import React, { useState } from 'react'
const voiceOptions = [
    {
        "value":"hf_alpha",
        "name": "Alpha(Female)"
    },
    {
        "value":"hf_beta",
        "name": "Beta(Female)"
    },
    {
        "value":"hf_omega",
        "name": "Omega(Male)"
    },
    {
        "value":"hm_psi",
        "name": "Psi(Male)"
    }
]
function Voice({onHandleInputChange}) {
  const[selectedVoice,setSelectedVoice]=useState();
  return (
    <div>
      <h2>Video Voice</h2>
      <p className='text-sm text-gray-400'>Select voice for the video</p>
      <div className='grid grid-cols-2 gap-3'>
        {voiceOptions.map((voice,index)=>(    
            <h2 className={`cursor-pointer p-3
             dark:bg-slate-900 
            dark:border-white rounded-lg 
            hover:border ${voice.name == selectedVoice && 'border'}`}
            onClick={()=> {setSelectedVoice(voice.name);
              onHandleInputChange('voice',voice.value)
            }}
            key={index}>{voice.name}</h2>
        ))}
      </div>
    </div>
  )
}

export default Voice
