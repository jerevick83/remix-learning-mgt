import { NavLink, Outlet, useCatch, useParams, useSearchParams } from "@remix-run/react";
import { MetaFunction } from "@remix-run/server-runtime";
import { active, inactive } from "~/components/utils/utils";
export const meta: MetaFunction = () => {
  return {
    title: "Test",
  };
};
export default function () {
const {levelsId} = useParams()
  return (
    <div className="mt-2">
      <nav className="flex flex-row gap-2">
        {/* <NavLink
          className={(navData) => (navData.isActive ? active : inactive)}
          to={"/super-admin/forms/levels/"+levelsId}
        >Subjects</NavLink> */}
        <NavLink
          className={(navData) => (navData.isActive ? active : inactive)}
          to={"test"}
        >Tests</NavLink>
      </nav>

      <main>
        <Outlet/>
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