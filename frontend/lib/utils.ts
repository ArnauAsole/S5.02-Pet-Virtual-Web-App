import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAllProfileImages(): string[] {
  return [
    "/images/profiles/aragorn.jpg",
    "/images/profiles/arwen.jpg",
    "/images/profiles/gandalf.jpg",
    "/images/profiles/legolas.jpg",
    "/images/profiles/gimli.jpg",
    "/images/profiles/frodo.jpg",
    "/images/profiles/galadriel.jpg",
    "/images/profiles/elrond.jpg",
  ]
}

export function getRandomProfileImage(): string {
  const images = getAllProfileImages()
  return images[Math.floor(Math.random() * images.length)]
}

export function getAllImagesForRace(race: string): string[] {
  const raceImages: Record<string, string[]> = {
    men: [
      "/images/creatures/races/men/gondorian_elite.png",
      "/images/creatures/races/men/numenorean_warrior.jpg",
      "/images/creatures/races/men/turin_turambar.png",
    ],
    elfs: [
      "/images/creatures/races/elfs/elf_archer.png",
      "/images/creatures/races/elfs/arwen_warrior.png",
      "/images/creatures/races/elfs/glorfindel.png",
      "/images/creatures/races/elfs/fingolfin.png",
    ],
    maiar: [
      "/images/creatures/races/maiar/balrog.jpg",
      "/images/creatures/races/maiar/tom_bombadil.jpg",
      "/images/creatures/races/maiar/saruman.jpg",
      "/images/creatures/races/maiar/radagast.jpg",
      "/images/creatures/races/maiar/sauron.jpg",
    ],
    hobbits: [
      "/images/creatures/races/hobbits/hobbit.jpg",
      "/images/creatures/races/hobbits/sam.jpg",
      "/images/creatures/races/hobbits/merry.jpg",
      "/images/creatures/races/hobbits/pippin.jpg",
    ],
    orcs: [
      "/images/creatures/races/orcs/orc_osgiliath.png",
      "/images/creatures/races/orcs/cirith_ungol_orc.png",
      "/images/creatures/races/orcs/lurtz.png",
    ],
    dwarfs: [
      "/images/creatures/races/dwarfs/dwarf_warrior.webp",
      "/images/creatures/races/dwarfs/thorin.jpg",
      "/images/creatures/races/dwarfs/dwalin.jpg",
      "/images/creatures/races/dwarfs/balin.jpg",
    ],
    others: [
      "/images/creatures/races/others/tombombadil.jpg",
      "/images/creatures/races/others/rey_brujo_angmar.jpg",
      "/images/creatures/races/others/Witcher_king.png",
      "/images/creatures/races/others/tulkas.png",
      "/images/creatures/races/others/melkor.png",
      "/images/creatures/races/others/ancalagon.png",
    ],
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
