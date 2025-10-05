"use client"

import { useCallback } from "react"

export function useSoundEffect(soundPath: string) {
  const play = useCallback(() => {
    const audio = new Audio(soundPath)
    audio.volume = 0.6 // 60% volume for sound effects
    audio.play().catch((error) => {
      console.log("[v0] Sound effect play failed:", error)
    })
  }, [soundPath])

  return play
}
