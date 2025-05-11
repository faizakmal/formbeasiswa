
  let currentSection = 0;
  const sections = document.querySelectorAll('.form-section');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const progressBar = createProgressBar();
  const percentText = createProgressPercent();
  const spinner = document.createElement('span');
  spinner.className = 'spinner-border spinner-border-sm';
  submitBtn.appendChild(spinner);

  const validator = new JustValidate('#registrationForm', {
    focusInvalidField: true,
    lockForm: true,
    validateBeforeSubmitting: true
  });

  validator
    .addField('[name="email"]', [
      {
        rule: 'required',
        errorMessage: 'Email wajib diisi'
      },
      {
        rule: 'email',
        errorMessage: 'Format email tidak valid'
      }
    ])
    .addField('[name="nomor_ktp"]', [
      {
        rule: 'required',
        errorMessage: 'Nomor KTP wajib diisi'
      },
      {
        validator: value => /^[0-9]{16}$/.test(value),
        errorMessage: 'Nomor KTP harus 16 digit'
      }
    ])
    .addField('[name="nomor_telepon"]', [
      {
        rule: 'required',
        errorMessage: 'Nomor telepon wajib diisi'
      },
      {
        validator: value => /^[0-9]{9,15}$/.test(value),
        errorMessage: 'Nomor telepon tidak valid'
      }
    ])
    .addField('[name="tanggal_lahir"]', [
      {
        rule: 'required',
        errorMessage: 'Tanggal lahir wajib diisi'
      },
      {
        validator: value => new Date(value) <= new Date(),
        errorMessage: 'Tanggal lahir tidak boleh di masa depan'
      }
    ]);

  function createProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'progressBar';
    document.body.prepend(bar);
    return bar;
  }

  function createProgressPercent() {
    const percent = document.createElement('div');
    percent.id = 'progressPercent';
    document.body.prepend(percent);
    return percent;
  }

  function showSection(n) {
    sections.forEach((section, i) => section.classList.toggle('current', i === n));
    prevBtn.disabled = n === 0;
    nextBtn.classList.toggle('d-none', n === sections.length - 1);
    submitBtn.classList.toggle('d-none', n !== sections.length - 1);
    updateProgressIndicator(n);
  }

  function updateProgressIndicator(n) {
    const percent = Math.round(((n + 1) / sections.length) * 100);
    percentText.innerText = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }

  function nextPrev(n) {
    currentSection += n;
    if (currentSection < sections.length) showSection(currentSection);
  }

  document.getElementById('tanggal_lahir').addEventListener('change', function () {
    const birthDate = new Date(this.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    document.getElementById('usia').value = age;
  });

  document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';

    const formData = new FormData(this);

    for (let [name, file] of formData.entries()) {
      if (file instanceof File && file.size > 2 * 1024 * 1024) {
        Swal.fire('File terlalu besar', `Ukuran file ${name} melebihi 2MB.`, 'error');
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        return;
      }
    }

    progressBar.style.width = '30%';

    fetch('https://script.google.com/macros/s/AKfycbyYQ008ZqtslioCQcQzt7v54nGnYV-sMRltQFy6qyDw95W4qnuXCuhW-pUX3TM0MNNPWw/exec', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error('Server error');
        progressBar.style.width = '70%';
        return response.text();
      })
      .then(() => {
        progressBar.style.width = '100%';
        Swal.fire('Sukses', 'Pendaftaran berhasil!', 'success');
        document.getElementById('registrationForm').reset();
        currentSection = 0;
        showSection(currentSection);
        setTimeout(() => progressBar.style.width = '0%', 1000);
      })
      .catch(error => {
        progressBar.style.width = '0%';
        Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim data: ' + error.message, 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        spinner.style.display = 'none';
      });
  });

  showSection(currentSection);
