import { NavLink, Outlet, useCatch } from "@remix-run/react";
import { MetaFunction } from "@remix-run/server-runtime";
import { BsFillBookFill } from "react-icons/bs";
import { active, inactive, size } from "~/components/utils/utils";
export const meta: MetaFunction = () => {
  return {
    title: "Pupils"
  };
};
export default function () {
  return (
    <div>
      <nav className="flex space-x-4">
        <NavLink
          className={(navData) => (navData.isActive ? active : inactive)}
          to={"result"}
        >
          <span>
            <BsFillBookFill size={size} />
          </span>
          <span>Result</span>
        </NavLink>
        <NavLink
          className={(navData) => (navData.isActive ? active : inactive)}
          to={"post_grades"}
        >
          <span>
            <BsFillBookFill size={size} />
          </span>
          <span>Post Grades</span>
        </NavLink>
      </nav>
      <main>
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
