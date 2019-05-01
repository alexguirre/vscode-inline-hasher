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

    test("fnv1", function () {
        assert.equal(hash.fnv1(""), 0x811C9DC5);
        assert.equal(hash.fnv1("TesT"), 0x21329F69);
        assert.equal(hash.fnv1("test"), 0xBC2C0BE9);
        assert.equal(hash.fnv1("TEST"), 0x40E31FE9);
    });

    test("fnv1a", function () {
        assert.equal(hash.fnv1a(""), 0x811C9DC5);
        assert.equal(hash.fnv1a("TesT"), 0x4FFCF065);
        assert.equal(hash.fnv1a("test"), 0xAFD071E5);
        assert.equal(hash.fnv1a("TEST"), 0xB2D739E5);
    });
});