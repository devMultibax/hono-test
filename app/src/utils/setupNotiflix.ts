import Notiflix from 'notiflix';

export function setupNotiflix(): void {
  Notiflix.Confirm.init({
    width: '400px',
    plainText: false,
    messageMaxLength: 10000,
  });

  Notiflix.Report.init({
    width: '400px',
    plainText: false,
    messageMaxLength: 10000,
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const confirmOkBtn = document.getElementById('NXConfirmButtonOk');
      if (confirmOkBtn) { confirmOkBtn.click(); return; }

      const reportBtn = document.getElementById('NXReportButton');
      if (reportBtn) { reportBtn.click(); return; }
    }

    if (e.key === 'Escape') {
      const confirmCancelBtn = document.getElementById('NXConfirmButtonCancel');
      if (confirmCancelBtn) confirmCancelBtn.click();
    }
  });
}
