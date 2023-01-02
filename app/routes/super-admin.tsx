import { useOptionalUser } from "~/utils";
import { NavLink, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import {
  active,
  dashboardDiv,
  dashboardMain,
  dashboardSec,
  dashboardSecNav,
  inactive,
  size,
} from "~/components/utils/utils";
import {
  BsFillBookFill,
  BsFillPeopleFill,
  BsFillPersonBadgeFill,
} from "react-icons/bs";
import { AiFillBank, AiTwotoneNotification } from "react-icons/ai";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { authUserByRole } from "~/models/user.server";
import { redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Super Admin",
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  invariant(userId);
  try {
    const user = await authUserByRole(userId);
    if (user?.role !== "SUPER_ADMIN") return redirect("/");

    return await prisma.user.count();
  } catch (error) {}
};
export default function SuperAdmin() {
  const user = useOptionalUser();
  const loaderData = useLoaderData();
  return (
    <div className={dashboardDiv+" bg-slate-100"}>
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
            to={"pupils"}
          >
            <span>
              <BsFillPeopleFill size={size} />
            </span>
            <span>Pupils</span>
          </NavLink>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"staff"}
          >
            <span>
              <BsFillPersonBadgeFill size={size} />
            </span>
            <span>Staff</span>
          </NavLink>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"payments"}
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
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"add_user"}
          >
            <span>
              <AiTwotoneNotification size={size} />
            </span>
            <span> Add User</span>
          </NavLink>

          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"levels"}
          >
            <span>
              <AiTwotoneNotification size={size} />
            </span>
            <span>Create Level</span>
          </NavLink>
          <NavLink
            className={(navData) => (navData.isActive ? active : inactive)}
            to={"forms"}
          >
            <span>
              <AiTwotoneNotification size={size} />
            </span>
            <span>Forms</span>
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
