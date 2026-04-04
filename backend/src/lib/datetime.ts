export const parseDateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);

export const parseTimeOnly = (value: string) => new Date(`1970-01-01T${value}:00.000Z`);
