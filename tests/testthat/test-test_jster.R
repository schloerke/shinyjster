
test_that("each test app has a test file", {
  lapply(
    dir(system.file("shinyjster", package = "shinyjster"), full.names = TRUE),
    function(appDir) {
      test_file <- file.path(appDir, "tests", "shinyjster.R")
      expect_true(file.exists(test_file))
    }
  )
})

test_that("headless browsers work", {

  skip_on_cran()

  tests <- lapply(
    dir(system.file("shinyjster", package = "shinyjster"), full.names = TRUE),
    function(appDir) {
      test_jster(
        c(
          selenium_chrome(headless = TRUE),
          selenium_firefox(headless = TRUE),
          if (platform() == "win") c(
            selenium_edge(),
            selenium_ie()
          )
        ),
        appDir = appDir, assert = FALSE)
    }
  )

  test_dt <- do.call(rbind, tests)
  test_dt <- test_dt[!grepl("-fail", test_dt$appDir), ]
  expect_silent({
    assert_jster(test_dt)
  })
})
