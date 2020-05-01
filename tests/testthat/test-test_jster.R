
test_that("each test app has a test file", {
  lapply(
    dir(system.file("shinyjster", package = "shinyjster"), full.names = TRUE),
    function(appDir) {
      test_file <- file.path(appDir, "tests", "shinyjster.R")
      expect_true(file.exists(test_file))
    }
  )
})
