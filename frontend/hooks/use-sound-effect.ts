"use client"

import { useCallback } from "react"

export function useSoundEffect(soundPath: string) {
  const play = useCallback(() => {
    const audio = new Audio(soundPath)
    audio.volume = 0.6
    audio.play().catch(() => {
      // Sound play failed, likely due to browser autoplay policy
    })
  }, [soundPath])

  return play
}
