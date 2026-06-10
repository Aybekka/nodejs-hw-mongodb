import { SORT_ORDER } from '../constants/index.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { Contact } from '../db/models/contact.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const skip = (page - 1) * perPage;
  const query = Contact.find({ userId });

  if (filter.type) query.where('contactType').equals(filter.type);
  if (filter.isFavourite !== undefined) {
    query.where('isFavourite').equals(filter.isFavourite);
  }

  const [count, contacts] = await Promise.all([
    Contact.find({ userId }).merge(query).countDocuments(),
    query.skip(skip).limit(perPage).sort({ [sortBy]: sortOrder }).exec(),
  ]);

  return {
    data: contacts,
    ...calculatePaginationData(count, perPage, page),
  };
};

export const getContactById = (contactId, userId) =>
  Contact.findOne({ _id: contactId, userId });

export const createContact = (payload) => Contact.create(payload);

export const deleteContact = (contactId, userId) =>
  Contact.findOneAndDelete({ _id: contactId, userId });

export const updateContact = async (contactId, userId, payload, options = {}) => {
  const raw = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, includeResultMetadata: true, ...options },
  );
  if (!raw || !raw.value) return null;
  return {
    contact: raw.value,
    isNew: Boolean(raw?.lastErrorObject?.upserted),
  };
};
