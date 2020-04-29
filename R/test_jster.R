

#' Create Shinyjster test file
#'
#' This creates a testing file to be used with `shiny::runTests('.')`.  It will call [test_jster()] which will cycle through all avaiable shinyjster selenium browsers.
#'
#' @param appDir Location of shiny application to test
#' @seealso [test_jster()]
use_jster <- function(appDir = ".") {

  test_path <- file.path(appDir, "tests")
  if (!dir.exists(test_path)) {
    message("Creating ", test_path)
    dir.create(test_path)
  }
  shinyjster_test_file <- file.path(test_path, "shinyjster.R")

  if (file.exists(shinyjster_test_file)) {
    stop(shinyjster_test_file, " already exists")
  }

  message("Creating ", shinyjster_test_file)
  cat("\nshinyjster::test_jster()\n", file = shinyjster_test_file)

  message("\nTo test this file, call `shiny::runTests('", appDir, "')`")
  invisible(shinyjster_test_file)
}



#' Test shinyjster app on all browsers
#'
#' This method will test your shiny application using the shinyjster code you have provided on all of the available browsers shinyjster can test with on the given platform.
#' Each app will be ran in a separate R session using `run_jster_apps(type = 'serial')`.
#'
#'
#' @param browsers By default, as many browsers as selenium support on the given platform
#' @param appDir Defaults the app in the directory above
#' @param assert A logical value that determines if the result should be validate if the return value passes all tests
#' @param host,port Used when running the shiny application
#' @seealso [run_jster()], [use_jster()]
#' @return A data frame with the columns `appDir`, `successful`, `returnValue`, and `browser`. One row of information per `browser`.
test_jster <- function(
  browsers = c(
    selenium_chrome(),
    selenium_firefox(),
    if (platform() == "win") c(
      selenium_edge(),
      selenium_ie()
    )
  ),
  appDir = "../",
  assert = TRUE,
  host = "127.0.0.1",
  port = NULL
) {

  appDir <- normalizePath(appDir)

  # for each browser,
  app_ret <- lapply(
    browsers,
    function(browser_fn) {
      ret <- tryCatch({
        # test in separate R session
        run_jster_apps_serial(
          apps = appDir,
          browser = browser_fn,
          host = host,
          port = port
        )
      }, error = function(e) {
        # return an error
        tibble::tibble(
          appDir = appDir,
          successful = FALSE,
          returnValue = list(e)
        )
      })
      # store the browser name
      name <- attr(browser_fn, "browser")
      if (is.null(name)) name <- "unknown_browser"
      ret$browser <- name
      ret
    }
  )

  ret <- do.call(rbind, app_ret)

  if (isTRUE(assert)) {
    assert_jster(ret)
  }

  ret
}
