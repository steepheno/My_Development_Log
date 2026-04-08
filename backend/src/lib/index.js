/**
 * Sweetbook Node.js SDK
 *
 * Usage:
 *   const { SweetbookClient, verifySignature } = require('bookprintapi-nodejs-sdk');
 *
 *   const client = new SweetbookClient({ apiKey: 'SB...' });
 *   const book = await client.books.create({ bookSpecUid: 'SQUAREBOOK_HC', title: 'My Book' });
 */

const { SweetbookClient } = require('./client');
const { SweetbookApiError, SweetbookNetworkError, SweetbookValidationError, ResponseParser } = require('./core');
const { verifySignature } = require('./webhook');

module.exports = {
  SweetbookClient,
  SweetbookApiError,
  SweetbookNetworkError,
  SweetbookValidationError,
  ResponseParser,
  verifySignature,
};
