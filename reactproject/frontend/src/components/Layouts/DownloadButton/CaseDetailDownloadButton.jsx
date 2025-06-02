import React from "react";
import { jsPDF } from "jspdf";

const CaseDetailDownloadButton = ({ caseDetails }) => {
  const downloadData = async (format) => {
    if (format === "excel") {
      const header = [
        "Victim's Name",
        "Sex",
        "Contact Number",
        "Perpetrator's Name",
        "Location",
        "Date",
        "Description",
      ];
      const rows = [
        [
          caseDetails.victimName,
          caseDetails.gender,
          caseDetails.contactInfo,
          caseDetails.perpetratorName,
          caseDetails.location,
          new Date(caseDetails.date).toLocaleDateString(),
          caseDetails.incidentDescription,
        ],
      ];

      const csvContent = [header, ...rows]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "case_details.csv";
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Define colors
      const primaryColor = "#5c0099";
      const secondaryColor = "#ffb31a";
      const lightGray = "#f5f5f5";

      // Add header with styling
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, 210, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Case Details", 105, 20, { align: "center" });

      // Add current date
      doc.setFontSize(10);
      doc.setTextColor(220, 220, 220);
      doc.text(new Date().toLocaleDateString(), 195, 10, { align: "right" });

      // Start content after header
      let yPos = 45;

      // Define sections with their content
      const sections = [
        {
          title: "Victim Information",
          content: [
            ["Name", caseDetails.victimName],
            ["Sex", caseDetails.gender],
            ["Contact", caseDetails.contactInfo],
          ],
        },
        {
          title: "Incident Details",
          content: [
            ["Subject/s", caseDetails.subjects],
            ["Perpetrator", caseDetails.perpetratorName],
            ["Location", caseDetails.location],
            ["Date", new Date(caseDetails.date).toLocaleDateString()],
          ],
        },
      ];

      // Function to add styled section
      const addSection = (section, startY) => {
        let currentY = startY;

        // Section title with background
        doc.setFillColor(secondaryColor);
        doc.rect(10, currentY - 5, 190, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, 15, currentY);
        currentY += 10;

        // Section content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        section.content.forEach(([label, value]) => {
          doc.setFillColor(lightGray);
          doc.rect(10, currentY - 5, 190, 7, "F");

          doc.setFont("helvetica", "bold");
          doc.text(label + ":", 15, currentY);
          doc.setFont("helvetica", "normal");
          doc.text(value || "Not provided", 50, currentY);
          currentY += 8;
        });

        return currentY + 5;
      };

      // Add each section
      sections.forEach((section) => {
        yPos = addSection(section, yPos);
      });

      // Add description section
      doc.setFillColor(secondaryColor);
      doc.rect(10, yPos - 5, 190, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 15, yPos);

      // Description content with text wrapping
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitDescription = doc.splitTextToSize(
        caseDetails.incidentDescription,
        180
      );
      doc.text(splitDescription, 15, yPos + 10);

      yPos += 20 + splitDescription.length * 5;

      if (
        caseDetails.supportingDocuments &&
        Array.isArray(JSON.parse(caseDetails.supportingDocuments)) &&
        JSON.parse(caseDetails.supportingDocuments).length > 0
      ) {
        // Supporting Documents header
        doc.setFillColor(secondaryColor);
        doc.rect(10, yPos - 5, 190, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Supporting Documents (Proof of Incident)", 15, yPos);
        yPos += 15;

        // Image loading function
        const loadImage = async (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg"));
            };
            img.onerror = reject;
            img.src = url;
          });
        };

        // Updated image layout handling
        const addImages = async () => {
          const documents = JSON.parse(caseDetails.supportingDocuments);
          let currentY = yPos;
          const imagesPerRow = 2;
          const imageWidth = 85;
          const imageHeight = 60;
          const marginBetweenImages = 10;

          for (let i = 0; i < documents.length; i++) {
            try {
              // Calculate position for current image
              const row = Math.floor(i / imagesPerRow);
              const col = i % imagesPerRow;

              // Check if we need a new page
              if (currentY + imageHeight > 270) {
                doc.addPage();
                currentY = 20;
              }

              const xPos = 15 + col * (imageWidth + marginBetweenImages);
              const imageUrl = `http://localhost:8081${documents[i]}`;
              const base64Image = await loadImage(imageUrl);

              doc.addImage(
                base64Image,
                "JPEG",
                xPos,
                currentY,
                imageWidth,
                imageHeight
              );

              // Move to next row if we've filled current row
              if (col === imagesPerRow - 1) {
                currentY += imageHeight + marginBetweenImages;
              }
            } catch (error) {
              console.error("Error loading image:", error);
            }
          }
        };

        await addImages();
      }

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
      }

      // Add watermark
      doc.setGState(new doc.GState({ opacity: 0.5 }));
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
      doc.text("SIKAT EDIARY", 140, 140, {
        align: "center",
        angle: 50,
      });

      // Save the PDF
      doc.save("case_details.pdf");
    }
  };
  return (
    <div className="row d-flex gy-1">
      <div className="col-sm">
        <button
          className="w-100 primaryButton py-2 py-md-2 mx-a"
          onClick={async (e) => {
            e.preventDefault();
            try {
              await downloadData("pdf");
            } catch (err) {
              console.error("Error downloading PDF:", err);
              alert("Failed to download PDF. Please try again.");
            }
          }}
        >
          <p className="m-0">Download as PDF</p>
        </button>
      </div>
    </div>
  );
};

export default CaseDetailDownloadButton;
