import { jster } from "../index";
// import { do_fns } from "../index";

test("adds 1 + 2 to equal 3", (doneTest) => {
  const jst = jster();

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
    console.log(key, info);
    expect(info).toStrictEqual({
      type: "success",
      length: 4,
      value: 5,
    });
    expect(key).toBe("jster");

    doneTest();
  });
});
