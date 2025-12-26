/**
 * @file src/utils/excelExport.ts
 * @description Utility to export faculty data to Excel
 */
import ExcelJS from "exceljs";
import { Faculty } from "@/interfaces/faculty";
import { designationDisplayMap } from "@/constants/designations";
import { showToast } from "@/lib/toast";

// Export faculty data to Excel file
export const exportFacultyToExcel = async (facultyData: Faculty[]) => {
  if (facultyData.length === 0) {
    showToast.error("No faculty data available to export.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Faculty Data");

  worksheet.columns = [
    { header: "Sr. No.", key: "srNo", width: 8 },
    { header: "First Name", key: "firstName", width: 20 },
    { header: "Last Name", key: "lastName", width: 20 },
    { header: "Email Address", key: "email", width: 35 },
    { header: "Designation", key: "designation", width: 20 },
    {
      header: "Department Abbreviation",
      key: "departmentAbbreviation",
      width: 25,
    },
    { header: "Seating Location", key: "seatingLocation", width: 20 },
    {
      header: "Faculty Abbreviation",
      key: "facultyAbbreviation",
      width: 15,
    },
    { header: "Joining Date", key: "joiningDate", width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E5E5" },
  };
  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // Add data rows
  facultyData.forEach((f, index) => {
    worksheet.addRow({
      srNo: index + 1,
      firstName: f.name,
      email: f.email,
      designation:
        designationDisplayMap[
          f.designation as keyof typeof designationDisplayMap
        ] || f.designation,
      departmentAbbreviation: f.departmentAbbreviation,
      seatingLocation: f.seatingLocation,
      facultyAbbreviation: f.abbreviation,
      joiningDate: f.joiningDate
        ? new Date(f.joiningDate).toLocaleDateString()
        : "N/A",
    });
  });

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if (rowNumber > 1) {
        cell.alignment =
          colNumber === 1
            ? { vertical: "middle", horizontal: "center" }
            : { vertical: "middle", horizontal: "left" };
      }
    });
  });

  // Generate and download Excel file
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `faculty_data_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    showToast.success("Faculty data exported successfully!");
  } catch {
    showToast.error("Failed to export faculty data.");
  }
};
