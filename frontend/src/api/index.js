const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function submitInterest({ name, email, selectedStep }) {
  const response = await fetch(`${BASE_URL}/api/interest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, selectedStep }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Submission failed');
  }

  return data;
}

export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || 'Upload failed'));
        }
      } catch {
        reject(new Error('Invalid server response'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.open('POST', `${BASE_URL}/api/files/upload`);
    xhr.send(formData);
  });
}

export async function getJobStatus(jobId) {
  const response = await fetch(`${BASE_URL}/api/files/status/${jobId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Status check failed');
  return data;
}

export async function getJobResult(jobId) {
  const response = await fetch(`${BASE_URL}/api/files/result/${jobId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Result fetch failed');
  return data;
}
