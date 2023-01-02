export const active =
  "bg-purple-700 rounded p-2 w-fit flex w-auto space-x-2 text-white font-bold";
export const inactive =
  " bg-gray-400 w-fit flex space-x-2 hover:bg-purple-700 rounded w-auto underline p-2 font-bold text-white";
export const buttonStyle =
  "self-start capitalize bg-teal-600 py-2 px-4 text-xl transition text-gray-100 rounded-3xl";
export const formStyle =
  "lg:grid lg:grid-cols-3 sm:grid sm:grid-cols-1 md:grid md:grid-cols-2  border-2 p-2 gap-y-2";
export const tableHeadStyle = "bg-teal-600 text-left text-gray-50 capitalize";
export const tableTrStyle = "font-extrabold text-center text-gray-200 text-2x";
export const tableTdActStyle =
  "font-extrabold text-center text-gray-200 bg-yellow-600 tracking-[1em] uppercase";
export const tableThStyle = "w-fit whitespace-nowrap px-4";
export const tableStyle =
  "border flex-1 w-fit border-black border-2 mb-4 caption-top";
export const tableCap =
  "table-caption text-left text-3xl p-2 border border-black border-2";
export const viewLink =
  "align-middle text-gray-300 hover:bg-blue-600 rounded bg-blue-500 align-middle py-1.5 px-3 ";
export const deleteButton =
  "bg-red-600 hover:bg-red-700 py-1 text-gray-300 px-2 rounded";
export const modulo = "bg-gray-400";
export const noModulo = "bg-gray-200";
export const actionTd =
  "p-2 flex gap-x-4 align-middle text-center text-gray-700";
export const td = "py-2 px-4 whitespace-nowrap";
export const dashboardDiv =
  "min-h-screen lg:flex  lg:flex-row sm:flex sm:flex-col md:flex md:flex-col";
export const dashboardSec = "bg-blue-900 sm:overflow-x-auto pt-2 text-white";
export const dashboardSecNav =
  "space-y-3 sm:space-x-2 lg:flex lg:flex-col md:flex-row md:flex sm:flex sm:flex-row";
export const dashboardMain = "flex-1 p-2 bg-b overflow-auto w-screen";

export const size = 26;

export const inputStyle =
  "outline outline-1 bg-gray-200 border  w-5/12 py-2 px-3 rounded";

export type Item = {
  id: string;
  name: string;
  levelName: string;
  academic_year: [{ academic_year: Date; id: string }];
  level: { levelName: string; id: string };
  amount: number;
  payingSlipNumber: string;
  paymentDate: Date;
};
