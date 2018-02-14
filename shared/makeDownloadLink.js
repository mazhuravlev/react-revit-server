const makeDownloadLink = (type, id) => `/api/download/${type}/${id}`;
module.exports = {makeDownloadLink};