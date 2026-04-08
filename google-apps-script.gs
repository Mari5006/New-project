function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = {
    name: e.parameter.name || "",
    phone: e.parameter.phone || "",
    attendance: e.parameter.attendance || "",
    submittedAt: e.parameter.submittedAt || new Date().toISOString(),
  };

  if (!data.name && e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      data.name = parsed.name || data.name;
      data.phone = parsed.phone || data.phone;
      data.attendance = parsed.attendance || data.attendance;
      data.submittedAt = parsed.submittedAt || data.submittedAt;
    } catch (error) {
      // Keep the URL-encoded fallback values when JSON parsing is not applicable.
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Phone", "Attendance"]);
  }

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || "",
    data.phone || "",
    data.attendance || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
