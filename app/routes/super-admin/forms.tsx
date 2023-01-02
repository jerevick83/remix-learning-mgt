import {
  NavLink,
  Outlet,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { active, inactive } from "~/components/utils/utils";
import { ActionFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";

export const meta: MetaFunction = () => {
  return {
    title: "Forms",
  };
};
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const academic_year = formData.get("name") as string;
  try {
    await prisma.academicYear.create({ data: { academic_year } });
    return redirect("/super-admin/forms");
  } catch (e) {
    throw new Error("A similar academic year already exists");
  }
};

export const loader: LoaderFunction = async () => {
  return await prisma.academicYear.findMany();
};

export default function () {
  const { submission } = useTransition();
  const data = useLoaderData();
  return (
    <div className={"flex flex-col justify-between gap-y-4"}>
      <header className={"flex gap-x-4"}>
        <NavLink
          className={(navData) => (navData.isActive ? active : inactive)}
          to={"academic"}
        >
          Academic Year
        </NavLink>
        <NavLink
          className={(navData) => (navData.isActive ? active : inactive)}
          to={"levels"}
        >
          Levels
        </NavLink>
      </header>
      <main className="overflow-auto">
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
