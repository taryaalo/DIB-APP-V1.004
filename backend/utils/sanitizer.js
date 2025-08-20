const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const sanitize = (dirty) => {
  return purify.sanitize(dirty);
};

module.exports = {
  sanitize,
};
