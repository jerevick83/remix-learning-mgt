import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  Form,
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { getUserProfileById } from "~/models/user.server";
import { deleteButton } from "~/components/utils/utils";
import { prisma } from "~/db.server";
import { ActionFunction, redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "Users",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const userId = params.userId;
  // invariant(userId, ()=>"user id is unavailable");
  const formData = await request.formData();
  const levelId = formData.get("classId") as string;
  const isPromo = await prisma.levelUser.findUnique({
    where: { levelId_userId: { userId, levelId } },
  });
  if (isPromo?.isPromoted) {
    const user = await prisma.levelUser.update({
      where: {
        levelId_userId: {
          userId,
          levelId,
        },
      },
      data: { isPromoted: false },
    });
  } else {
    const user = await prisma.levelUser.update({
      where: {
        levelId_userId: {
          userId,
          levelId,
        },
      },
      data: { isPromoted: true },
    });
  }

  return redirect(
    `/super-admin/staff/${params.userId}`
  );
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.userId, "User ID is missing");
  const id = params.userId;
  return await prisma.user.findUnique({
    where: { id },
    include: {
      level: {
        select: { isPromoted: true, level: true },
        orderBy: { level: { levelName: "asc" } },
      },
      profile: true,
    },
  });
};
export default function UserId() {
  const data = useLoaderData();
  const {
    email,
    id,
    role,
    profile: {
      firstname,
      lastname,
      other_name,
      gender,
      pob,
      dob,
      address,
      contact,
      nationality,
      phone,
    },
    level,
  } = data;

  const returned = level.map((item: string | any, index: number) => {
    return (
      <li key={index} className={"mr-3 flex list-inside mb-2 justify-between"}>
        <span className={"space-x-3"}>
          <span>{index + 1}:</span>
          <span>{item.level.levelName}</span>
        </span>
        <span>
          <Form method={"post"}>
            <input
              type="text"
              name={"classId"}
              readOnly
              value={item.level.id}
              hidden
            />
            <button className={deleteButton}>
              {item.isPromoted ? "UnBlock" : "Block"}
            </button>
          </Form>
        </span>
      </li>
    );
  });

  return (
    <div className={" bg-purple-100"}>
      <div className={"bg-gra-200 space-y-2 flex-1 p-2"}>
        <div>Profile</div>
        <h1 className="space-x-8">
          <span className={"font-bold"}>Name:</span>
          <span className={"space-x-3"}>
            <span>{firstname}</span>
            <span>{other_name}</span>
            <span>{lastname}</span>
          </span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Gender:</span>
          <span className={"capitalize"}>{gender}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Date of Birth:</span>
          <span className={"capitalize"}>{dob ? dob : ""}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Place of Birth:</span>
          <span className={"capitalize"}>{pob ? pob : ""}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Current Address:</span>
          <span className={"capitalize"}>{address ? address : ""}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Nationality:</span>
          <span className={"capitalize"}>{nationality ? nationality : ""}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Contact Number:</span>
          <span className={"capitalize"}>{phone ? phone : ""}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Email:</span>
          <span className={"capitalize"}>{email}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Current Role:</span>
          <span className={"capitalize"}>{role}</span>
        </h1>
        <h1 className="mb-5 space-x-5">
          <span className={"font-bold"}>Class:</span>
          <span className={"capitalize"}>
            <ol className={"list-outside"}>{returned}</ol>
          </span>
        </h1>
        <div className={"flex space-x-5"}>
          <Link
            className={
              "py-2 text-gray-100 bg-teal-400 w-fit rounded px-8 text-xl"
            }
            to={"profile/" + id!}
          >
            Assign Class
          </Link>
          <Link
            to={"status/" + id!}
            className={
              "py-2 text-gray-100 bg-teal-400 w-fit rounded px-8 text-xl"
            }
          >
            Change Status
          </Link>
          <Link
            to={"role/" + id!}
            className={
              "py-2 text-gray-100 bg-teal-400 w-fit rounded px-8 text-xl"
            }
          >
            Change Role
          </Link>
        </div>
      </div>
      <main className={"flex-1"}>
        <Outlet />
      </main>
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
