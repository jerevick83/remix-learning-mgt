
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  Button,
  FormInput,
} from "~/components/reUsableComponents/reusableFormComp";
import { buttonStyle, formStyle } from "~/components/utils/utils";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
export const meta: MetaFunction = () => {
  return {
    title: "Pupils Grade",
  };
};
export const action: ActionFunction = async ({ request, params }) => {
  const pupilId = params.pupilsId;
  const userId = (await requireUserId(request)) as string;
  // invariant([pupilId, userId],()=> "No id found");
  const formaData = await request.formData();
  const subject_name = formaData.get("subject") as string;
  const grade = Number(formaData.get("grade"));
  const testId = formaData.get("test") as string;
  try {
    const searchSubject = await prisma.grade.findFirst({
      where: {
        AND: [
          { subject_name },
          { studentId: pupilId },
          { graderId: userId },
          { test: { some: { id: testId } } },
        ],
      },
      include: { test: true },
    });
    if (searchSubject) {
      return json(
        {
          errors: "A grade for this subject and test have already been created",
        },
        { status: 400 }
      );
    }
    const loggedInUser = await prisma.levelUser.findMany({
      where: {
        userId,
        isPromoted: false,

        level: { academic_year: { some: { isCurrent: true } } },
      },
      include: { level: true },
    });
    // let levelId =
    //   loggedInUser.length &&
    //   loggedInUser[0].level.reduce((filtered: string[], option) => {
    //     if (!option.isPromoted) {
    //       filtered.push(option.levelId);
    //     }
    //     return filtered;
    //   }, []);

    await prisma.grade.create({
      data: {
        subject_name,
        grade,
        gradedBy: { connect: { id: userId } },
        student: { connect: { id: pupilId } },
        level: { connect: { id: loggedInUser[0].levelId } },
        test: { connect: { id: testId } },
      },
    });
    return redirect(`/teacher/pupils/pupils/${pupilId}/post_grades`);
  } catch (error) {}
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const pupilId = params.pupilsId;
  invariant(pupilId, "No pupil ID provided");
  const pupil = await prisma.user.findUnique({
    where: { id: pupilId },
    select: {
      profile: {
        select: { firstname: true, lastname: true, other_name: true },
      },
    },
  });
  const loggedInUser = await prisma.levelUser.findMany({
    where: {
      userId,
      isPromoted: false,
      level: { academic_year: { some: { isCurrent: true } } },
    },
    include: { level: true },
  });
  // let levelId =
  //   loggedInUser.length &&
  //   loggedInUser[0].level.reduce((filtered: string[], option) => {
  //     if (!option.isPromoted) {
  //       filtered.push(option.levelId);
  //     }
  //     return filtered;
  //   }, []);
  // loggedInUser.map((item) => {
  //   return item.level[0].levelId;
  // });

  const test = await prisma.test.findMany({
    where: {
      level: {
        some: {
          id: loggedInUser[0].levelId,
          academic_year: { some: { isCurrent: true } },
        },
      },
    },
  });
  const subjects = await prisma.subject.findMany({
    where: { level: { some: { id: loggedInUser[0].levelId } } },
  });
  return [test, subjects, pupil];
};

type Level = {
  id: string;
  name: string;
  subjectName: string;
  testName: string;
};
export default function () {
  const { submission } = useTransition();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const { firstname, other_name, lastname } = loaderData[2].profile;
  return (
    <div className="mt-4">
      <Form
        method="post"
        noValidate
        className={
          "flex sm:justify-items-start sm:flex-col flex-wrap space-y-4 border-4 p-2 "
        }
      >
        <h1 className="text-red-700">{actionData ? actionData.errors : ""}</h1>
        <fieldset className={formStyle}>
          <legend className={"capitalize text-3xl text-gray-500 px-2 "}>
            {" "}
            <span> Post grade for </span>{" "}
            <span className="space-x-3 font-bold underline">
              <span>{firstname}</span>
              <span>{other_name}</span>
              <span>{lastname}</span>
            </span>
          </legend>
          <label htmlFor="subjects">
            <span>Subject</span> <br />{" "}
            <select
              name="subject"
              className="w-10/12 px-2 py-1 bg-gray-200 border-2 rounded outline outline-1"
              id="subjects"
            >
              {loaderData[1].map((item: Level, index: number) => (
                <option key={index} value={item.subjectName}>
                  {item.subjectName.toLocaleUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <FormInput
            required
            min={0}
            max={100}
            id={"grade"}
            type={"number"}
            value={""}
            name={"grade"}
            label={"Test Score"}
          />
          <label htmlFor="test">
            <span>Test</span> <br />
            {""}
            <select
              name="test"
              className="w-10/12 px-2 py-1 bg-gray-200 border-2 rounded outline outline-1"
              id="test"
            >
              {loaderData[0].map((item: Level, index: number) => (
                <option key={index} value={item.id}>
                  {item.testName.toLocaleUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
        <Button
          value={["Post", "Posting"]}
          transition={!!submission}
          type="submit"
          style={buttonStyle}
        />
      </Form>
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
