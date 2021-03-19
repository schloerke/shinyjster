

#' Create Shinyjster test file
#'
#' This creates a testing file to be used with `shiny::runTests('.')`.  It will call [test_jster()] which will cycle through all avaiable shinyjster selenium browsers.
#'
#' @param appDir Location of shiny application to test
#' @seealso [test_jster()]
#' @export
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
#' For each browser, each app will be tested using [run_jster_apps()].
#'
#' @inheritParams run_jster_apps
#' @param apps Defaults the app in the directory above
#' @param browsers By default, as many browsers as selenium support on the given platform
#' @param assert A logical value that determines if [assert_jster()] should be called on the return value
#' @seealso [run_jster()], [use_jster()]
#' @return A data frame with the columns `appDir`, `successful`, `returnValue`, and `browser`. One row of information per `browser` and `apps` combination.
#' @export
test_jster <- function(
  apps = "../",
  browsers = c(
    selenium_chrome(),
    selenium_firefox(),
    if (platform() == "win" || platform() == "mac") c(
      selenium_edge()
    ),
    if (platform() == "win") c(
      selenium_ie()
    ),
    if (platform() == "mac") c(
      selenium_safari()
    )
  ),
  # callr is not available. Allows for each app to be run separately and wrapped in a tryCatch
  type = c("serial", "lapply"),
  assert = TRUE,
  host = "127.0.0.1",
  port = NULL
) {

  apps <- normalizePath(apps)
  type <- match.arg(type)

  if (is.function(browsers)) {
    browsers <- list(browsers)
  }
  if (!is.list(browsers)) {
    stop("`browsers` must be a list of functions")
  }

  mapply(browsers, seq_along(browsers), FUN = function(browser_func, i) {
    if (!is.function(browser_func)) {
      stop("`browsers[[", i, "`]]` is not a function")
    }
  })

    if (is.function(browsers)) {
    browsers <- list(browsers)
  }
  if (!is.list(browsers)) {
    stop("`browsers` must be a list of functions")
  }


  # for each browser,
  app_ret <- lapply(
    browsers,
    function(browser_fn) {
      ret_list <- lapply(apps, function(app) {
        tryCatch({
          # test in separate R session
          run_jster_apps(
            apps = app,
            browser = browser_fn,
            host = host,
            port = port,
            type = type
          )
        }, error = function(e) {
          # return an error
          tibble::tibble(
            appDir = app,
            successful = FALSE,
            returnValue = list(e)
          )
        })
      })
      ret <- do.call(rbind, ret_list)
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

# Test all apps stored in ./inst/shinyjster on all apps
## TODO use shiny::runTests(appDir) once shiny v1.5.0 is published
test_jster_internal <- function(assert = TRUE) {

  test_dt <-
    test_jster(
      dir(system.file("shinyjster", package = "shinyjster"), full.names = TRUE),
      browsers = c(
        selenium_chrome(headless = TRUE),
        selenium_firefox(headless = TRUE),
        if (platform() == "win" || platform() == "mac") c(
          selenium_edge()
        ),
        if (platform() == "win") c(
          selenium_ie()
        ),
        if (platform() == "mac") c(
          selenium_safari()
        )
      ),
      assert = FALSE
    )

  test_dt <- test_dt[!grepl("-fail", test_dt$appDir), ]
  if (isTRUE(assert)) {
    assert_jster(test_dt)
  }

  invisible(test_dt)
}
