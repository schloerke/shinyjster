import { jster } from "../jster";

const setInputMock = function(key: string, value: string): void {
  key + value;
  return;
};

test("basic jster works", (doneTest) => {
  const jst = jster(10);

  let val = 1;

  expect.assertions(9);

  jst.add((done) => {
    val += 2;
    expect(val).toBe(3);
    done(2);
  });
  jst.add((done, priorVal) => {
    expect(priorVal).toBe(2);
    val += 3;
    expect(val).toBe(6);
    done(3);
  });
  jst.add((done, priorVal) => {
    expect(priorVal).toBe(3);
    val += 4;
    expect(val).toBe(10);
    done(4);
  });
  jst.add((done, priorVal) => {
    expect(priorVal).toBe(4);
    val += 5;
    expect(val).toBe(15);
    done(5);
  });

  jst.test(function(key, info) {
    // console.log(key, info);
    expect(info).toStrictEqual({
      type: "success",
      length: 4,
      value: 5,
    });
    expect(key).toBe("jster_done");

    doneTest();
  });
});

test("tests can not be empty", () => {
  // expect(jst.test((key, value) => { return; })).toThrow("before executing")
  expect(() => {
    const jst = jster();

    jst.test(setInputMock);
  }).toThrow("before executing");
});

test("tests can not be added after testing", () => {
  expect(() => {
    const jst = jster();

    jst.add((done) => done());
    jst.test(setInputMock);
    jst.add((done) => done());
  }).toThrow("`this.test()` has already been called");
});

test("test can not be called after testing", () => {
  expect(() => {
    const jst = jster();

    jst.add((done) => done());
    jst.test(setInputMock);
    jst.test(setInputMock);
  }).toThrow("`this.test()` has already been called");
});

test("test can not be called after testing - async", (doneTest) => {
  const jst = jster(10);

  jst.add((done) => done());
  jst.test((key, value) => {
    expect(key + value).toBeTruthy();
    expect(() => {
      jst.test(setInputMock);
    }).toThrow("`this.test()` has already been called");
    doneTest();
    return;
  });
});
