import { API_BASE_URL } from './api';

/**
 * Uploads an image file to Cloudinary via the backend API.
 * @param file The file object from an input element
 * @returns Promise with the uploaded image URL and public_id
 */
export async function uploadImage(file: File): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required for upload');
  }

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return {
    url: data.url,
    public_id: data.public_id
  };
}

/**
 * Uploads multiple images to Cloudinary via the backend API.
 * @param files Array of file objects
 * @returns Promise with array of results containing URLs and public_ids
 */
export async function uploadImages(files: File[]): Promise<Array<{ url: string; public_id: string }>> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required for upload');
  }

  const response = await fetch(`${API_BASE_URL}/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data.results;
}
