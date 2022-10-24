#' Test shinyjster on all browsers for shinycoreci
#'
#' This method will test a single application on all of the available browsers
#' shinyjster can test with on the given platform. For each browser, the app
#' will be tested using [test_jster()].
#'
#' This method should be called from a test file in the `./tests/testthat/` directory.
#'
#' For each browser, a new `testthat::test_that()` test will be run. This allows
#' for browsers to not effect the other tests.
#'
#' @param test_name suffix to add to the test name for `testthat::test_that(NAME, {})`
#' @param app_dir Defaults the app in the directory above
#' @param browsers Names of each browser to be tested.
#' @param timeout,dimensions Parameters to be supplied to each browser
#' @seealso [test_jster()]
#' @export
testthat_shinyjster <- function(
  test_name = NULL,
  app_dir = "../../",
  ...,
  browsers = c("chrome", "firefox", "edge", "ie"),
  timeout = 2 * 60,
  dimensions = "1200x1200"
) {

  browsers <- unique(match.arg(browsers, several.ok = TRUE))

  app_name <- basename(normalizePath(app_dir))
  name <- paste0(app_name, " - shinyjster - ")
  suffix <- if (!is.null(test_name)) paste0(" - ", test_name) else ""

  ret <- list()

  lapply(browsers, function(browser) {
    testthat::test_that(paste0(name, browser, suffix), {
      if (browser == "edge") testthat::skip("Not testing Edge browser")
      if (browser %in% c("edge", "ie") && !is_windows()) testthat::skip("Only testing Edge or IE on Windows")

      # Temp workaround while mac firefox apps don't complete in time
      if (browser == "firefox" && is_mac()) testthat::skip("Not testing Firefox on macOS")
      # https://github.com/schloerke/shinyjster/pull/58
      if (browser == "firefox") testthat::skip("Not testing Firefox due to WebDriver issues. Firefox fails to start")

      browser_func <- switch(browser,
        chrome = selenium_chrome(timeout = timeout, dimensions = dimensions),
        firefox = selenium_firefox(timeout = timeout, dimensions = dimensions),
        edge = selenium_edge(timeout = timeout, dimensions = dimensions),
        ie = selenium_ie(timeout = timeout, dimensions = dimensions),
        stop("Unknown browser: ", browser)
      )

      test_jster(apps = app_dir, browsers = browser_func, type = "lapply")
    })
  })
}
