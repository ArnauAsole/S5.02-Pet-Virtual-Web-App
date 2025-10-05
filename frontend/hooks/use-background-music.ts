"use client"

import { useEffect, useRef } from "react"

export function useBackgroundMusic(enabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Create audio element
    audioRef.current = new Audio("https://blobs.vusercontent.net/blob/tolkiensoundtrack-U3YgaUKxtvznUamdxFEmZQU7jcHKZd.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.3 // 30% volume for background music

    // Play audio
    const playAudio = async () => {
      try {
        await audioRef.current?.play()
        console.log("[v0] Background music started")
      } catch (error) {
        console.log("[v0] Background music autoplay blocked:", error)
      }
    }

    playAudio()

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
        console.log("[v0] Background music stopped")
      }
    }
  }, [enabled])

  return audioRef
}
