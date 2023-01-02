import { NavLink, Outlet, useCatch } from "@remix-run/react";
import {
  active,
  dashboardDiv,
  dashboardMain,
  dashboardSec,
  dashboardSecNav,
  inactive,
  size,
} from "~/components/utils/utils";
import { BsFillBookFill } from "react-icons/bs";
import { AiFillBank, AiTwotoneNotification } from "react-icons/ai";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { authUserByRole } from "~/models/user.server";
import { redirect } from "@remix-run/node";
export const meta: MetaFunction = () => {
  return {
    title: "Pupil",
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  invariant(userId);
  const user = await authUserByRole(userId);
  if (user?.role !== "PUPIL") return redirect("/");
  return null;
};
export default function SuperAdmin() {
  return (
    <div className={dashboardDiv}>
      <section className={dashboardSec}>
        <nav className={dashboardSecNav}>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"results"}
          >
            <span>
              <BsFillBookFill size={size} />
            </span>
            <span>Result</span>
          </NavLink>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"payment"}
          >
            <span>
              <AiFillBank size={size} />
            </span>
            <span>Payments</span>
          </NavLink>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"announcement"}
          >
            <span>
              <AiTwotoneNotification size={size} />
            </span>
            <span> Announcements</span>
          </NavLink>
        </nav>
      </section>
      <main className={dashboardMain}>
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div> {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(` ${caught.status}`);
}
