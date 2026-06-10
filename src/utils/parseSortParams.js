import { SORT_ORDER } from '../constants/index.js';

const ALLOWED_SORT_FIELDS = [
  '_id',
  'name',
  'phoneNumber',
  'email',
  'contactType',
  'isFavourite',
  'createdAt',
  'updatedAt',
];

const parseSortOrder = (sortOrder) =>
  [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder)
    ? sortOrder
    : SORT_ORDER.ASC;

const parseSortBy = (sortBy) =>
  ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : '_id';

export const parseSortParams = (query) => ({
  sortOrder: parseSortOrder(query.sortOrder),
  sortBy: parseSortBy(query.sortBy),
});
