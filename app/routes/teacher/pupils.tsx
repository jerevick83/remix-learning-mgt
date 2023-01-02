import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { N } from "vitest/dist/global-e98f203b";
import {
  actionTd,
  deleteButton,
  modulo,
  noModulo,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableThStyle,
  tableTrStyle,
  td,
  viewLink,
} from "~/components/utils/utils";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import Box from "@mui/material/Box";
import { DataGrid, GridApi, GridCellValue, GridColDef, GridEventListener, GridValueGetterParams, useGridApiContext, useGridApiEventHandler } from "@mui/x-data-grid";
import { useRef, useState } from "react";
import { Button } from "@mui/material";
export const meta: MetaFunction = () => {
  return {
    title: "Pupils",
  };
};
const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90, hideable: true },
  // {
  //   field: 'firstName',
  //   headerName: 'First name',
  //   width: 150,
  //   editable: true,
  // },
  // {
  //   field: 'other_name',
  //   headerName: 'Other Name(s)',
  //   width: 150,
  //   editable: true,
  // },
  // {
  //   field: 'lastName',
  //   headerName: 'Lastname',
  //   width: 150,
  //   editable: true,
  // },
  // {
  //   field: 'age',
  //   headerName: 'Age',
  //   type: 'number',
  //   width: 110,
  //   editable: true,
  // },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: true,
    width: 500,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstname || ""} ${params.row.other_name || ""} ${
        params.row.lastname || ""
      }`,
  },
];
export const loader: LoaderFunction = async ({ request }) => {
  const id = await requireUserId(request);
  invariant(id);
  const loggedInUserLevelId = await prisma.levelUser.findMany({
    where: {
      userId: id,
      isPromoted: false,
      level: { academic_year: { some: { isCurrent: true } } },
    },
    select: { levelId: true },
  });

  if (loggedInUserLevelId.length > 0) {
    return await prisma.user.findMany({
      where: {
        isActive: true,
        role: "PUPIL",
        level: {
          some: {
            AND: {
              isPromoted: false,
            },
            level: { id: String(loggedInUserLevelId[0].levelId) },
          },
        },
      },
      include: { level: { select: { level: true } }, profile: true },
      orderBy: { profile: { lastname: "asc" } },
    });
  } else return [];
};

type User = {
  id: string;
  profile: {
    lastname: string;
    other_name: string;
    firstname: string;
  };
};

export default function Pupils() {
const apiRef=useRef()
const handleEvent: GridEventListener<'rowSelectionCheckboxChange'> = (
  params,  // GridRowSelectionCheckboxParams
  event,   // MuiEvent<React.ChangeEvent<HTMLElement>>
  details, // GridCallbackDetails
) => {}

// Imperative subscription


// Hook subscription (only available inside the scope of the grid)


  const loaderData = useLoaderData();
  const data = loaderData.map((item: User, index: number) => {
    const {
      id,
      profile: { firstname, other_name, lastname },
    } = item;
    return { id, firstname, other_name, lastname };
  });

  return (
    <>
      <div className="-2">
        <div className={"flex-1 mr-2 p-2 "}>
          {/* <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid

              initialState={{
                columns: {
                  columnVisibilityModel: {
                    id: false,
                  },
                },
              }}
              rows={data}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              disableSelectionOnClick
              experimentalFeatures={{ newEditingApi: true }}
            />
          </Box> */}
          <table className={tableStyle}>
            <caption className={tableCap}>Administrative Staff</caption>
            <thead className={tableHeadStyle}>
              <tr className={tableTrStyle}>
                <th className={tableThStyle}>Lastname</th>
                <th className={tableThStyle}>Other Name(s)</th>
                <th className={tableThStyle}>Firstname</th>
                <th className={tableThStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loaderData.length
                ? loaderData.map((user: any, index: number) => {
                    return (
                      <tr
                        key={index}
                        className={index % 2 === 1 ? modulo : noModulo}
                      >
                        <td className={td}>{user.profile.lastname}</td>
                        <td className={td}>{user.profile.other_name}</td>
                        <td className={td}>{user.profile.firstname}</td>
                        <td className={actionTd}>
                          <span>
                            <Link
                              prefetch={"intent"}
                              to={"pupils/" + user.id}
                              className={viewLink}
                            >
                              View{" "}
                            </Link>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                : "No pupils found"}
            </tbody>
          </table>
        </div>

        <main className="ml-2">
          <Outlet />
        </main>
      </div>
    </>
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
