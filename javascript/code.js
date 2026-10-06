function updateTaskStatusInSheet(taskId, env, status) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TestTracker");
    
    // 1. ປ້ອງກັນກໍລະນີບໍ່ພົບຊື່ Sheet (ກັນລະບົບພັງ)
    if (!sheet) {
      throw new Error("ບໍ່ພົບ Sheet ທີ່ຊື່ວ່າ 'TestTracker'");
    }

    const data = sheet.getDataRange().getValues();
    
    // 2. ກຳນົດ Column ຕາມ Environment
    let colIndex; 
    if (env === 'DEV') colIndex = 4;
    else if (env === 'UAT') colIndex = 5;
    else if (env === 'PROD') colIndex = 6;
    else throw new Error("Environment ບໍ່ຖືກຕ້ອງ (ຕ້ອງເປັນ DEV, UAT, ຫຼື PROD)");

    // 3. ຄົ້ນຫາຕາມ ID
    for (let i = 1; i < data.length; i++) {
      // ໃຊ້ String() ຄອບໄວ້ເພື່ອປ້ອງກັນບັນຫາ Data Type: ບາງທີ ID ໃນ Sheet ເປັນ Number ແຕ່ຈາກ HTML ສົ່ງມາເປັນ Text
      if (String(data[i][0]) === String(taskId)) { 
        sheet.getRange(i + 1, colIndex).setValue(status);
        return "Updated Successfully"; // ຖ້າສຳເລັດ ຈະສົ່ງຄ່ານີ້ໄປໃຫ້ withSuccessHandler
      }
    }
    
    // 4. ຖ້າ Loop ຈົນຈົບແລ້ວບໍ່ພົບ Task ID
    throw new Error(`ບໍ່ພົບ Task ID: ${taskId} ໃນຕາຕະລາງ`);

  } catch (error) {
    // ຖິ້ມ Error ໄປໃຫ້ withFailureHandler ຢູ່ຝັ່ງ JavaScript (Frontend) ເຮັດວຽກ
    throw new Error(error.message);
  }
}