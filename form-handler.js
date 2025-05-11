// Hitung usia dari tanggal lahir
function hitungUsia(tanggalLahir) {
  const birthDate = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Event listener untuk tanggal lahir → hitung usia otomatis
window.addEventListener('DOMContentLoaded', () => {
  const tanggalLahirInput = document.getElementById('tanggal_lahir');
  const usiaInput = document.getElementById('usia');

  if (tanggalLahirInput && usiaInput) {
    tanggalLahirInput.addEventListener('change', function () {
      usiaInput.value = hitungUsia(this.value);
    });
  }

  // Progress bar
  const formSections = document.querySelectorAll('.form-section');
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');

  let currentSection = 0;

  function updateProgress() {
    const percent = Math.round(((currentSection + 1) / formSections.length) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercent.innerText = `${percent}%`;
  }

  function showSection(index) {
    formSections.forEach((section, i) => {
      section.classList.toggle('current', i === index);
    });
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').classList.toggle('d-none', index === formSections.length - 1);
    document.getElementById('submitBtn').classList.toggle('d-none', index !== formSections.length - 1);
    updateProgress();
  }

  document.getElementById('nextBtn')?.addEventListener('click', () => {
    if (currentSection < formSections.length - 1) {
      currentSection++;
      showSection(currentSection);
    }
  });

  document.getElementById('prevBtn')?.addEventListener('click', () => {
    if (currentSection > 0) {
      currentSection--;
      showSection(currentSection);
    }
  });

  showSection(currentSection);

  // Submit handler
  const form = document.getElementById('registrationForm');
  const submitBtn = document.getElementById('submitBtn');

  form?.addEventListener('submit', function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    const spinner = submitBtn.querySelector('.spinner-border');
    if (spinner) spinner.style.display = 'inline-block';

    const formData = new FormData(form);
    for (let [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 2 * 1024 * 1024) {
        Swal.fire('File terlalu besar', `Ukuran file ${key} melebihi 2MB.`, 'error');
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        return;
      }
    }

    progressBar.style.width = '30%';

    fetch('https://script.google.com/macros/s/AKfycbyYQ008ZqtslioCQcQzt7v54nGnYV-sMRltQFy6qyDw95W4qnuXCuhW-pUX3TM0MNNPWw/exec', {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    })
      .then(() => {
        progressBar.style.width = '100%';
        Swal.fire('Sukses', 'Pendaftaran berhasil!', 'success');
        form.reset();
        currentSection = 0;
        showSection(currentSection);
        setTimeout(() => progressBar.style.width = '0%', 1000);
      })
      .catch(error => {
        progressBar.style.width = '0%';
        Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim data.', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      });
  });
});
