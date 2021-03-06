% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/init.R
\name{shinyjster_js}
\alias{shinyjster_js}
\title{Shiny JavaScript helper}
\usage{
shinyjster_js(..., set_timeout = TRUE)
}
\arguments{
\item{...}{JavaScript text to be put in a script.}

\item{set_timeout}{If \code{TRUE} (default), the JavaScript provided is executed 250 milliseconds after the document is ready.  Otherwise, code is included as is.}
}
\description{
Function to be called first inside the definition of the Shiny UI.
}
\details{
This function also includes \code{\link[=shinyjster_ui]{shinyjster_ui()}} and wraps all JavaScript using \code{\link[=js_script]{js_script()}}.
}
