const axios = require('axios');
const urlencode = require('urlencode');
const fs = require('fs');
const mongoose = require('mongoose');


async function getFolderTree(folder) {
  const data = await getFolderData(folder);
  if(!data) return null;
  const folders = [];
  for (let i = 0; i < data.Folders.length; i++) {
    const childFolder = await getFolderTree(folder === '|' ? data.Folders[i].Name : `${folder}|${data.Folders[i].Name}`);
    if (childFolder && !childFolder.empty) folders.push(childFolder);
  }
  const models = [];
  for (let i = 0; i < data.Models.length; i++) {
    const model = data.Models[i];
    model.id = new mongoose.Types.ObjectId;
    const history = await getModelHistory(folder + '|' + model.Name);
    models.push({model, history});
  }
  const isEmpty = folders.length === 0 && data.Models.length === 0;
  return {
    empty: isEmpty,
    folder: data,
    folders,
    models
  };
}

const ROOT_URL = 'http://10.177.100.96/RevitServerAdminRESTService2017/AdminRESTService.svc';
const HEADERS = {
  'User-Name': 'Test',
  'User-Machine-Name': 'Test',
  'Operation-GUID': 'db0e9239-3d18-47ee-b85d-9018bc172b0b',
};

async function getFolderData(folder) {
  const url = `${ROOT_URL}/${makeUrlPath(folder)}/contents`;
  try {
    const res = await makeRequest(url);
    return res.data;
  } catch (e) {
    return null;
  }
}

async function getModelHistory(modelPath) {
  const url = `${ROOT_URL}/${makeUrlPath(modelPath)}/history`;
  try {
    const res = await makeRequest(url);
    return res.data;
  } catch (e) {
    return null;
  }
}

async function makeRequest(url) {
  return await axios.request({
    method: 'get',
    url,
    headers: HEADERS,
  });
}

function makeUrlPath(path) {
  return urlencode(path.replace(/(\|+|\\\\|\/)/g, '|'));
}

module.exports = {getFolderTree};