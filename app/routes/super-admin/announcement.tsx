import { useCatch } from "@remix-run/react";
import { MetaFunction } from "@remix-run/server-runtime";
export const meta: MetaFunction = () => {
  return {
    title: "Announcement",
  };
};
export default function Pupils() {
  return (
    <div>Announcements</div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div className={"text"}> {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`${caught.status}`);
}
