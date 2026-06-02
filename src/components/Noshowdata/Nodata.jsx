import Image from 'next/image'
import React from 'react'
import nodata from "@/components/assets/images/no_show.png"
export default function Nodata({title}) {
  return (
    <div className='flex justify-center flex-col items-center  min-h-[50vh]'>
        <Image height={200} width={200} src={nodata} />
        <h5 className='mt-3 sf-pro-bold text-xl'>{title}</h5>
    </div>
  )
}
