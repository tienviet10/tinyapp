
const urlDatabase = require('../data/linkDb');
const generateRandomString = require('./generalHelpers');

const urlsForUser = (id) => {
  if (!id) return {};

  let res = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      res[key] = urlDatabase[key];
    }
  }

  return res;
};

const createShortLink = (longURL, userId) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = {
    longURL: longURL,
    userID: userId,
    visit: 0,
    uniqueVisitor: new Set(),
    allVisits: [],
    createdOn: new Date().toString().replace(/G.+/, '')
  };

  return randomStr;
};

const getLongFromShort = (shortId) => {
  return urlDatabase[shortId].longURL;
};

const getAllVisitorsFromShort = (shortId) => {
  return urlDatabase[shortId].allVisits;
};

const editOrDeleteURL = (userId, shortId, newLong, type) => {
  const shortenedLinks = urlsForUser(userId);

  if (shortId in shortenedLinks) {
    if (type === "edit") {
      urlDatabase[shortId].longURL = newLong;
    } else if (type === "delete") {
      delete urlDatabase[shortId];
    }
    return true;
  }

  return false;
};

const trackingAnalytics = (shortId, userIdForTimestamp, uniqueSiteUserId) => {
  if (urlDatabase[shortId]) {
    urlDatabase[shortId].allVisits.push({
      timestamp: (new Date()).toString(),
      userId: userIdForTimestamp
    });

    urlDatabase[shortId].uniqueVisitor.add(uniqueSiteUserId);
    urlDatabase[shortId].visit = ("visit" in urlDatabase[shortId]) ? urlDatabase[shortId].visit + 1 : 1;
    return {error: null, data: urlDatabase[shortId].longURL};
  }

  return {error: "Error in performing tracking!", data: null};
};

module.exports = { urlsForUser, createShortLink, getLongFromShort, getAllVisitorsFromShort, editOrDeleteURL, trackingAnalytics };