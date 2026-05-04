export const getApiErrorMessage = (error: any, fallback = 'An error occurred.') => {
  const data = error?.response?.data;
  const detail = data?.detail ?? data;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object') {
          return item.msg || JSON.stringify(item);
        }
        return String(item);
      })
      .join(', ');
  }

  if (detail && typeof detail === 'object') {
    if (typeof detail.msg === 'string') {
      return detail.msg;
    }
    return JSON.stringify(detail);
  }

  return error?.message || fallback;
};
