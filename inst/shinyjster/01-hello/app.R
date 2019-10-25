library(shiny)
library(shinyjster)

ui <- fluidPage(
  
  titlePanel("Button Example - Do NOT Touch application"),

  sidebarLayout(

    sidebarPanel(
      actionButton("button", "Do not click me")
    ),

    mainPanel(
      verbatimTextOutput("number")
    )
  ),

  # include shinyjster JS at end of UI definition
  shinyjster_js(
    "var jst = jster(500)", # execute every 500 ms
    "jst.add(function(done) { $('#button').click(); done() });",
    "jst.add(function(done) { $('#button').click(); done() });",
    "jst.add(function(done) { $('#button').click(); done() });",
    "jst.add(function(done) { if ($('#number').text() == '3') done(); throw 'text does not equal 3' });",
    "jst.test()"
  )

)

server <- function(input, output, session) {

  # include shinyjster_server call at top of server definition
  shinyjster_server(input, output, session)

  output$number <- renderText({
    input$button
  })
}

# Create Shiny app ----
shinyApp(ui = ui, server = server)
