

#' Assert jster app success
#'
#' Verify that all jster apps tested successfully
#' @param dt [data.frame()] of information returned from [run_jster()] or [run_jster_apps()]
#' @export
assert_jster <- function(dt) {
  testthat::expect_s3_class(dt, "data.frame")
  testthat::expect_true(all(c("appDir", "successful", "returnValue") %in% names(dt)))

  not_successful <- !dt$successful

  if (any(not_successful)) {
    fail_dt <- dt[not_successful, ]
    str(as.list(fail_dt))
    stop("\nshinyjster - Failing apps:\n", paste0("shinyjster - * ", fail_dt$appDir, collapse = "\n"))
  } else {
    message("shinyjster - Success! All apps pass")
  }

  invisible(dt)
}
