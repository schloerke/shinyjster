
#' shinyjster HTML Dependencies
#'
#' @return [htmltools::htmlDependency]'s to allow shinyjster to function.
#' @export
shinyjster_js_dependencies <- function() {
  list(
    htmltools::htmlDependency(
      name = "shinyjster-assets",
      version = packageVersion("shinyjster"),
      package = "shinyjster",
      src = "assets",
      script = "js/shinyjster.js"
    )
  )
}

# ~ htmlwidgets::JS
JS <- function(...) {
  x <- c(...)
  if (is.null(x)) {
    return()
  }
  if (!is.character(x)) {
    stop("The arguments for JS() must be a character vector")
  }
  x <- paste(x, collapse = "\n")
  htmltools::HTML(x) # return HTML code, not a JS structure
}

#' JavaScript helper
#'
#' Wraps supplied text in an `htmltools::tags$script` call after turning it into `JS` code.
#'
#' @param ... JavaScript text to be put in a script.
#' @export
js_script <- function(...) {
  htmltools::tags$script(JS(...))
}





#' Shiny UI helper
#'
#' Function to be called first inside the definition of the Shiny UI.
#'
#' This function will add the shinyjster JS dependencies and add a text based progress bar in the bottom left corner of the application.
#'
#' @export
shinyjster_ui <- function() {
  htmltools::tagList(
    shinyjster_js_dependencies(),
    htmltools::tags$div(
      id = "shinyjster_progress",
      style = "position: absolute; left: 0px; bottom: 0px; padding: 5px;",
      "shinyjster - ", htmltools::tags$span(id = "shinyjster_progress_val")
    )
  )
}

#' Shiny JavaScript helper
#'
#' Function to be called first inside the definition of the Shiny UI.
#'
#' This function also includes [shinyjster_ui()] and wraps all JavaScript using [js_script()].
#'
#' @param ... JavaScript text to be put in a script.
#' @param set_timeout If `TRUE` (default), the JavaScript provided is executed 250 milliseconds after the document is ready.  Otherwise, code is included as is.
#' @export
shinyjster_js <- function(..., set_timeout = TRUE) {
  js <- if (isTRUE(set_timeout)) {
    c(
      "$(function() {

        if (Jster.getParameterByName('shinyjster') !== '1') {
          return;
        }

        setTimeout(
          function(){",
            ...,
      "   },
          250
        )
      });"
    )
  } else {
    c(
      "(function() {

        if (Jster.getParameterByName('shinyjster') !== '1') {
          return;
        }",
            ...,
      "
      })();"
    )
  }

  htmltools::tagList(
    shinyjster_ui(),
    js_script(js)
  )
}


#' Shiny server helper
#'
#' Function to be called within the shiny server
#' @param input,output,session Shiny server function parameters
#' @importFrom utils packageVersion str
#' @export
shinyjster_server <- function(input, output, session) {

  jster_return_val <- list(
    type = "success"
  )

  # shiny::observe({
  #   str(shiny::reactiveValuesToList(input))
  # })

  shiny::observeEvent(input$jster_progress, {
    jster_message(input$jster_progress)
  })

  shiny::observeEvent(input$jster_done, {
    val <- input$jster_done
    # str(val)

    close_broser_window <- function(...) {
      jster_message(..., "Closing Browser window")
      session$sendCustomMessage("shinyjster_msg_close_window", TRUE)
    }

    if (identical(val$type, "success")) {
      close_broser_window("Success! ")
    } else {
      # error found
      jster_return_val$type <<- "error"
      jster_return_val$error <<- val$error

      error_msg <- paste0(
        capture.output({
          if (all(c("x", "y", "message") %in% names(val$error))) {
            cat(
              "msg: ", val$error$message,
              "\nx: ", val$error$x,
              "\ny: ", val$error$y,
              "\nxStr: ", val$error$xStr,
              "\nyStr: ", val$error$yStr,
              sep = "")
          } else {
            str(val$error)
          }
        }),
        collapse = "\n\t"
      )

      jster_message("JS error found! Error:\n\t", error_msg)
      if (interactive()) {
        ans <- utils::menu(
          choices = c("yes", "no"),
          graphics = FALSE,
          title = "shinyjster - Error found! Keep shiny app alive?"
        )
        if (ans == "2") {
          close_broser_window("Error found! ")
        } else {
          message("(Broken test app must now be stopped manually)")
        }
      } else {
        close_broser_window("Error found! ")
      }
    }
  })

  shiny::observeEvent(input$jster_closing_window, {
    jster_message("Browser window has been closed. Stopping Shiny Application now.")
    shiny::stopApp(jster_return_val)
  })
}
