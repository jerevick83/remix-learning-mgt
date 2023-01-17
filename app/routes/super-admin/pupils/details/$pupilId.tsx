import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { deleteButton } from "~/components/utils/utils";
import { prisma } from "~/db.server";
export const meta: MetaFunction = () => {
  return {
    title: "Pupil",
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = params.pupilId;
  // invariant(userId,()=> "Invalid user ID provided");
  const formData = await request.formData();
  const levelId = formData.get("levelId") as string;

  try {
    await prisma.levelUser.delete({
      where: { levelId_userId: { userId, levelId } },
    });
    return redirect(`/super-admin/pupils/details/${userId}`);
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.pupilId;
  invariant(id, "ID cannot be empty");
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        level: {
          select: { level: true, isPromoted: true },
          orderBy: { level: { levelName: "asc" } },
        },
        profile: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};
const space = "space-x-8";
export default function PupilId() {
  const loaderData = useLoaderData();
  const {
    email,
    role,
    profile: {
      firstname,
      other_name,
      gender,
      lastname,
      dob,
      pob,
      address,
      phone,
      nationality,
    },
    level,
  } = loaderData
    ? loaderData
    : {
        email: "",
        role: "",
        profile: {
          firstname: "",
          other_name: "",
          gender: "",
          lastname: "",
          dob: "",
          pob: "",
          address: "",
          phone: "",
          nationality: "",
        },
        level: [],
      };
  const levelNames = level.sort().map((element: any, index: number) => {
    const {
      isPromoted,
      level: { id, levelName },
    } = element
      ? element
      : {
          isPromoted: "",
          level: { id: "", levelName: "" },
        };

    return (
      <li
        key={index}
        className="flex flex-row justify-between space-x-3 bg-yellow-200 "
      >
        <span className="space-x-3">
          <span>{index + 1}:</span>
          <span>{levelName}</span>
        </span>
        <span>
          <Form method="post">
            <input type="text" name="levelId" defaultValue={id} hidden />
            <button
              disabled={!!isPromoted}
              type="submit"
              className={deleteButton}
            >
              {isPromoted ? "Promoted" : "Delete from level"}
            </button>
          </Form>
        </span>
      </li>
    );
  });
  return (
    <div>
      <div className="mb-8">
        {" "}
        <h1 className={space}>
          <span className="font-bold">Name:</span>
          <span className={"space-x-3"}>
            <span>{firstname}</span>
            <span>{other_name}</span>
            <span>{lastname}</span>
          </span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Gender:</span>
          <span>{gender}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Date of Birth:</span>
          <span>{dob}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Place of Birth:</span>
          <span>{pob}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Phone:</span>
          <span>{phone}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Address:</span>
          <span>{address}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Email:</span>
          <span>{email}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Nationality:</span>
          <span>{nationality}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold">Role:</span>
          <span>{role}</span>
        </h1>
        <h1 className={space}>
          <span className="font-bold w-36">Current Level:</span>
          <span>
            <span></span>
            <ol className="w-5/12 space-y-1">{levelNames}</ol>
          </span>
        </h1>
      </div>
      <div className="mb-5">
        <Link
          to={`level/${loaderData.id}`}
          className="px-5 py-3 bg-teal-400 rounded"
        >
          Assign Level
        </Link>
      </div>
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
