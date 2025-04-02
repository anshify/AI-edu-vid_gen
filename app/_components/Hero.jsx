import { Button } from '@/components/ui/button'
import React from 'react'
import Authentication from './Authentication'

function Hero() {
  return (
    <div className='p-10 flex flex-col item-center justify-center
    mt-24 md:px-20 lg:px-36 xl:px-48'>
      <h2 className='font-bold text-6xl text-center'>AI Educational short video generator</h2>
      <p className='mt-4 text-2xl text-center text-gray-500'>learn complex concepts through story videos</p>
      <div className='mt-7 gap-8 flex justify-center'>
        <Button size="lg" variant="secondary">Explore</Button>

        <Authentication>
         <Button size="lg">Get Started</Button>
        </Authentication>
        
      </div>
    </div>
  )
}

export default Hero
