import { $ } from "../globals";

function click(id: string, callback: (error, value) => void) {
  const href = $("#" + id).attr("href");

  $.get({
    url: href,
    success: (value) => {
      callback(null, value);
    },
  }).fail((req, textStatus, errorThrown) => {
    callback({ req, textStatus, errorThrown }, null);
  });
}

export { click };
