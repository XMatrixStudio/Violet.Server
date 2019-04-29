export const Email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
export const ExtId = /^([a-zA-Z][a-zA-Z0-9_-]{0,31})|(\+[0-9a-f]{24})$/
export const Id = /^[0-9a-f]{24}$/
export const Name = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/
export const Phone = /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[01356789]\d{2}|4(?:0\d|1[0-2]|9\d))|9[189]\d{2}|6[567]\d{2}|4[579]\d{2})\d{6}$/
export const Url = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
