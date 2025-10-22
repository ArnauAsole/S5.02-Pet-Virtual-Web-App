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
      "/images/creatures/races/men/turin.jpg",
      "/images/creatures/races/men/beren.jpg",
      "/images/creatures/races/men/hurin.jpg",
      "/images/creatures/races/men/tuor.jpg",
      "/images/creatures/races/men/eowyn.jpg",
      "/images/creatures/races/men/arwen_gondor.jpg",
      "/images/creatures/races/men/faramir.jpg",
      "/images/creatures/races/men/gondor_knight.jpg",
      "/images/creatures/races/men/numenorean.jpg",
      "/images/creatures/races/men/aragorn_ranger.jpg",
      "/images/creatures/races/men/boromir_warrior.jpg",
    ],
    elfs: [
      "/images/creatures/races/elfs/elf_archer.png",
      "/images/creatures/races/elfs/galadriel_warrior.jpg",
      "/images/creatures/races/elfs/arwen_elven.jpg",
      "/images/creatures/races/elfs/glorfindel.jpg",
      "/images/creatures/races/elfs/legolas_warrior.jpg",
      "/images/creatures/races/elfs/elrond_lord.jpg",
    ],
    maiar: [
      "/images/creatures/races/maiar/balrog.jpg",
      "/images/creatures/races/maiar/tom_bombadil.jpg",
      "/images/creatures/races/maiar/saruman.jpg",
      "/images/creatures/races/maiar/radagast.jpg",
      "/images/creatures/races/maiar/sauron.jpg",
      "/images/creatures/races/maiar/gandalf_grey.jpg",
      "/images/creatures/races/maiar/saruman_white.jpg",
      "/images/creatures/races/maiar/radagast_brown.jpg",
    ],
    hobbits: [
      "/images/creatures/races/hobbits/sam.jpg",
      "/images/creatures/races/hobbits/merry.jpg",
      "/images/creatures/races/hobbits/pippin.jpg",
      "/images/creatures/races/hobbits/bilbo.jpg",
      "/images/creatures/races/hobbits/frodo_ringbearer.jpg",
      "/images/creatures/races/hobbits/smeagol.jpg",
    ],
    orcs: [
      "/images/creatures/races/orcs/orc_warrior.jpeg",
      "/images/creatures/races/orcs/uruk_hai.jpg",
      "/images/creatures/races/orcs/orc_captain.jpg",
    ],
    dwarfs: [
      "/images/creatures/races/dwarfs/dwarf_warrior.webp",
      "/images/creatures/races/dwarfs/thorin.jpg",
      "/images/creatures/races/dwarfs/dwalin.jpg",
      "/images/creatures/races/dwarfs/balin.jpg",
      "/images/creatures/races/dwarfs/thrain.jpg",
      "/images/creatures/races/dwarfs/gimli.jpg",
      "/images/creatures/races/dwarfs/dain_ironfoot.jpg",
    ],
    others: [
      "/images/creatures/races/others/tarbejadil.jpg",
      "/images/creatures/races/others/rey_brujo_angmar.jpg",
      "/images/creatures/races/others/Witcher_king.png",
      "/images/creatures/races/others/tulkas.png",
      "/images/creatures/races/others/melkor.png",
      "/images/creatures/races/others/ancalagon.png",
      "/images/creatures/races/others/great_eagle.jpg",
      "/images/creatures/races/others/treebeard_ent.jpg",
      "/images/creatures/races/others/balrog_moria.jpg",
      "/images/creatures/races/others/warg_rider.jpg",
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
