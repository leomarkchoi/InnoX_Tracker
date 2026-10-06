// javascript/color_system.js

function handleStatusChange(selectEl) {
  const taskId = selectEl.getAttribute('data-id');
  const env = selectEl.getAttribute('data-env');
  const newStatus = selectEl.value;
  const previousStatus = selectEl.getAttribute('data-status');

  // ອັບເດດ UI ຊົ່ວຄາວ (ປ່ຽນສີທັນທີ)
  selectEl.setAttribute('data-status', newStatus);
  selectEl.disabled = true;

  // ກວດສອບວ່າລັນຢູ່ເທິງ Google Apps Script ຫຼື Local
  if (typeof google === "undefined") {
    console.log(`[Local Dev] ຈຳລອງການບັນທຶກ: ${taskId} - ${env} -> ${newStatus}`);
    
    // ອັບເດດ LocalStorage
    const taskIndex = tasks.findIndex(t => t.caseCode === taskId);
    if(taskIndex !== -1) {
      if(env === 'DEV') tasks[taskIndex].devStatus = newStatus;
      if(env === 'UAT') tasks[taskIndex].uatStatus = newStatus;
      if(env === 'PROD') tasks[taskIndex].prodStatus = newStatus;
      saveState(); // ບັນທຶກ
    }
    
    setTimeout(() => {
      selectEl.disabled = false;
      showToast(`ບັນທຶກ ${taskId} ໄປ ${env} ສຳເລັດ (Local)`);
      renderDashboard(); // ອັບເດດກາຟ
    }, 1000);
    return;
  }

  // ຖ້າລັນເທິງ Google Apps Script ໃຫ້ເອີ້ນໃຊ້ Backend (Code.gs)
  google.script.run
    .withSuccessHandler(function(response) {
      selectEl.disabled = false;
      showToast(`ບັນທຶກ ${taskId} ໄປ ${env} ສຳເລັດແລ້ວ!`);
      // ອາດຈະຕ້ອງ update array `tasks` ຢູ່ຝັ່ງ JS ນຳເພື່ອໃຫ້ Dashboard ຊິ້ງກັນ
    })
    .withFailureHandler(function(error) {
      selectEl.disabled = false;
      // Revert (ກັບຄືນຄ່າເດີມ) ຖ້າ Error
      selectEl.value = previousStatus;
      selectEl.setAttribute('data-status', previousStatus);
      alert(`⚠️ ຜິດພາດ: ${error.message}`);
    })
    .updateTaskStatusInSheet(taskId, env, newStatus);
}