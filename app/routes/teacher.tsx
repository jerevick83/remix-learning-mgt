import { NavLink, Outlet, useCatch } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { logout, requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { authUserByRole } from "~/models/user.server";
import { redirect } from "@remix-run/node";
import {
  active,
  dashboardDiv,
  dashboardMain,
  dashboardSec,
  dashboardSecNav,
  inactive,
  size
} from "~/components/utils/utils";
import { BsFillBookFill, BsFillPeopleFill, BsFillPersonBadgeFill } from "react-icons/bs";
import { AiFillBank, AiTwotoneNotification } from "react-icons/ai";
export const meta: MetaFunction = () => {
  return {
    title: "Dashboard",
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  invariant(userId);
  const user = await authUserByRole(userId);
  if (user?.role !== "TEACHER" || user?.isActive===false) return redirect("/")
  return null;
};
export default function Pupil() {
  return <>
    <div className={dashboardDiv}>
      <section className={dashboardSec}>
        <nav className={dashboardSecNav}>
          <NavLink className={navData => navData.isActive ? active : inactive} to={"result"}><span><BsFillBookFill
            size={size} /></span><span>Result</span></NavLink>
          <NavLink className={navData => navData.isActive ? active : inactive} to={"pupils"}><span><BsFillPeopleFill
            size={size} /></span><span>Pupils</span></NavLink>
          <NavLink className={navData => navData.isActive ? active : inactive} to={"staff"}><span><BsFillPersonBadgeFill
            size={size} /></span><span>Staff</span></NavLink>
          <NavLink className={navData => navData.isActive ? active : inactive} to={"grades"}><span><AiFillBank
            size={size} /></span><span>Grades</span></NavLink>
          <NavLink className={navData => navData.isActive ? active : inactive}
                   to={"announcement"}><span><AiTwotoneNotification
            size={size} /></span><span> Announcements</span></NavLink>
          {/* <NavLink className={navData => navData.isActive ? active : inactive}
                   to={"add_user"}><span><AiTwotoneNotification size={size} /></span><span> Add  User</span></NavLink> */}
          {/* <NavLink className={navData => navData.isActive ? active : inactive}
                   to={"$usersId"}><span><AiTwotoneNotification size={size} /></span><span>Users</span></NavLink> */}
        </nav>
      </section>
      <main className={dashboardMain}><Outlet /></main>
    </div>
  </>;
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
