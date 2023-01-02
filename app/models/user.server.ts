import type { Password, User, Level, Profile } from "@prisma/client";

import { json } from "@remix-run/server-runtime";

import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { ProfileProp } from "~/models/pupils.server";

export type { User, Password, Profile } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export type ClassProp = {
  name: Level["levelName"];
};

export async function createUser(email: User["email"], role: User["role"]) {
  let hashedPassword;
  if (role === "PUPIL") {
    hashedPassword = await bcrypt.hash("pupilcps", 10);
  } else {
    hashedPassword = await bcrypt.hash("staffcps", 10);
  }

  try {
    const user = prisma.user.create({
      data: {
        email,
        role,

        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
    if (!user) {
      throw new Error("a user with the given email already exists");
    }
    return user;
  } catch (e) {
    throw new Error("a user with the given email already exists");
  }
}

export const updateUserLevel = async (id: User["id"], level: Level["levelName"]) => {
  return await prisma.user.update({
    where: { id },
    data: {
      level: {},
    },
  });
};

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }
  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: {
      OR: [{ role: "SUPER_ADMIN" }, { role: "ADMIN" }, { role: "TEACHER" }],
      NOT: { profile: null },
    },
    include: { profile: true },
    orderBy: { createdAt: "asc" },
  });
};

export const getUserProfileById = async (id: User["id"]) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
    },
  });
};

export const authUserByRole = async (id: User["id"]) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { role: true, isActive: true },
  });
};

export const levelCreate = async (name: Level["levelName"]) => {
  try {
    await prisma.level.create({
      data: {
        levelName: name,
      },
    });
  } catch (e) {
    if (e instanceof Error) throw new Error("Similar course have been created");
  }
};
export const getAllCourses = async () => {
  try {
    return await prisma.level.findMany({ orderBy: { levelName: "asc" } });
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

export const deletePupilById = async (id: User["id"]) => {
  return await prisma.user.delete({ where: { id } });
};

export const editUserStatus = async (
  id: User["id"],
  status: User["isActive"]
) => {
  const returnedCourse = await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive: status,
    },
  });
};

export type ProfileProps = {
  dob: ProfileProp["dob"];
  pob: ProfileProp["pob"];
  address: ProfileProp["address"];
  phone: ProfileProp["phone"];
  nationality: ProfileProp["nationality"];
  userId: User["id"];
  gender: Profile["gender"];
  firstname: Profile["firstname"];
  other_name: Profile["other_name"];
  lastname: Profile["lastname"];
};
export const updateProfile = async ({
  nationality,
  dob,
  pob,
  address,
  phone,
  userId,
  gender,
  firstname,
  other_name,
  lastname,
}: ProfileProps) => {
  try {
    return await prisma.profile.create({
      data: {
        firstname,
        gender,
        other_name,
        lastname,
        nationality,
        dob,
        pob,
        address,
        phone,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  } catch (e) {
    if (e instanceof Error)
      throw new Error("A User with the ID already exists\n" + e.message);
  }
};
