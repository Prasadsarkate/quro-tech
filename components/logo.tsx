"use client"

import React, { useState } from "react"

type Props = {
  className?: string
}

export default function Logo({ className }: Props) {
  const [src, setSrc] = useState('/images/quro-logo.jpg')
  const onError = () => setSrc('/images/placeholder-logo.png')
  return <img src={src} alt="Quro Tech logo" className={className} onError={onError} />
}
