import { undefined } from "zod";

import create from "zustand";
import { persist } from "zustand/middleware";
interface Id {
  levelId: string;
  getLevelId: (id: string) => void;
}

export const levelId = create<Id>()(
  persist(
    (set) => ({
      levelId: "",
      getLevelId: (id) => set((state) => ({ levelId: id })),
    }),
    { name: "levelId", getStorage: () => sessionStorage }
  )
);
