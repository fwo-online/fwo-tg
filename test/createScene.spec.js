/* eslint-disable no-undef */
const TelegrafTest = require('telegraf-test');
const assert = require('assert');

const messages = require('../src/messages');

const test = new TelegrafTest({
  url: 'http://127.0.0.1:3000/test',
});

test.setUser({
  id: 1234,
  username: '@Spaider',
});

describe('Create scene test', () => {
  it('Create scene hello message', async () => {
    const response = await test.sendMessageWithText('/start');
    assert.equal(response.data.text, messages.create.enter);
  });
});
