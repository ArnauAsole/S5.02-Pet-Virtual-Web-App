import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAllImagesForRace(race: string): string[] {
  const raceImages: Record<string, string[]> = {
    men: ["/images/creatures/races/men/gondorian_elite.png", "/images/creatures/races/men/numenorean_warrior.jpg"],
    elfs: ["/images/creatures/races/elfs/elf_archer.png"],
    maiar: ["/images/creatures/races/maiar/balrog.jpg", "/images/creatures/races/maiar/tom_bombadil.jpg"],
    hobbits: ["/images/creatures/races/hobbits/bilbo.jpg"],
    orcs: ["/images/creatures/races/orcs/orc_warrior.jpeg"],
    dwarfs: ["/images/creatures/races/dwarfs/dwarf_warrior.webp"],
    others: ["/mystical-griffon.png"],
  }

  const raceMap: Record<string, string> = {
    Man: "men",
    Men: "men",
    Elf: "elfs",
    Elfs: "elfs",
    Maiar: "maiar",
    Maia: "maiar",
    Hobbit: "hobbits",
    Hobbits: "hobbits",
    Orc: "orcs",
    Orcs: "orcs",
    Dwarf: "dwarfs",
    Dwarfs: "dwarfs",
    Other: "others",
    Others: "others",
    Ent: "others",
  }

  const folder = raceMap[race] || "others"
  return raceImages[folder] || raceImages.others
}

export function getCreatureImageByRace(race: string): string {
  const images = getAllImagesForRace(race)
  const randomIndex = Math.floor(Math.random() * images.length)
  return images[randomIndex]
}
