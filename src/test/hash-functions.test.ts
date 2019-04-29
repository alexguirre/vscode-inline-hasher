import * as assert from 'assert';

import * as hash from '../hash-functions';

suite("Hash Functions Tests", function () {
    test("joaat", function () {
        assert.equal(hash.joaat(""), 0x00000000);
        assert.equal(hash.joaat("TesT"), 0x18488CFF);
        assert.equal(hash.joaat("test"), 0x3F75CCC1);
        assert.equal(hash.joaat("TEST"), 0xAD665078);
    });

    test("joaatLowerCase", function () {
        assert.equal(hash.joaatLowerCase(""), 0x00000000);
        assert.equal(hash.joaatLowerCase("TesT"), 0x3F75CCC1);
        assert.equal(hash.joaatLowerCase("test"), 0x3F75CCC1);
        assert.equal(hash.joaatLowerCase("TEST"), 0x3F75CCC1);
    });

    test("joaatUpperCase", function () {
        assert.equal(hash.joaatUpperCase(""), 0x00000000);
        assert.equal(hash.joaatUpperCase("TesT"), 0xAD665078);
        assert.equal(hash.joaatUpperCase("test"), 0xAD665078);
        assert.equal(hash.joaatUpperCase("TEST"), 0xAD665078);
    });
});