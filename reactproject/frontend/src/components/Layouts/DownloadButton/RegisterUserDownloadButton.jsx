import React from "react";
import * as XLSX from "xlsx-js-style";

const RegisterUserDownloadButton = ({ filteredUsers }) => {
  const downloadData = (format) => {
    if (format === "excel") {
      // Define headers with styling
      const headers = [
        "Student No.",
        "Full Name",
        "Sex",
        "Course",
        "Year",
        "CvSU Email",
      ];

      // Convert data to rows
      const rows = filteredUsers.map((user) => [
        user.studentNumber,
        `${user.firstName} ${user.lastName}`,
        user.sex,
        user.course,
        user.year,
        user.cvsuEmail,
      ]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Style configurations
      const headerStyle = {
        fill: {
          fgColor: { rgb: "5c0099" },
        },
        font: {
          color: { rgb: "FFFFFF" },
          bold: true,
          sz: 12,
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const cellStyle = {
        alignment: {
          horizontal: "left",
          vertical: "center",
          wrapText: true,
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      // Apply column widths
      const colWidths = [
        { wch: 15 }, // Student No.
        { wch: 30 }, // Full Name
        { wch: 10 }, // Sex
        { wch: 25 }, // Course
        { wch: 10 }, // Year
        { wch: 35 }, // Email
      ];
      ws["!cols"] = colWidths;

      // Apply row height
      ws["!rows"] = [{ hpt: 25 }]; // Header row height

      // Apply styles to all cells
      for (let i = 0; i < headers.length; i++) {
        // Header cell reference
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: i });
        ws[headerCell].s = headerStyle;

        // Data cells
        for (let j = 0; j < rows.length; j++) {
          const dataCell = XLSX.utils.encode_cell({ r: j + 1, c: i });
          if (!ws[dataCell].s) {
            ws[dataCell].s = cellStyle;
          }
        }
      }

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registered Users");

      // Generate Excel file
      XLSX.writeFile(wb, "registered_users.xlsx");
    }
  };
  return (
    <div className="col p-0">
      <button
        className="w-100 primaryButton py-1 py-md-2"
        onClick={() => downloadData("excel")}
      >
        <p className="m-0">Download as Excel File</p>
      </button>
    </div>
  );
};

export default RegisterUserDownloadButton;
