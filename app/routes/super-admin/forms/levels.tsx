import {
  Form,
  Link,
  NavLink,
  Outlet,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { active, inactive } from "~/components/utils/utils";
import { prisma } from "~/db.server";

type Level = {
  id: string;
  levelName: string;
};
export const meta: MetaFunction = () => {
  return {
    title: "Levels",
  };
};
export const loader: LoaderFunction = async () => {
  return prisma.level.findMany({
    where: { academic_year: { some: { isCurrent: true } } },
    orderBy: { levelName: "asc" },
  });
};
export default function () {
  const loaderData = useLoaderData();
  return (
    <div className="flex flex-row gap-4">
      <div>
        <ol className="w-fit">
          {loaderData.map((level: Level, index: number) => {
            return (
              <li className="flex flex-row justify-between p-2 my-2 bg-blue-400">
                <span className="p-2 space-x-4">
                  {" "}
                  <span>{index + 1})</span> <span>{level.levelName}</span>
                </span>
                <NavLink
                  className={(navData) =>
                    navData.isActive ? active : inactive
                  }
                  to={level.id}
                >
                  Assign
                </NavLink>
                {/* <Link
                  to={level.id}
                  className="px-8 py-2 bg-purple-600 rounded j"
                >
                  Assign
                </Link> */}
              </li>
            );
          })}
        </ol>
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
