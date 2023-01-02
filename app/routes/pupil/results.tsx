import MaterialTable from "@material-table/core";
import Table from "@material-ui/core/Table";
import { InsertEmoticon } from "@material-ui/icons";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  Button,
  Select,
} from "~/components/reUsableComponents/reusableFormComp";
import { tableIcons } from "~/components/utils/material-table";
import {
  modulo,
  noModulo,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
  buttonStyle,
} from "~/components/utils/utils";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
export const meta: MetaFunction = () => {
  return {
    title: "Results",
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  invariant(userId);
  const url = new URL(request.url).searchParams;
  const levelId = url.get("classId") as string;
  const testId = url.get("testId") as string;

  try {
    const level = await prisma.level.findMany({
      where: {
        user: { some: { userId } },
      },
      orderBy: { levelName: "asc" },
    });
    const test = await prisma.test.findMany({
      where: {
        level: { some: { academic_year: { some: { isCurrent: true } } } },
      },
    });
    if (levelId && testId) {
      const levelPayment = await prisma.levelUser.findMany({
        where: { userId, paymentStatus: "COMPLETED", levelId },
        include: { level: { include: { grade: true } } },
      });

      const grades = await prisma.grade.findMany({
        where: {
          studentId: userId,
          AND: [
            { test: { some: { id: testId } } },
            {
              level: {
                some: {
                  id: levelId,
                  user: { some: { paymentStatus: "COMPLETED" } },
                },
              },
            },
          ],
        },
        include: {
          level: { include: { subject: true, academic_year: true } },
          test: true,
        },
      });

      const avgGrade = await prisma.grade.aggregate({
        where: {
          AND: [
            { studentId: userId },
            {
              level: {
                some: {
                  id: levelId!,
                  user: { some: { paymentStatus: "COMPLETED" } },
                },
              },
            },
            { test: { some: { id: testId! } } },
          ],
        },
        _avg: {
          grade: true,
        },
      });

      return [grades, avgGrade, level, test, levelPayment];
    }
    return [[], { _avg: { grade: "" } }, level, test, []];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
type Item = {
  levelName: string;
  testName: string;
  id: string;
  code: string;
  subject_name: string;
  grade: number;
  graderId: string;
  studentId: string;

  test: [{ id: string; testName: string }];
  level: [
    {
      id: string;
      levelName: string;
      subject: [{ subjectName: string; code: string }];
      level: [];
    }
  ];
};

export default function () {
  const loaderData = useLoaderData();

  const avgScore = loaderData[1]._avg.grade ? loaderData[1]._avg.grade : 0;

  return (
    <div>
      <Form className="flex flex-row gap-3 my-5" method="get">
        <label htmlFor="class">
          <span>Select Class</span>
          <br />
          <select
            name="classId"
            id="class"
            className="px-1 py-1 bg-gray-200 border-2 rounded w-fit outline outline-1"
          >
            <option>--Select Level--</option>
            {loaderData[2] ? (
              loaderData[2].map((item: Item, index: number) => (
                <option key={index} value={item.id}>
                  {item.levelName}
                </option>
              ))
            ) : (
              <option></option>
            )}
          </select>
        </label>
        <label htmlFor="">
          <span>Select Test</span>
          <br />{" "}
          <select
            name="testId"
            id=""
            className="px-2 py-1 bg-gray-200 border-2 rounded w-fit outline outline-1"
          >
            <option>--Select Test--</option>
            {loaderData[3] ? (
              loaderData[3].map((item: Item, index: number) => (
                <option key={index} value={item.id}>
                  {item ? item.testName.toLocaleUpperCase() : ""}
                </option>
              ))
            ) : (
              <option></option>
            )}
          </select>
        </label>
        <button
          className={
            "  self-end capitalize bg-teal-600 py-1 px-4 text-xl transition text-gray-100  rounded-3xl"
          }
        >
          <span>Search</span>{" "}
        </button>
      </Form>
      <table className={tableStyle}>
        <caption className={tableCap}>Grades</caption>
        <thead className={tableHeadStyle}>
          <tr className={tableTrStyle}>
            <th className={tableThStyle + " text-left"}>No.</th>
            <th className={tableThStyle}>Code</th>
            <th className={tableThStyle}>Subject</th>
            <th className={tableThStyle}>Score</th>
          </tr>
        </thead>
        <tbody>
          {loaderData[0].length
            ? loaderData[0]
              ? loaderData[0].map((item: Item, index: number) => {
                  const subjCode = item.level[0].subject.reduce(
                    (filtered: string[], option) => {
                      if (option.subjectName === item.subject_name) {
                        filtered.push(option.code);
                      }
                      return filtered;
                    },
                    []
                  );

                  return (
                    <tr
                      key={index}
                      className={
                        index % 2 === 1 ? modulo + " text-white" : noModulo
                      }
                    >
                      <td className={td}>{index + 1}</td>
                      <td className={td}>{subjCode[0]}</td>
                      <td className={td}>{item.subject_name}</td>
                      <td className={td + " text-right"}>{item.grade}</td>
                    </tr>
                  );
                })
              : "No Results Available"
            : "Select Level and test"}

          <tr className="">
            <td>Total average score:</td>
            <td></td>
            <td></td>
            {
              <td
                style={{ textDecorationStyle: "double" }}
                className={td + "text-center underline"}
              >
                <span>{avgScore.toFixed(2)}</span>
              </td>
            }
          </tr>
        </tbody>
      </table>
      {/* <MaterialTable
        icons={tableIcons}
        data={data}
        title="Results"
        components={{
          Actions: () => <button className="bg-blue-700">View</button>,
        }}
        parentChildData={(row, rows) => rows.find((a) => a.id === row.parentId)}
        options={{
          searchAutoFocus: true,
          sorting: true,
          selection: true,
          showTextRowsSelected: true,
          isLoading: true,
          rowStyle: (data, index) =>
            index % 2 == 0
              ? {
                  backgroundColor: "#f5f5f5",
                }
              : null,
          headerStyle: { background: "rebeccapurple", color: "white" },
          showSelectAllCheckbox: true,
          searchFieldVariant: "outlined",
          filtering: true,
          pageSizeOptions: [10, 20, 50, 100],
          pageSize: 20,
          paginationType: "stepped",
          paginationPosition: "bottom",
          toolbar: true,
          exportAllData: true,
          addRowPosition: "first",
          actionsColumnIndex: -1,
          exportButton: true,
        }}
        columns={[
          { field: "subject_name", title: "Name" },
          { field: "grade", title: "Grade" },
          { field: "levelName", title: "Level" },
          { field: "testName", title: "Test" },
        ]}
      /> */}
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
}
