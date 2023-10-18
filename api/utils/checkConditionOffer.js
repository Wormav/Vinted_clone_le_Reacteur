const maxCharTitle = (title) => {
  if (title.length > 50) {
    return false;
  }
  return true;
};

const maxCharDescription = (description) => {
  if (description.length > 500) {
    return false;
  }
  return true;
};

const maxPrice = (price) => {
  if (price > 100000) {
    return false;
  }
  return true;
};

module.exports = { maxCharTitle, maxCharDescription, maxPrice };
