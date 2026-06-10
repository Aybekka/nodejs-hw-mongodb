const parseContactType = (type) => {
  if (typeof type !== 'string') return;
  return ['work', 'home', 'personal'].includes(type) ? type : undefined;
};

const parseBoolean = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const parseFilterParams = (query) => ({
  type: parseContactType(query.type),
  isFavourite: parseBoolean(query.isFavourite),
});
