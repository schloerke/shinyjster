jster_message <- function(..., cat = FALSE) {
  if (cat) {
    cat("shinyjster - ", ..., "\n", sep = "")
  } else {
    message("shinyjster - ", ...)
  }
}
