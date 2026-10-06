// ==========================================
// ຟັງຊັນສຳລັບເກັບປະຫວັດການ Login (Audit Logs)
// ==========================================
function saveAuditLog(username, status) {
  let logs = JSON.parse(localStorage.getItem('innox_audit_logs')) || [];
  logs.push({
    timestamp: new Date().toLocaleString('lo-LA'),
    user: username || 'Unknown',
    status: status
  });
  if (logs.length > 50) logs.shift(); 
  localStorage.setItem('innox_audit_logs', JSON.stringify(logs));
  console.log(`[Audit Log] User: ${username} | Status: ${status}`);
}

// ==========================================
// ຟັງຊັນ Render ຕາຕະລາງ
// ==========================================
function renderTable(data) {
  const tbody = document.getElementById('table-body');
  let html = '';

  // ຟັງຊັນສ້າງ <option> ແລະ ເຊັກຄ່າ selected
  const createOptions = (currentStatus) => {
    const statuses = ['Pass', 'Fail', 'Blocked', 'In Progress', 'Pending'];
    return statuses.map(status => {
      const isSelected = status === currentStatus ? 'selected' : '';
      return `<option value="${status}" ${isSelected}>${status}</option>`;
    }).join('');
  };

  data.forEach(task => {
    html += `
      <tr>
        <td>${task.id}</td>
        
        <!-- DEV Column -->
        <td class="status-cell">
          <select class="status-dropdown" data-id="${task.id}" data-env="DEV" data-status="${task.devStatus}" onchange="handleStatusChange(this)">
            ${createOptions(task.devStatus)}
          </select>
        </td>

        <!-- UAT Column -->
        <td class="status-cell">
          <select class="status-dropdown" data-id="${task.id}" data-env="UAT" data-status="${task.uatStatus}" onchange="handleStatusChange(this)">
            ${createOptions(task.uatStatus)}
          </select>
        </td>

        <!-- PROD Column -->
        <td class="status-cell">
          <select class="status-dropdown" data-id="${task.id}" data-env="PROD" data-status="${task.prodStatus}" onchange="handleStatusChange(this)">
            ${createOptions(task.prodStatus)}
          </select>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================
// 1. ກວດສອບ Session (Remember Me) ຕອນເປີດໜ້າເວັບ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  updateProjectDropdowns();
  
  // ກວດສອບວ່າເຄີຍຕິກ Remember Me ໄວ້ຫຼືບໍ່
  const session = localStorage.getItem('innox_session');
  if (session === 'active') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    renderAllViews();
  }
  
  document.getElementById('printDate').innerText = new Date().toLocaleDateString('lo-LA');
});

// ==========================================
// 2. ຟັງຊັນການກົດ Login ໃຫ້ມີການບັນທຶກ Audit ແລະ Remember
// ==========================================
function handleLoginSubmit(event) {
  event.preventDefault();
  const u = document.getElementById('loginUserId').value.trim();
  const p = document.getElementById('loginPassword').value.trim();
  
  // ດຶງຄ່າຈາກ Checkbox ທີ່ເຮົາຈະໄປຕື່ມ id="rememberMe" ໃສ່
  const rememberCheckbox = document.getElementById('rememberMe');
  const remember = rememberCheckbox ? rememberCheckbox.checked : false; 
  
  const btnText = document.getElementById('btnText');
  const alertBox = document.getElementById('loginAlert');

  alertBox.classList.add('hidden');
  setLogoState('state-loading');
  btnText.innerText = 'Verifying...';

  setTimeout(() => {
    if (u === 'admin' && (p === '123456' || p === 'admin')) {
      setLogoState('state-success');
      btnText.innerText = 'Success!';

      // ບັນທຶກປະຫວັດສຳເລັດ
      saveAuditLog(u, 'Success'); 

      // ຖ້າຕິກ Remember ໃຫ້ບັນທຶກລົງເຄື່ອງ
      if (remember) {
        localStorage.setItem('innox_session', 'active');
        localStorage.setItem('innox_active_user', u);
      }

      setTimeout(() => {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        renderAllViews();
        setLogoState('state-idle');
        btnText.innerText = 'Sign in';
      }, 800);
    } else {
      setLogoState('state-error');
      alertBox.classList.remove('hidden');
      btnText.innerText = 'Sign in';

      // ບັນທຶກປະຫວັດລົ້ມເຫຼວ
      saveAuditLog(u, 'Failed'); 

      setTimeout(() => {
        setLogoState('state-idle');
      }, 2000);
    }
  }, 1200);
}

// ==========================================
// 3. ຟັງຊັນ Logout ທີ່ລຶບຄວາມຈຳອອກນຳ
// ==========================================
function confirmLogout() {
  closeLogoutModal();
  
  // ລຶບ Session ອອກຈາກເຄື່ອງ
  localStorage.removeItem('innox_session');
  localStorage.removeItem('innox_active_user');
  
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  
  // Reset input ຕ່າງໆ
  document.getElementById('loginUserId').value = '';
  document.getElementById('loginPassword').value = '';
  
  const rememberCheckbox = document.getElementById('rememberMe');
  if(rememberCheckbox) rememberCheckbox.checked = false; 
  
  showToast('ອອກຈາກລະບົບແລ້ວ');
}