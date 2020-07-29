module.exports = (base, baseName, numRecords) => {
    base(baseName)
        .select({
            // Selecting the first 3 records in Main View:
            maxRecords: numRecords,
            view: "Main View",
        })
        .eachPage(
            function page(records, fetchNextPage) {
                // This function (`page`) will get called for each page of records.

                records.forEach((record) => {
                    console.log(`Project = ${record.get("Name")} | ID = ${record.getId()}`);
                });

                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.
                fetchNextPage();
            },
            function done(err) {
                if (err) {
                    console.error(err);
                    return;
                }
            }
        );
};
