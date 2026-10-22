const test = require('node:test');
const assert = require('node:assert/strict');
const feedback = require('../assets/feedback.js');
const booking = require('../assets/booking.js');

test('feedback requires a name, appliance and nonblank review', () => {
  assert.deepEqual(Object.keys(feedback.validate({})), ['name', 'appliance', 'review']);
  assert.ok(feedback.validate({name:'Customer',appliance:'Chimney',review:'   '}).review);
  assert.deepEqual(feedback.validate({name:'Customer',appliance:'Chimney',review:'Helpful service'}), {});
});
test('feedback reaches business number and preserves punctuation and Unicode', () => {
  const values = {name:'Test & Family',appliance:'Hob / Gas stove',review:'Thank you! 100% helpful.\n\u{1f44d}'};
  const url = new URL(booking.messageUrl(feedback.message(values)));
  assert.equal(url.pathname, '/919493984204');
  assert.equal(url.searchParams.get('text'), feedback.message(values));
  for (const value of Object.values(values)) assert.ok(url.searchParams.get('text').includes(value));
  assert.equal([...url.searchParams].length,1);
  assert.ok(!url.searchParams.get('text').includes('NEW SERVICE REQUEST'));
});
