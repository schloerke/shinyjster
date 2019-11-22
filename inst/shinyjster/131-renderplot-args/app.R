library(shiny)
library(shinyjster)
​
ui <- withTags(fluidPage(
  h3("Test of additional renderPlot args"),
  p("TODO: automate resizing - need to do in separate window."),
  ol(
    li("The background of the plot should be the same color as the page background."),
    li("Try resizing the browser's width, make sure it's transparent even after redraw.")
  ),
  style("body { background-color: #A3E4D7; }"),
  plotOutput("plot"),
​
  shinyjster_js(set_timeout = FALSE, "
    console.log('hey')

    // Given an img tag object, return the proportion of pixels that have zero
    // alpha.
    function proportion_transparent(img) {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, img.width, img.height);

      var imageData = context.getImageData(0, 0, img.width, img.height);
      var data = imageData.data;

      // Count number of pixels with zero alpha
      var zeros = 0;
      for(var i = 0, n = data.length; i < n; i += 4) {
        var alpha = data[i + 3];
        if (alpha == 0) {
          zeros++;
        }
      }

      // Proportion of zero to non-zero-alpha pixels.
      return zeros / (data.length/4);
    }

    var jst = jster();
    jst.add(Jster.shiny.waitUntilIdle);

    jst.add(function() {
      var img = $('#plot img')[0];
      if (proportion_transparent(img) <= 0.95) {
        throw 'Plot is not >= 95% transparent.';
      }
    });

    jst.test();
  ")
))
​
server <- function(input, output, session) {
  shinyjster_server(input, output, session)
​
  output$plot <- renderPlot({
    par(bg = NA)
    plot(cars)
  }, bg = NA)
}
​
shinyApp(ui, server)
