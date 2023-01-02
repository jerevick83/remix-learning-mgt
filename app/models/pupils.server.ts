import type { Profile, User } from "@prisma/client";

import { prisma } from "~/db.server";


export type { User, Profile, Grade } from "@prisma/client";

export type ProfileProp = {
  gender: Profile["gender"]
  pob: Profile["pob"]
  dob: Profile["dob"]
  address: Profile["address"]
  nationality: Profile["nationality"]
  phone: Profile["phone"]
  userId: User["id"]
}

// export type GradeProps ={
//   id:Profile["id"]
//   subject : Grade["subject"]
//   level: Grade["level"]
//   term : Grade["term"]
//   test:Grade["test"]
//   acad_yr:Grade["acad_yr"]
//   assignedBy:Grade["assignedBy"]
//   grade: Grade["grade"]
// }


export async function getAllPupils() {
  try {
    return await prisma.user.findMany({
      where: { role: "PUPIL", NOT: { profile: null } },
      include: {
        profile: true
      },
      orderBy: { profile:{firstname: "asc"} }
    });
  } catch (e) {
    throw new Error("A user already exists");
  }
}

// export const createGradeById = async ( level:GradeProps["level"], subject:GradeProps["subject"], term:GradeProps["term"], test:GradeProps["test"], grade:GradeProps["grade"], assignedBy:GradeProps["assignedBy"], acad_yr:GradeProps["acad_yr"], $pupilId:GradeProps["id"]) => {


// }

// createPupil()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })