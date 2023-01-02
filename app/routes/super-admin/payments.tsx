import { NavLink, Outlet, useCatch } from "@remix-run/react";
import { MetaFunction } from "@remix-run/server-runtime";
import { active, inactive } from "~/components/utils/utils";
export const meta: MetaFunction = () => {
  return {
    title: "Payments",
  };
};
export default function Pupils() {
  return (
    <div>
      <section>
        <nav className="flex gap-4 ">
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"invoice"}
          >
            Set Invoice
          </NavLink>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"feesPaid"}
          >
            View Fees Payment
          </NavLink>
        </nav>
      </section>
      <main className="w-full overflow-auto">
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
