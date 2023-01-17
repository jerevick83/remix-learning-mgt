import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  Button,
  FormInput,
  Select,
} from "~/components/reUsableComponents/reusableFormComp";
import {
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import {
  buttonStyle,
  formStyle,
  inputStyle,
  Item,
  modulo,
  noModulo,
  tableCap,
  tableHeadStyle,
  tableStyle,
  tableTdActStyle,
  tableTrStyle,
  td,
} from "~/components/utils/utils";
import { ActionFunction } from "@remix-run/node";
import { Invoice } from "@prisma/client";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import AlertTitle from "@mui/material/AlertTitle";
export const meta: MetaFunction = () => {
  return {
    title: "Invoice",
  };
};
export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  // invariant(userId, ()=>"Id not available");
  const formData = await request.formData();
  const amount = Number(formData.get("amount")) as Invoice["amount"];
  const level = formData.get("levelId") as string;
  const delInvId = formData.get("invoiceDelId") as string;
  const delInvLevId = formData.get("invoiceLevelDelId") as string;
  const url = new URL(request.url).searchParams;
  const levelId = url.get("invoiceLevelId") as string;
  const invoiceId = url.get("invoiceId") as string;

  const currentYr = await prisma.academicYear.findMany({
    where: { isCurrent: true },
  });

  try {
    if (levelId && invoiceId && !delInvId && !delInvLevId) {
      const updateInv = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          amount,
          level: { set: [{ id: level }] },
          academicYear: { set: [{ id: currentYr[0].id }] },
          assignedBy: { connect: { id: userId } },
        },
        select: { amount: true },
      });
      if (updateInv) {
        return (
          redirect("/super-admin/payments/invoice"),
          json({
            error: false,
            success: "Invoice successfully updated",
          })
        );
      }
    } else if (!levelId && !invoiceId && delInvId && delInvLevId) {
      const del = await prisma.invoice.delete({ where: { id: delInvId } });
      if (del) {
        return (
          redirect("/super-admin/payments/invoice"),
          json({
            error: false,
            success: "Invoice successfully deleted",
          })
        );
      }
    } else if (!levelId && !invoiceId && !delInvLevId && !delInvId) {
      const searchInv = await prisma.invoice.findMany({
        where: {
          AND: [
            { level: { some: { id: level } } },
            { academicYear: { some: { id: currentYr[0].id } } },
          ],
        },
        include: {
          academicYear: { select: { academic_year: true } },
          level: { select: { levelName: true } },
        },
      });
      if (searchInv.length)
        return json({
          error: `An invoice for ${searchInv[0].academicYear[0].academic_year} Academic Year, and Level, ${searchInv[0].level[0].levelName}  is already posted`,
          success: false,
        });

      await prisma.$transaction(async (tx) => {
        await tx.invoice.create({
          data: {
            amount,
            academicYear: { connect: { id: currentYr[0].id } },
            level: { connect: { id: level } },
            assignedBy: { connect: { id: userId } },
          },
        });
      });
    }

    return (
      redirect("/super-admin/payments/invoice"),
      json({ error: false, success: "Invoice is successfully saved!" })
    );
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url).searchParams;
  const invId = url.get("invoiceId");
  const invLevId = url.get("invoiceLevelId");
  try {
    let searchInv;
    if (invLevId?.length && invId!.length) {
      searchInv = await prisma.invoice.findMany({
        where: {
          AND: [
            { id: invId! },
            { level: { some: { id: invLevId! } } },
            { academicYear: { some: { isCurrent: true } } },
          ],
        },
        include: { level: true },
      });
    } else {
      searchInv = {};
    }

    const invoices = await prisma.invoice.findMany({
      where: { academicYear: { some: { isCurrent: true } } },
      include: { level: { orderBy: { levelName: "asc" } } },
    });
    const level = await prisma.level.findMany({
      where: { academic_year: { some: { isCurrent: true } } },
      orderBy: { levelName: "asc" },
    });
    return [invoices, level, searchInv];
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};
type Sort = {
  level: [{ levelName: string; id: string }];
  amount: number;
  id: string;
};
export default function () {
  const [editState, setEditState] = useState({ del: false, edit: false });
  const { submission } = useTransition();
  const actionData = useActionData();
  const loaderData = useLoaderData();
  return (
    <div className="my-5">
      {actionData?.success ? (
        <Stack sx={{ width: "100%" }} spacing={2}>
          <Alert variant="filled" severity="success">
            {" "}
            <AlertTitle>Success</AlertTitle>
            <p>{actionData?.success}</p>
          </Alert>
        </Stack>
      ) : (
        ""
      )}
      {actionData?.error ? (
        <Stack
          sx={{ width: "100%", fontSize: "36px" }}
          spacing={2}
          className="text-2xl"
        >
          <Alert variant="filled" severity="error">
            {" "}
            <AlertTitle>Error</AlertTitle>
            <p>{actionData?.error}</p>{" "}
          </Alert>
        </Stack>
      ) : (
        ""
      )}
      <div className="flex flex-row mt-5 space-x-4 sm:justify-items-start sm:flex-co">
        <Form reloadDocument
          method={"post"}
          className={
            "flex flex-row sm:justify-items-start sm:flex-col flex-wrap w-full space-y-4 flex-1"
          }
        >
          {/* {actionData ? <p className="text-red-700">{actionData.error}</p> : ""} */}
          <fieldset className={"flex flex-col border-4 w-full px-4 py-2"}>
            {" "}
            <legend className={"capitalize text-3xl text-gray-500 px-2"}>
              Invoice
            </legend>
            <label htmlFor={"amount"}>
              <span className={"font-bold"}>Invoice Amount</span>
              <br />
              <input
                className={inputStyle}
                placeholder={"enter the invoice amount"}
                type="number"
                name="amount"
                defaultValue={loaderData[2][0] ? loaderData[2][0].amount : ""}
                required
                id={"amount"}
              />
            </label>
            <br />
            <label htmlFor="level">
              <span className="w-5/12 font-bold">Assign To:</span>
              <br />
              <select
                name="levelId"
                id="level"
                className={inputStyle + " w-full"}
              >
                {loaderData[1]
                  ? loaderData[1].map((item: Item, index: number) => (
                      <option value={item.id} key={index}>
                        {item.levelName}
                      </option>
                    ))
                  : ""}
              </select>
            </label>
            <br />
            <Button
              transition={!!submission}
              style={buttonStyle}
              type={"submit"}
              value={["Save", "Saving"]}
            />
          </fieldset>
        </Form>
        <main className="flex-1">
          <table className={tableStyle}>
            <caption className={tableCap}>Invoices</caption>
            <thead className={tableHeadStyle}>
              <tr className={tableTrStyle}>
                <th className={tableTrStyle}>No.</th>
                <th className={tableTrStyle}>Level</th>
                <th className={tableTrStyle + " flow-col text-center"}>
                  <span>Inv. Amt</span>
                  <br />
                  <span>(SLE)</span>{" "}
                </th>
                <th className={tableTdActStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loaderData[0]
                ? loaderData[0]
                    .sort((a: Sort, b: Sort) => {
                      if (a.level[0].levelName > b.level[0].levelName) return 1;
                      if (a.level[0].levelName < b.level[0].levelName)
                        return -1;
                    })
                    .map((item: Sort, index: number) => (
                      <tr
                        key={index}
                        className={index % 2 === 1 ? modulo : noModulo}
                      >
                        <td className={td}>{index + 1}</td>
                        <td className={td}>{item.level[0].levelName}</td>
                        <td className={td + " text-right"}>{item.amount}</td>
                        <td
                          className={
                            td +
                            " flex flex-row justify-between space-x-4 divide-x-4 divide-black"
                          }
                        >
                          <Form method="get" className="px-3">
                            <input
                              type="text"
                              name="invoiceId"
                              hidden
                              readOnly
                              value={editState.edit ? item.id : ""}
                            />
                            <input
                              type="text"
                              name="invoiceLevelId"
                              hidden
                              readOnly
                              value={editState.edit ? item.level[0].id : ""}
                            />
                            <button
                              className="underline"
                              onClick={() =>
                                setEditState({
                                  ...editState,
                                  del: false,
                                  edit: true,
                                })
                              }
                            >
                              Edit
                            </button>
                          </Form>
                          <Form method="post" className="px-5">
                            <input
                              type="text"
                              name="invoiceDelId"
                              hidden
                              readOnly
                              value={editState.del ? item.id : ""}
                            />
                            <input
                              type="text"
                              name="invoiceLevelDelId"
                              hidden
                              readOnly
                              value={editState.del ? item.level[0].id : ""}
                            />
                            <button
                              className="text-red-700 underline"
                              onClick={() =>
                                setEditState({
                                  ...editState,
                                  del: true,
                                  edit: false,
                                })
                              }
                            >
                              Delete
                            </button>
                          </Form>
                        </td>
                      </tr>
                    ))
                : ""}
            </tbody>
          </table>
        </main>
      </div>
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
