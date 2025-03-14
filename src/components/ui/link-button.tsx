"use client"
import React from 'react'
import { Button } from './button'
import { getAurinkoAuthUrl } from '@/lib/aurinko'

const linkButton = () => {
  return (
    <div>
      <Button onClick={
        async () => {
          const url = await getAurinkoAuthUrl('Google')
          console.log(url)
            window.location.href = url;
          ;}}>Link Account</Button>
    </div>
  )
}

export default linkButton;