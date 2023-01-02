import { useOptionalUser } from "~/utils";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { authUserByRole } from "~/models/user.server";
import { redirect } from "@remix-run/node";
import { useCatch } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return {
    title: "Result",
  };
};
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  invariant(userId);
  const user = await authUserByRole(userId);
  console.log(user);
  if (user?.role !== "TEACHER") return redirect("/");
  return null;
};
export default function Result() {
  const user = useOptionalUser();
  return (
    <div>{user?.email} {user?.isActive}</div>
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