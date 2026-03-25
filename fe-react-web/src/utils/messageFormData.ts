export function buildMessageFormData(params: {
  content: string;
  bikeId?: string;
  attachment?: File | null;
}): FormData {
  const fd = new FormData();
  fd.append('content', params.content);
  if (params.bikeId?.trim()) {
    fd.append('bikeId', params.bikeId.trim());
  }
  if (params.attachment) {
    fd.append('attachment', params.attachment);
  }
  return fd;
}
