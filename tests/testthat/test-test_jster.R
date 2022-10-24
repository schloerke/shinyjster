
lapply(
  dir(system.file("shinyjster", package = "shinyjster"), full.names = TRUE),
  function(appDir) {
    test_that(paste0(basename(appDir), " test app has a test file"), {
      test_file <- file.path(appDir, "tests", "testthat", "test-shinyjster.R")
      expect_true(file.exists(test_file))
    })
  }
)
