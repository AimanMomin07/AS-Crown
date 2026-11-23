export function exportToCsv(
  filename:
    string,
  rows:
    Record<string, unknown>[]
) {

  if (
    !rows.length
  ) {

    return;

  }


  const columns =
    Object.keys(
      rows[0]
    );


  const escapeValue = (
    value:
      unknown
  ) => {

    const text =
      value ===
      null ||
      value ===
      undefined
        ? ""
        : String(
            value
          );


    return `"${text.replace(
      /"/g,
      '""'
    )}"`;

  };


  const csv = [

    columns
      .map(
        escapeValue
      )
      .join(","),

    ...rows.map(
      row =>
        columns
          .map(
            column =>
              escapeValue(
                row[
                  column
                ]
              )
          )
          .join(",")
    )

  ].join(
    "\n"
  );


  const blob =
    new Blob(
      [
        "\uFEFF" +
        csv
      ],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  URL.revokeObjectURL(
    url
  );

}