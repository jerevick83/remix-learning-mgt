import { useCatch, useLoaderData } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Super Admin",
  };
};
export const loader: LoaderFunction = async () => {
  const pupils = await prisma.user.count({
    where: { role: "PUPIL", NOT: { profile: null } },
  });
  const staff = await prisma.user.count({
    where: {
      OR: [{ role: "ADMIN" }, { role: "SUPER_ADMIN" }, { role: "TEACHER" }],
      NOT: { profile: null },
    },
  });
  const pupil_cls1 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "CLASS_1" } } },
    },
  });
  const pupil_cls2 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "CLASS_2" } } },
    },
  });
  const pupil_cls3 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "CLASS_3" } } },
    },
  });
  const pupil_cls4 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "CLASS_4" } } },
    },
  });
  const pupil_cls5 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "CLASS_5" } } },
    },
  });
  const pupil_cls6 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "CLASS_6" } } },
    },
  });
  const NURSERY_1 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "NURSERY_1" } } },
    },
  });
  const nursery_2 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "NURSERY_2" } } },
    },
  });
  const nursery_3 = await prisma.user.count({
    where: {
      role: "PUPIL",
      NOT: { profile: null },
      level: { some: { isPromoted: false, level: { name: "NURSERY_3" } } },
    },
  });
  return [
    pupils,
    staff,
    pupil_cls1,
    pupil_cls2,
    pupil_cls3,
    pupil_cls4,
    pupil_cls5,
    pupil_cls6,
    NURSERY_1,
    nursery_2,
    nursery_3,
  ];
};
export default function SuperAdmin() {
  const users = useLoaderData();
  return (
    <div>
      {" "}
      <div>
        <h1>
          <span>Total Number of Staff: </span>
          <span>{users[1]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils: </span>
          <span>{users[0]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Class 1: </span>
          <span>{users[2]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Class 2: </span>
          <span>{users[3]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Class 3: </span>
          <span>{users[4]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Class 4: </span>
          <span>{users[5]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Class 5: </span>
          <span>{users[6]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Class 6: </span>
          <span>{users[7]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Nursery 1: </span>
          <span>{users[8]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Nursery 2: </span>
          <span>{users[9]}</span>
        </h1>
      </div>
      <div>
        <h1>
          <span>Total Number of Pupils in Nursery 3: </span>
          <span>{users[10]}</span>
        </h1>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className={"text-red-600"}>
      {"This User Has not updated his/her status"}
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
