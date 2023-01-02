import { Level } from "@prisma/client";
import {
  Form,
  NavLink,
  Outlet,
  useActionData,
  useCatch,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { profile } from "console";
import { url } from "inspector";
import { useState } from "react";
import { URLSearchParams } from "url";
import {
  Button,
  classList,
} from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle, inputStyle, Item } from "~/components/utils/utils";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Results",
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = new URL(request.url);
  const levelName = url.searchParams.get("level") as string;
  let userId = formData.getAll("userId") as string[];
  let levelId = formData.get("levelId") as string;

  // if (levelName === levelId)
  //   return json({
  //     error: "The selected pupil(s) is already enrolled in the selected level",
  //   });

  try {
    const usersLevel = await prisma.level.findUnique({
      where: { id: levelName },
      select: { levelName: true },
    });
    if (usersLevel) {
      switch (usersLevel.levelName!) {
        case "CLASS_1":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: { create: { level: { connect: { levelName: "CLASS_2" } } } },
              },
            });
          });
          break;
        case "CLASS_2":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: { create: { level: { connect: { levelName: "CLASS_3" } } } },
              },
            });
          });
          break;
        case "CLASS_3":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: { create: { level: { connect: { levelName: "CLASS_4" } } } },
              },
            });
          });
          break;
        case "CLASS_4":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: { create: { level: { connect: { levelName: "CLASS_5" } } } },
              },
            });
          });
          break;
        case "CLASS_5":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: { create: { level: { connect: { levelName: "CLASS_6" } } } },
              },
            });
          });
          break;
        case "NURSERY_1":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: {
                  create: { level: { connect: { levelName: "NURSERY_2" } } },
                },
              },
            });
          });
          break;
        case "NURSERY_2":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: {
                  create: { level: { connect: { levelName: "NURSERY_3" } } },
                },
              },
            });
          });
          break;
        case "NURSERY_3":
          userId.map(async (item: string) => {
            await prisma.levelUser.update({
              where: {
                levelId_userId: { levelId: levelName, userId: item },
              },
              data: { isPromoted: true },
            });
            await prisma.user.update({
              where: { id: item },
              data: {
                level: {
                  create: { level: { connect: { levelName: "CLASS_1" } } },
                },
              },
            });
          });
        default:
          break;
      }
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const nursery_1 = await prisma.level.findUnique({
    where: { levelName: "NURSERY_1" },
    select: { id: true },
  });
  const levelName = url.searchParams.get("level")
    ? url.searchParams.get("level")
    : nursery_1?.id;

  const pupils = await prisma.levelUser.findMany({
    where: {
      levelId: levelName!,
      isPromoted: false,
      user: { role: "PUPIL" },
    },
    include: { user: { include: { profile: true } }, level: true },
  });

  const level = await prisma.level.findMany();
  return [pupils, level];
};
export default function () {
  const { submission } = useTransition();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  let levName = loaderData[2];
  const [dat, setDat] = useState(false);
  const load = loaderData[0][0] ? loaderData[0][0].level.levelName : "";
  const datFxn = (event:{target:{checked:boolean}}) => {
    if (event.target.checked) {
      return setDat(true);
    }
    return setDat(false);
  };

  const data =
    loaderData[0].length > 0
      ? loaderData[0].map((item: string | any, index: number) => {
          const {
            levelId,
            user: {
              id,
              profile: { firstname, other_name, lastname },
            },
          } = item;
          return (
            <div
              key={index}
              className="flex flex-row w-full space-x-4 space-y-1"
            >
              <span className="mt-1">{index + 1})</span>
              <span>
                <label htmlFor={id} className="flex flex-row space-x-3">
                  <input
                    type="checkbox"
                    readOnly
                    value={id}
                    name="userId"
                    onChange={datFxn}
                  />
                  <h1 className="px-3 text-white bg-slate-500">{`${firstname} ${other_name} ${lastname} `}</h1>
                </label>
              </span>
            </div>
          );
        })
      : "";

  return (
    <div>
      <nav>
        <NavLink to={""}></NavLink>
      </nav>
      <div>
        <Form method="get" className="space-x-3">
          <h1 className={"text-red-700"}>
            {actionData ? actionData.error : ""}
          </h1>
          <select
            name="level"
            id=""
            className={
              "w-10/12 rounded border-2 bg-gray-200 py-2.5 px-2 outline outline-1 "
            }
          >
            {loaderData[1]
              ? loaderData[1].map((item: Item, index: number) => {
                  return (
                    <option key={index} value={item.id}>
                      {item.levelName}
                    </option>
                  );
                })
              : ""}
          </select>
          <Button
            style={buttonStyle}
            transition={!!submission}
            type="submit"
            value={["Search", "Searching"]}
          />
        </Form>
      </div>
      <div className="p-2 mt-4 border-2">
        <div
          className={
            load === "CLASS_1"
              ? "bg-green-300"
              : load === "CLASS_2"
              ? "bg-yellow-300"
              : load === "CLASS_3"
              ? "bg-blue-300"
              : load === "CLASS_4"
              ? "bg-purple-300"
              : load === "CLASS_5"
              ? "bg-teal-300"
              : load === "CLASS_6"
              ? "bg-amber-300"
              : load === "NURSERY_1"
              ? "bg-orange-300"
              : load === "NURSERY_2"
              ? "bg-lime-300"
              : load === "NURSERY_3"
              ? "bg-red-300"
              : "bg-red-300"
          }
        >
          {" "}
          {loaderData[0][0] ? (
            <h1 className="p-2 text-2xl">
              List of Pupil(s) in{" "}
              {loaderData[0][0] ? loaderData[0][0].level.levelName : ""}
            </h1>
          ) : (
            <p>No enrolled pupil in this level</p>
          )}
        </div>
        <Form method="post">
          <div className="py-2 pl-1 mb-3">
            <input
              type="text"
              name="levelId"
              value={loaderData[0][0] ? loaderData[0].levelId : ""}
              readOnly
              hidden
            />
            {data.length ? <span>{data}</span> : ""}
          </div>

          <button
            className={buttonStyle}
            disabled={data.length && dat ? false : true}
          >
            Save
          </button>
        </Form>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div className={"text-red-600"}>{error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
