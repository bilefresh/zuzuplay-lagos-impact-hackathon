"use client";
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  empty?: React.ReactNode;
  caption?: string;
};

export function DataTable<T>({ columns, data, empty, caption }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return <div>{empty}</div>;
  }
  return (
    <div className="overflow-hidden">
      <Table className="w-full">
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader className="bg-[#f8f9fa]">
          <TableRow className="border-b border-[#e6e7e6] hover:bg-transparent">
            {columns.map((c) => (
              <TableHead 
                key={String(c.key)} 
                className="text-[#364151] text-[16px] font-normal tracking-[-0.16px] py-4 px-6 text-left"
              >
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: any, idx) => (
            <TableRow 
              key={idx} 
              className="border-b border-[#e6e7e6] hover:bg-[#f8f9fa] transition-colors"
            >
              {columns.map((c) => (
                <TableCell 
                  key={String(c.key)} 
                  className={`text-[#364151] text-[16px] py-4 px-6 ${c.className || ''}`}
                >
                  {c.render ? c.render(row) : String(row[c.key as keyof typeof row] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;


