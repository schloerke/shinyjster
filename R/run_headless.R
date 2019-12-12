#' Run many applications with shinyjster enabled
#'
#' @inheritParams run_jster
#' @param debug_port Port for chrome debugger
#' @param browser Browser to be set for testing.  If using `"chrome"` or `"firefox"`, the system application will be used.
#' @param assert Logical which determines if [assert_jster] should be run on the final output
#' @rdname run_headless
#' @export
run_headless <- function(
  apps = apps_to_test(),
  port = 8000,
  host = "127.0.0.1",
  debug_port = NULL,
  browser = c("chrome", "firefox"),
  type = c("parallel", "callr", "lapply"),
  assert = TRUE
) {
  system <-
    if (.Platform[["OS.type"]] == "unix") {
      if (Sys.info()[["sysname"]] == "Darwin") {
        "macOS"
      } else {
        "Linux"
      }
    } else {
      "Windows"
    }

  if (is.null(debug_port)) {
    debug_port <- switch(browser[1],
      "chrome" = 9222,
      "firefox" = 9223,
      9221
    )
  }

  browser <- switch(
    # only match on the first element... avoids having to use missing or pmatch
    browser[1],
    "chrome" = paste0(
        switch(system,
          "macOS" = "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome",
          "Linux" = "google-chrome",
          stop("Google chrome not implemented for system: ", system)
        ),
        " --headless",
        " --disable-gpu",
        " --remote-debugging-port=", debug_port
    ),
    "firefox" = paste0(
      switch(system,
        "macOS" = "/Applications/Firefox.app/Contents/MacOS/firefox-bin",
        "Linux" = "firefox",
        stop("Firefox not implemented for system: ", system)
      ),
      " -P headless",
      " -headless", # it is a single dash
      " -new-tab",
      # https://developer.mozilla.org/en-US/docs/Tools/Remote_Debugging/Debugging_Firefox_Desktop
      # Note: in Windows, the start-debugger-server call will only have one dash:
      " --start-debugger-server ", debug_port
    ),
    # pass through
    browser
  )
  print(browser)
  op_browser <- getOption("browser")
  on.exit({
    options(browser = op_browser)
  }, add = TRUE)
  options(browser = browser)

  ret <- run_jster_apps(apps = apps, port = port, host = host, type = type)

  if (assert) {
    assert_jster(ret)
  } else {
    ret
  }
}
