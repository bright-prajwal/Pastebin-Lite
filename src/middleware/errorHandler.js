
function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", err);
  } else {
    console.error("Error:", err.message);
  }

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;

  let message = err.message || "Internal server error";

  if (err.type === "validation") {
    statusCode = 400;
    message = err.message || "Validation error";
  }

  if (req.path && req.path.startsWith("/api/")) {
    return res.status(statusCode).json({
      error: message,
    });
  }

  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error ${statusCode}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>Error ${statusCode}</h1>
      <p>${escapeHtml(message)}</p>
    </body>
    </html>
  `);
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}


function notFoundHandler(req, res, next) {
  const statusCode = 404;
  const message = "Not found";

  if (req.path && req.path.startsWith("/api/")) {
    return res.status(statusCode).json({
      error: message,
    });
  }

  res.status(statusCode).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Not Found</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>404 - Not Found</h1>
    </body>
    </html>
  `);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
