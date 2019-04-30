import * as assert from 'assert';

import * as hash from '../hash-functions';

suite("Hash Functions Tests", function () {
    test("joaat", function () {
        assert.equal(hash.joaat(""), 0x00000000);
        assert.equal(hash.joaat("TesT"), 0x18488CFF);
        assert.equal(hash.joaat("test"), 0x3F75CCC1);
        assert.equal(hash.joaat("TEST"), 0xAD665078);
    });

    test("elf", function () {
        assert.equal(hash.elf(""), 0x00000000);
        assert.equal(hash.elf("TesT"), 0x0005AC84);
        assert.equal(hash.elf("test"), 0x0007ACA4);
        assert.equal(hash.elf("TEST"), 0x00058A84);
    });
});