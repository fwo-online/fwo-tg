/* eslint-disable no-undef */
const assert = require('assert');
const TelegrafTest = require('telegraf-test');

const keyboards = require('./keyboards');
const messages = require('./messages');

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
    assert.equal(response.data.text, messages.enter);
    expect(response.data.reply_markup).toEqual(keyboards.create.reply_markup);
  });

  it('Create character', async () => {
    const response = await test.sendCallbackQueryWithData('create');
    assert.equal(response.data.text, messages.create);
    expect(response.data.reply_markup).toEqual(keyboards.profButtons.reply_markup);
  });

  it('Select character', async () => {
    const prof = 'Mage';
    const response = await test.sendCallbackQueryWithData(`select_${prof}`);
    assert.equal(response.data.text, messages.select(prof));
    expect(response.data.reply_markup).toEqual(keyboards.select.reply_markup);
  });

  it('Select character back', async () => {
    const response = await test.sendCallbackQueryWithData('back');
    assert.equal(response.data.text, messages.back);
    expect(response.data.reply_markup).toEqual(keyboards.profButtons.reply_markup);
  });

  it('Select character approve', async () => {
    const response = await test.sendCallbackQueryWithData('select');
    assert.equal(response.data.text, messages.selectDone);
    expect(response.data.reply_markup).toEqual(keyboards.empty.reply_markup);
  });
});
