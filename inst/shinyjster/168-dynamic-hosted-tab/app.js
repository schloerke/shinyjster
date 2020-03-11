const timeout = 250;
// do something every X ms
const do_fns = function(arr, callback) {
  const fns = [].concat(arr);

  var try_exec = function() {
    // if no fns to call, return
    if (fns.length == 0) {
      callback(null, true);
      return;
    }
    // get first element
    const fn = fns.shift();

    fn(function() {
      // display progress
      $(progress).text($(progress).text() + ".");
      // try to exec more fns
      setTimeout(try_exec, timeout);
    });
  };

  try_exec();
};

// wait until dom is ready
$(function() {
  // counter to add active tab number

  let counter = 0;
  const fns = [
    // init working tabs
    function(done) {
      $("#add").click();
      done();
    },
    function(done) {
      $("#add").click();
      done();
    },
    function(done) {
      $("#add").click();
      done();
    },

    // click tabs to cause error state
    function(done) {
      const clicks = $("#tabs a")
        .get()
        .map(function(el) {
          return function(done) {
            $(el).click();
            done();
          };
        });

      do_fns(clicks, done);
    },

    // add "broken" tabs
    function(done) {
      $("#add").click();
      done();
    },
    function(done) {
      $("#add").click();
      done();
    },
    function(done) {
      $("#add").click();
      done();
    },
    function(done) {
      $("#add").click();
      done();
    },

    // calculate value of active tab to get sum to check if working
    function(done) {
      const clicks = $("#tabs a")
        .get()
        .map(function(el) {
          return function(done) {
            const checks = [
              function(done) {
                $(el).click();
                done();
              },
              function(done) {
                // get number from active pane.
                const val = $(".tab-pane.active .val").text() - 0;

                counter = counter + val;
                done();
              },
            ];

            do_fns(checks, done);
          };
        });

      do_fns(clicks, done);
    },

    // verify the tabs work
    function(done) {
      let sum = 0;
      const len = $(".tab-pane").get().length;

      for (let i = 0; i < len; i++) {
        sum += i;
      }

      if (counter == sum) {
        $("#result")
          .css("background-color", "#7be092")
          .text("Pass");
      } else {
        $("#result")
          .css("background-color", "#e07b7b")
          .text("FAILED!\nCounted a sum of " + counter + " vs " + sum);
      }
    },
  ];

  // test!
  do_fns(fns);
});
