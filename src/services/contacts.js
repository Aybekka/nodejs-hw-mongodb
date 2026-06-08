import { Contact } from '../db/models/contact.js';

export const getAllContacts = () => Contact.find();

export const getContactById = (contactId) => Contact.findById(contactId);

export const createContact = (payload) => Contact.create(payload);

export const deleteContact = (contactId) =>
  Contact.findOneAndDelete({ _id: contactId });

export const updateContact = async (contactId, payload, options = {}) => {
  const raw = await Contact.findOneAndUpdate(
    { _id: contactId },
    payload,
    { new: true, includeResultMetadata: true, ...options },
  );

  if (!raw || !raw.value) return null;

  return {
    contact: raw.value,
    isNew: Boolean(raw?.lastErrorObject?.upserted),
  };
};
