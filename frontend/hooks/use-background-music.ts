"use client"

import { useEffect, useRef } from "react"

export function useBackgroundMusic(enabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    audioRef.current = new Audio("https://blobs.vusercontent.net/blob/tolkiensoundtrack-U3YgaUKxtvznUamdxFEmZQU7jcHKZd.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.3

    const playAudio = async () => {
      try {
        await audioRef.current?.play()
      } catch (error) {
        // Autoplay blocked by browser, user needs to interact first
      }
    }

    playAudio()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
    }
  }, [enabled])

  return audioRef
}
