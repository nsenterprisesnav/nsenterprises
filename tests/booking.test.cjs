const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const booking = require('../assets/booking.js');
const valid = {
  name: 'Test Customer', phone: '+91 98765 43210', appliance: 'Microwave',
  brand: 'Other', issue: 'Not heating & keypad shows #1\nPlease inspect.',
  address: 'Flat 4, Test Street', maps: '', date: '2030-10-22',
  time: '8:30 AM – 11:00 AM'
};
test('required fields, whitespace, and optional values', () => {
  assert.deepEqual(booking.validate(valid, '2030-10-22'), {});
  for (const key of ['name','phone','appliance','issue','address','date','time']) {
    assert.ok(booking.validate({...valid, [key]: '  '}, '2030-10-22')[key]);
  }
  assert.deepEqual(booking.validate({...valid, brand: '', maps: ''}, '2030-10-22'), {});
});
test('Indian mobile number validation with optional country code', () => {
  for (const phone of ['9876543210', '+91 98765 43210', '919876543210', '(98765) 43210']) {
    assert.equal(booking.validate({...valid, phone}, '2030-10-22').phone, undefined);
  }
  for (const phone of ['12345', '1234567890', '98765432100', 'abcdefghij', '+1 9876543210']) {
    assert.ok(booking.validate({...valid, phone}, '2030-10-22').phone);
  }
});
test('local calendar date, past dates, and impossible dates', () => {
  assert.equal(booking.today(new Date(2030, 0, 2, 0, 1)), '2030-01-02');
  for (const date of ['2030-10-21', '2030-02-30', 'not-a-date']) {
    assert.ok(booking.validate({...valid, date}, '2030-10-22').date);
  }
  assert.equal(booking.validate({...valid, date:'2030-10-23'}, '2030-10-22').date, undefined);
});
test('dropdown and Google Maps validation', () => {
  for (const key of ['appliance', 'brand', 'time']) assert.ok(booking.validate({...valid,[key]:'Invalid'}, '2030-10-22')[key]);
  for (const maps of ['https://maps.app.goo.gl/example', 'https://www.google.com/maps?q=Hyderabad', 'https://maps.google.com/?q=Hyderabad']) {
    assert.equal(booking.validate({...valid,maps}, '2030-10-22').maps, undefined);
  }
  for (const maps of ['javascript:alert(1)', 'https://google.com.evil.test/maps', 'not a URL']) assert.ok(booking.validate({...valid,maps}, '2030-10-22').maps);
});
test('formatted message and encoding preserve user values and Unicode', () => {
  const v = {...valid, name:'Customer & Family', issue:'శబ్దం / noise? 50% #check + literal %20\nSecond line', maps:'https://www.google.com/maps?q=A%20B&label=Home#pin'};
  const url = new URL(booking.whatsappUrl(v));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/919493984204');
  assert.notEqual(url.pathname.slice(1), booking.normalizePhone(v.phone));
  const message = url.searchParams.get('text');
  assert.equal(message, booking.message(v));
  assert.ok(!/\p{Extended_Pictographic}/u.test(message));
  assert.ok(!message.includes("\uFFFD"));
  assert.ok(!message.includes("\\*"));
  for (const value of Object.values(v)) assert.ok(message.includes(value));
  assert.ok(message.startsWith('*NEW SERVICE REQUEST*\n\n━━━━━━━━━━━━━━━━━━'));
  assert.equal(booking.whatsappUrl(v), `https://wa.me/919493984204?text=${encodeURIComponent(message)}`);
  assert.ok(message.endsWith('Please contact the customer to confirm the service visit.'));
  assert.ok(booking.message(valid).includes('*Maps:* Not provided'));
  assert.equal([...url.searchParams].length, 1);
});
test('invalid destination configuration fails safely', () => {
  for (const phone of ['', '+919493984204', '91 9493984204', 'abc']) assert.throws(() => booking.whatsappUrl(valid, phone), /temporarily unavailable/);
});
test('missing optional fields preserve the complete formatted message after one decode', () => {
  for (const missing of ['', undefined]) {
    const values = {...valid, brand: missing, maps: missing};
    const decoded = new URL(booking.whatsappUrl(values)).searchParams.get('text');
    assert.equal(decoded, `*NEW SERVICE REQUEST*

━━━━━━━━━━━━━━━━━━
*Appliance:* Microwave
*Issue:* Not heating & keypad shows #1
Please inspect.
━━━━━━━━━━━━━━━━━━

*Customer:* Test Customer
*Phone:* +91 98765 43210
*Location:* Flat 4, Test Street
*Maps:* Not provided
*Brand:* Not provided

━━━━━━━━━━━━━━━━━━
*Preferred Date:* 2030-10-22
*Preferred Time:* 8:30 AM – 11:00 AM

Please contact the customer to confirm the service visit.`);
  }
});
test('source files are valid UTF-8 and HTML declares the encoding', () => {
  const root = path.join(__dirname, '..');
  const decoder = new TextDecoder('utf-8', {fatal: true});
  function check(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      if (entry.name.startsWith('.')) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { check(file); continue; }
      if (!/\.(?:html|js|cjs|css|json|webmanifest|xml|svg|txt|md)$/.test(file)) continue;
      const source = decoder.decode(fs.readFileSync(file));
      assert.ok(!source.includes('\ufffd'), `${file} contains replacement characters`);
      assert.ok(!/\u00f0\u0178|\u00e2\u20ac|\u00ef\u00bf\u00bd/.test(source), `${file} contains mojibake`);
      if (file.endsWith('.html')) {
        assert.match(source, /<meta charset="UTF-8">/i);
        if (source.includes('booking.js')) assert.match(source, /booking\.js\?v=\d+" charset="utf-8"/);
      }
    }
  }
  check(root);
});
test('WhatsApp redirection detaches opener and handles blockers', () => {
  const url = booking.whatsappUrl(valid);
  let destination;
  const tab = {opener: {}, location: {replace(value) { destination=value; }}};
  assert.equal(booking.openWhatsApp(url, (initial,target) => { assert.equal(initial,'about:blank'); assert.equal(target,'_blank'); return tab; }),true);
  assert.equal(tab.opener,null);
  assert.equal(destination,url);
  assert.equal(booking.openWhatsApp(url, () => null),false);
  assert.equal(booking.openWhatsApp(url, () => { throw new Error('Blocked'); }),false);
});
test('all existing booking entry points load the shared popup', () => {
  const root=path.join(__dirname,'..');
  const files=['index.html', ...fs.readdirSync(path.join(root,'services')).filter(f=>f.endsWith('.html')).map(f=>'services/'+f)];
  let triggers=0;
  for(const file of files) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(html.includes('booking.js'));
    assert.ok(html.includes('data-book-service'));
    assert.ok(!html.includes('href="https://wa.me/'), `${file} bypasses the booking form`);
    triggers+=(html.match(/data-book-service/g)||[]).length;
  }
  assert.ok(triggers > 8);
  assert.ok(!fs.readFileSync(path.join(root,'assets/script.js'),'utf8').includes('window.open'));
});
