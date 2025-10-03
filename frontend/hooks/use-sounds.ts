"use client"

import { useCallback, useRef } from "react"

export function useSound(soundPath: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(soundPath)
      audioRef.current.volume = 0.5 // Set volume to 50%
    }

    // Reset and play
    audioRef.current.currentTime = 0
    audioRef.current.play().catch((error) => {
      console.error("[v0] Error playing sound:", error)
    })
  }, [soundPath])

  return { play }
}
